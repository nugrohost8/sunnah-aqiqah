"use server";

import { after } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { ANIMALS, PACKAGE_TYPES } from "@/lib/orders";
import { getSiteSettings } from "@/lib/settings";
import { waLink } from "@/lib/site";
import { notifyNewOrder, orderSummary } from "@/lib/wa-notify";

const optional = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => v || null);

const orderSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 huruf").max(120),
  phone: z
    .string()
    .trim()
    .regex(/^(\+?62|0)8[0-9\s-]{7,14}$/, "Nomor WhatsApp tidak valid (contoh: 0812-3456-7890)"),
  childName: optional(120),
  eventDate: z
    .string()
    .trim()
    .regex(/^(\d{4}-\d{2}-\d{2})?$/, "Tanggal tidak valid")
    .transform((v) => v || null),
  packageType: z.enum(PACKAGE_TYPES),
  animal: z.enum(ANIMALS),
  notes: optional(2000),
});

export type OrderState =
  | { status: "idle" }
  | {
      status: "error";
      message: string;
      fieldErrors?: Partial<Record<string, string[]>>;
      /** Isian yang dikirim, agar formulir tidak kosong lagi setelah React mereset form. */
      values: Record<string, string>;
    }
  | { status: "success"; waUrl: string };

export async function createOrder(_prev: OrderState, formData: FormData): Promise<OrderState> {
  // Honeypot: kolom tersembunyi yang hanya diisi bot.
  const { primaryWa } = await getSiteSettings();
  if (formData.get("website")) return { status: "success", waUrl: waLink(primaryWa) };

  const values = Object.fromEntries(
    [...formData.entries()].filter(([k, v]) => typeof v === "string" && !k.startsWith("$")),
  ) as Record<string, string>;
  const parsed = orderSchema.safeParse(values);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Mohon periksa kembali isian formulir.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      values,
    };
  }

  const o = parsed.data;
  let orderId: number;
  try {
    [{ id: orderId }] = await db.insert(orders).values(o).$returningId();
  } catch (err) {
    console.error("Gagal menyimpan pesanan", err);
    return { status: "error", message: "Pesanan gagal disimpan. Silakan hubungi admin langsung via WhatsApp.", values };
  }

  // Notifikasi WA Gateway dikirim setelah respons, agar pelanggan tidak menunggu gateway.
  after(() => notifyNewOrder(orderId));

  const message = `Assalamu'alaikum Sunnah Aqiqah, saya ingin memesan:\n${orderSummary(o)}`;
  return { status: "success", waUrl: waLink(primaryWa, message) };
}
