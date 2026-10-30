import "server-only";
import { and, count, desc, eq, gte } from "drizzle-orm";
import { db } from "@/db";
import { orders, waMessages, type Order, type OrderStatus, type WaMessageKind } from "@/db/schema";
import { formatDate, toWaNumber } from "./format";
import { getSiteSettings } from "./settings";
import type { SiteSettings } from "./settings-schema";
import { sendWaMessage, waGatewayConfigured } from "./wa-gateway";

/** Konfirmasi ke nomor pelanggan yang sama paling sering sekali per jendela ini (formulir publik bisa disalahgunakan). */
const CUSTOMER_COOLDOWN_MS = 30 * 60_000;
/** Batas total konfirmasi pelanggan per jam, agar nomor gateway tidak diblokir WhatsApp karena spam. */
const CUSTOMER_HOURLY_LIMIT = 30;

const STATUS_TEMPLATE = {
  diproses: "waStatusDiproses",
  selesai: "waStatusSelesai",
  batal: "waStatusBatal",
} as const satisfies Partial<Record<OrderStatus, keyof SiteSettings>>;

const STATUS_TEXT: Record<OrderStatus, string> = { baru: "Baru", diproses: "Diproses", selesai: "Selesai", batal: "Batal" };

/** Isi {placeholder} pada template dengan data pesanan. Placeholder yang tidak dikenal dibiarkan apa adanya. */
export function renderTemplate(template: string, order: Order, settings: SiteSettings) {
  const values: Record<string, string> = {
    nama: order.name,
    ananda: order.childName ?? "",
    tanggal: order.eventDate ? formatDate(order.eventDate) : "(belum ditentukan)",
    paket: order.packageType,
    hewan: order.animal,
    status: STATUS_TEXT[order.status],
    situs: settings.siteName,
  };
  return template
    .replace(/\{(\w+)\}/g, (m, key: string) => values[key] ?? m)
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

/** Isi pesan pesanan untuk admin, juga dipakai sebagai teks tautan wa.me dari pelanggan. */
export function orderSummary(o: Pick<Order, "name" | "phone" | "childName" | "eventDate" | "packageType" | "animal" | "notes">) {
  return [
    `Nama: ${o.name}`,
    `No. WA: ${o.phone}`,
    o.childName && `Nama ananda: ${o.childName}`,
    o.eventDate && `Tanggal acara: ${o.eventDate}`,
    `Paket: ${o.packageType} (${o.animal})`,
    o.notes && `Catatan: ${o.notes}`,
  ]
    .filter(Boolean)
    .join("\n");
}

async function send(kind: WaMessageKind, orderId: number | null, phone: string, message: string) {
  const recipient = toWaNumber(phone);
  const result = await sendWaMessage(recipient, message);
  if (!result.ok) console.error(`WA ${kind} ke ${recipient} gagal: ${result.error}`);
  try {
    await db.insert(waMessages).values({
      orderId,
      kind,
      recipient,
      message,
      ok: result.ok,
      error: result.ok ? null : result.error.slice(0, 255),
    });
  } catch (err) {
    console.error("Gagal mencatat log WhatsApp", err);
  }
  return result;
}

async function findOrder(id: number) {
  const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return order;
}

/** Alasan konfirmasi ke pelanggan dilewati, atau null bila boleh dikirim. */
async function customerSkipReason(recipient: string) {
  const [[recent], [hourly]] = await Promise.all([
    db
      .select({ n: count() })
      .from(waMessages)
      .where(
        and(
          eq(waMessages.kind, "customer"),
          eq(waMessages.recipient, recipient),
          eq(waMessages.ok, true),
          gte(waMessages.createdAt, new Date(Date.now() - CUSTOMER_COOLDOWN_MS)),
        ),
      ),
    db
      .select({ n: count() })
      .from(waMessages)
      .where(and(eq(waMessages.kind, "customer"), gte(waMessages.createdAt, new Date(Date.now() - 60 * 60_000)))),
  ]);
  if (recent.n > 0) return "nomor ini sudah dikirimi konfirmasi dalam 30 menit terakhir";
  if (hourly.n >= CUSTOMER_HOURLY_LIMIT) return "batas konfirmasi per jam tercapai";
  return null;
}

/** Notifikasi ke admin + konfirmasi ke pelanggan untuk pesanan baru. Dipanggil lewat after() setelah respons terkirim. */
export async function notifyNewOrder(orderId: number) {
  if (!waGatewayConfigured()) return;
  const [order, settings] = await Promise.all([findOrder(orderId), getSiteSettings()]);
  if (!order) return;

  if (settings.waNotifyAdmin === "on") {
    const adminUrl = `${settings.websiteUrl.replace(/\/+$/, "")}/admin/pesanan`;
    const message = `*Pesanan baru #${order.id}*\n\n${orderSummary(order)}\n\nBalas pelanggan: https://wa.me/${toWaNumber(order.phone)}\nPanel: ${adminUrl}`;
    // Berurutan, bukan paralel, agar tidak menabrak batas 60 request/menit gateway.
    for (const admin of settings.admins) await send("admin", order.id, admin.wa, message);
  }

  if (settings.waNotifyCustomer === "on" && settings.waCustomerTemplate) {
    const skip = await customerSkipReason(toWaNumber(order.phone));
    if (skip) console.info(`Konfirmasi WA pesanan #${order.id} dilewati: ${skip}`);
    else await send("customer", order.id, order.phone, renderTemplate(settings.waCustomerTemplate, order, settings));
  }
}

/** Kabari pelanggan saat status pesanan berubah. Template kosong berarti tidak dikirim. */
export async function notifyStatusChange(orderId: number) {
  if (!waGatewayConfigured()) return;
  const [order, settings] = await Promise.all([findOrder(orderId), getSiteSettings()]);
  if (!order || order.status === "baru") return;
  const template = settings[STATUS_TEMPLATE[order.status]];
  if (template) await send("status", order.id, order.phone, renderTemplate(template, order, settings));
}

/** Kirim ulang pesan pesanan yang gagal dan belum pernah berhasil terkirim ke penerima yang sama. */
export async function resendFailed(orderId: number) {
  const logs = await db.select().from(waMessages).where(eq(waMessages.orderId, orderId)).orderBy(desc(waMessages.id));
  const latest = new Map<string, (typeof logs)[number]>();
  for (const log of logs) {
    const key = `${log.kind}:${log.recipient}`;
    if (!latest.has(key)) latest.set(key, log);
  }
  const failed = [...latest.values()].filter((l) => !l.ok);
  let sent = 0;
  for (const log of failed) if ((await send(log.kind, orderId, log.recipient, log.message)).ok) sent++;
  return { attempted: failed.length, sent };
}

/** Pesan tes dari panel admin. */
export function sendTestMessage(phone: string, message: string) {
  return send("test", null, phone, message);
}
