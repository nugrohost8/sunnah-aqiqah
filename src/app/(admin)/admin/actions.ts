"use server";

import bcrypt from "bcryptjs";
import { eq, sql } from "drizzle-orm";
import type { MySqlColumn, MySqlTable } from "drizzle-orm/mysql-core";
import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import {
  adminUsers,
  aqiqahPackages,
  bundlingPrices,
  faqs,
  heroSlides,
  nasiBoxes,
  ORDER_STATUSES,
  orders,
  partners,
  siteSettings,
  testimonials,
} from "@/db/schema";
import { CONTENT_TAG } from "@/lib/content";
import { requireAdmin } from "@/lib/dal";
import { createSession, deleteSession } from "@/lib/session";
import { getSiteSettings } from "@/lib/settings";
import { imagePath, SETTINGS_KEYS, settingsSchema, type SettingsKey } from "@/lib/settings-schema";
import { deleteUpload, fileFrom, saveImageUpload, UploadError } from "@/lib/uploads";
import { notifyStatusChange, resendFailed, sendTestMessage } from "@/lib/wa-notify";

/* ---------------- Auth ---------------- */

const DUMMY_HASH = bcrypt.hashSync("tidak-dipakai-untuk-login", 12);

export type LoginState = { error?: string; email?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Email dan password wajib diisi.", email };

  const [user] = await db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1);
  // Tetap jalankan bcrypt walau email tidak ditemukan agar waktu respons tidak membocorkan email terdaftar.
  const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok) return { error: "Email atau password salah.", email };

  await createSession(user.id);
  redirect("/admin");
}

export async function logout() {
  await deleteSession();
  redirect("/admin/login");
}

/* ---------------- Helpers ---------------- */

// Batas atas kolom INT MySQL, agar input berlebih ditolak dengan pesan jelas, bukan error database.
const MAX_INT = 2_000_000_000;
const int = z.coerce.number().int().min(0).max(MAX_INT);
const optionalInt = z.preprocess((v) => (v === "" || v == null ? null : v), int.nullable());
const text = (max: number) => z.string().trim().min(1, "Wajib diisi").max(max);
const checkbox = z.preprocess((v) => v === "on", z.boolean());

function parse<T extends z.ZodType>(schema: T, formData: FormData): z.infer<T> {
  const result = schema.safeParse(Object.fromEntries(formData));
  if (!result.success) {
    const issue = result.error.issues[0];
    throw new Error(`Data tidak valid pada "${issue.path.join(".")}": ${issue.message}`);
  }
  return result.data;
}

function idOf(formData: FormData) {
  const id = Number(formData.get("id"));
  return Number.isInteger(id) && id > 0 ? id : null;
}

/**
 * Simpan baris: update bila ada `id`, insert bila tidak. Konten publik ikut diperbarui.
 * `values` berupa fungsi agar validasi baru berjalan setelah login diperiksa.
 */
async function upsert<T extends MySqlTable & { id: MySqlColumn }>(
  table: T,
  formData: FormData,
  values: () => T["$inferInsert"],
) {
  await requireAdmin();
  const data = values();
  const id = idOf(formData);
  if (id) await db.update(table).set(data).where(eq(table.id, id));
  else await db.insert(table).values(data);
  updateTag(CONTENT_TAG);
  refresh();
}

async function remove<T extends MySqlTable & { id: MySqlColumn }>(table: T, formData: FormData) {
  await requireAdmin();
  const id = idOf(formData);
  if (!id) throw new Error("ID tidak valid");
  await db.delete(table).where(eq(table.id, id));
  updateTag(CONTENT_TAG);
  refresh();
}

/* ---------------- Paket aqiqah ---------------- */

const packageSchema = z.object({
  kind: z.enum(["masak", "tanpa_masak"]),
  code: text(20),
  priceBetina: int,
  priceJantan: int,
  sate: optionalInt,
  gule: optionalInt,
  porsi: z.string().trim().max(20).optional().transform((v) => v || null),
  sortOrder: int,
  active: checkbox,
});

export async function savePackage(formData: FormData) {
  await upsert(aqiqahPackages, formData, () => parse(packageSchema, formData));
}
export async function deletePackage(formData: FormData) {
  await remove(aqiqahPackages, formData);
}

/* ---------------- Nasi box ---------------- */

const nasiBoxSchema = z.object({
  name: text(120),
  contents: text(2000),
  price: int,
  isSignature: checkbox,
  sortOrder: int,
  active: checkbox,
});

export async function saveNasiBox(formData: FormData) {
  await upsert(nasiBoxes, formData, () => parse(nasiBoxSchema, formData));
}
export async function deleteNasiBox(formData: FormData) {
  await remove(nasiBoxes, formData);
}

/* ---------------- Bundling ---------------- */

const bundlingSchema = z.object({
  gender: z.enum(["perempuan", "laki"]),
  animal: z.enum(["jantan", "betina"]),
  boxes: int,
  sate: int,
  gule: int,
  price: int,
  sortOrder: int,
});

export async function saveBundling(formData: FormData) {
  await upsert(bundlingPrices, formData, () => parse(bundlingSchema, formData));
}
export async function deleteBundling(formData: FormData) {
  await remove(bundlingPrices, formData);
}

/* ---------------- Testimoni ---------------- */

const testimonialSchema = z.object({
  name: text(120),
  subtitle: z.string().trim().max(191),
  quote: text(2000),
  rating: z.coerce.number().int().min(1).max(5),
  sortOrder: int,
  active: checkbox,
});

export async function saveTestimonial(formData: FormData) {
  await upsert(testimonials, formData, () => parse(testimonialSchema, formData));
}
export async function deleteTestimonial(formData: FormData) {
  await remove(testimonials, formData);
}

/* ---------------- FAQ ---------------- */

const faqSchema = z.object({
  question: text(255),
  answer: text(2000),
  sortOrder: int,
  active: checkbox,
});

export async function saveFaq(formData: FormData) {
  await upsert(faqs, formData, () => parse(faqSchema, formData));
}
export async function deleteFaq(formData: FormData) {
  await remove(faqs, formData);
}

/* ---------------- Partner ---------------- */

const partnerSchema = z.object({
  name: text(120),
  logo: text(255).refine((v) => v.startsWith("/") || /^https?:\/\//.test(v), "Harus path /images/... atau URL http(s)"),
  sortOrder: int,
  active: checkbox,
});

export async function savePartner(formData: FormData) {
  await upsert(partners, formData, () => parse(partnerSchema, formData));
}
export async function deletePartner(formData: FormData) {
  await remove(partners, formData);
}

/* ---------------- Pesanan ---------------- */

export async function updateOrderStatus(formData: FormData) {
  await requireAdmin();
  const id = idOf(formData);
  const status = z.enum(ORDER_STATUSES).parse(formData.get("status"));
  if (!id) throw new Error("ID tidak valid");
  const [current] = await db.select({ status: orders.status }).from(orders).where(eq(orders.id, id)).limit(1);
  if (!current) throw new Error("Pesanan tidak ditemukan");
  await db.update(orders).set({ status }).where(eq(orders.id, id));
  // Kabari pelanggan lewat WhatsApp hanya bila status benar-benar berubah.
  if (current.status !== status) after(() => notifyStatusChange(id));
  refresh();
}

export async function resendOrderWa(formData: FormData) {
  await requireAdmin();
  const id = idOf(formData);
  if (!id) throw new Error("ID tidak valid");
  await resendFailed(id);
  refresh();
}

export async function deleteOrder(formData: FormData) {
  await requireAdmin();
  const id = idOf(formData);
  if (!id) throw new Error("ID tidak valid");
  await db.delete(orders).where(eq(orders.id, id));
  refresh();
}

/* ---------------- WhatsApp Gateway ---------------- */

export type WaTestState = { status: "idle" } | { status: "sent"; message: string } | { status: "error"; message: string; phone: string };

const waTestSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^(\+?62|0)8[0-9\s-]{7,14}$/, "Nomor WhatsApp tidak valid (contoh: 0812-3456-7890)"),
});

export async function sendWaTest(_prev: WaTestState, formData: FormData): Promise<WaTestState> {
  await requireAdmin();
  const phone = String(formData.get("phone") ?? "");
  const parsed = waTestSchema.safeParse({ phone });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0].message, phone };

  const { siteName } = await getSiteSettings();
  const result = await sendTestMessage(parsed.data.phone, `Tes WA Gateway dari panel admin ${siteName}. Jika pesan ini masuk, integrasi berjalan normal.`);
  refresh();
  return result.ok
    ? { status: "sent", message: `Pesan tes terkirim ke ${parsed.data.phone}.` }
    : { status: "error", message: result.error, phone };
}

/* ---------------- Pengaturan umum ---------------- */

export type SettingsState =
  | { status: "idle" }
  | { status: "saved"; values: Record<string, string> }
  | { status: "error"; message: string; fieldErrors: Partial<Record<string, string[]>>; values: Record<string, string> };

export async function saveSettings(_prev: SettingsState, formData: FormData): Promise<SettingsState> {
  await requireAdmin();
  // Hanya kunci yang ada di formulir yang disimpan, agar form lain (mis. Hero Slider) tidak menimpa pengaturan lain.
  const keys = SETTINGS_KEYS.filter((k) => formData.has(k));
  const values = Object.fromEntries(keys.map((k) => [k, String(formData.get(k) ?? "")]));

  const parsed = settingsSchema
    .pick(Object.fromEntries(keys.map((k) => [k, true])) as Record<SettingsKey, true>)
    .safeParse(values);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Ada isian yang belum valid. Periksa kolom bertanda merah.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      values,
    };
  }

  const data = parsed.data as Record<string, unknown>;
  const saved = Object.fromEntries(keys.map((k) => [k, String(data[k])]));
  await db
    .insert(siteSettings)
    .values(Object.entries(saved).map(([key, value]) => ({ key, value })))
    .onDuplicateKeyUpdate({ set: { value: sql.raw("values(`value`)") } });

  updateTag(CONTENT_TAG);
  return { status: "saved", values: saved };
}

/* ---------------- Logo ---------------- */

const LOGO_KEYS = ["logoMain", "logoLight", "favicon"] as const;
type LogoKey = (typeof LOGO_KEYS)[number];

export type UploadState = { status: "idle" } | { status: "saved"; message: string } | { status: "error"; message: string };

function logoKeyOf(formData: FormData): LogoKey {
  const key = formData.get("key");
  const found = LOGO_KEYS.find((k) => k === key);
  if (!found) throw new Error("Jenis logo tidak valid");
  return found;
}

export async function uploadLogo(_prev: UploadState, formData: FormData): Promise<UploadState> {
  await requireAdmin();
  const key = logoKeyOf(formData);
  const file = fileFrom(formData, "file");
  if (!file) return { status: "error", message: "Pilih file gambar terlebih dahulu." };

  let url: string;
  try {
    url = await saveImageUpload(file, key === "favicon" ? "favicon" : "logo");
  } catch (err) {
    if (err instanceof UploadError) return { status: "error", message: err.message };
    throw err;
  }

  const previous = (await getSiteSettings())[key];
  await db
    .insert(siteSettings)
    .values({ key, value: url })
    .onDuplicateKeyUpdate({ set: { value: url } });
  await deleteUpload(previous);

  updateTag(CONTENT_TAG);
  refresh();
  return { status: "saved", message: `${key === "favicon" ? "Favicon" : "Logo"} baru tersimpan dan sudah tampil di situs.` };
}

export async function resetLogo(formData: FormData) {
  await requireAdmin();
  const key = logoKeyOf(formData);
  const previous = (await getSiteSettings())[key];
  // Tanpa baris di tabel, getSiteSettings() kembali ke gambar bawaan.
  await db.delete(siteSettings).where(eq(siteSettings.key, key));
  await deleteUpload(previous);
  updateTag(CONTENT_TAG);
  refresh();
}

/* ---------------- Hero slider ---------------- */

const slideSchema = z.object({
  eyebrow: z.string().trim().max(120),
  title: text(160),
  subtitle: text(1000),
  ctaLabel: z.string().trim().max(60),
  ctaHref: z
    .string()
    .trim()
    .max(255)
    .refine((v) => v === "" || /^(#[\w-]+|\/[^\s]*|https?:\/\/\S+)$/.test(v), "Gunakan #bagian, /halaman, atau URL http(s)"),
  sortOrder: int,
  active: checkbox,
});

const SLIDE_LABELS: Record<string, string> = {
  eyebrow: "Label kecil",
  title: "Judul",
  subtitle: "Teks",
  ctaLabel: "Teks tombol",
  ctaHref: "Link tombol",
  sortOrder: "Urutan",
};

export type SlideState =
  | { status: "idle" }
  | { status: "saved"; message: string }
  | { status: "error"; message: string; values: Record<string, string> };

export async function saveSlide(_prev: SlideState, formData: FormData): Promise<SlideState> {
  await requireAdmin();
  const id = idOf(formData);
  const values = Object.fromEntries(
    [...formData.entries()].filter(([k, v]) => typeof v === "string" && !k.startsWith("$")),
  ) as Record<string, string>;
  const fail = (message: string): SlideState => ({ status: "error", message, values });

  const parsed = slideSchema.safeParse(values);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return fail(`${SLIDE_LABELS[String(issue.path[0])] ?? issue.path.join(".")}: ${issue.message}`);
  }

  const file = fileFrom(formData, "image");
  if (!id && !file) return fail("Gambar wajib diunggah untuk slide baru.");

  let image: string | undefined;
  if (file) {
    try {
      image = await saveImageUpload(file, "slide");
    } catch (err) {
      if (err instanceof UploadError) return fail(err.message);
      throw err;
    }
  }

  if (id) {
    const [current] = await db.select({ image: heroSlides.image }).from(heroSlides).where(eq(heroSlides.id, id)).limit(1);
    if (!current) return fail("Slide tidak ditemukan.");
    await db.update(heroSlides).set({ ...parsed.data, ...(image ? { image } : {}) }).where(eq(heroSlides.id, id));
    if (image) await deleteUpload(current.image);
  } else {
    await db.insert(heroSlides).values({ ...parsed.data, image: imagePath.parse(image) });
  }

  updateTag(CONTENT_TAG);
  refresh();
  return { status: "saved", message: id ? "Slide diperbarui." : "Slide baru ditambahkan." };
}

export async function deleteSlide(formData: FormData) {
  await requireAdmin();
  const id = idOf(formData);
  if (!id) throw new Error("ID tidak valid");
  const [current] = await db.select({ image: heroSlides.image }).from(heroSlides).where(eq(heroSlides.id, id)).limit(1);
  await db.delete(heroSlides).where(eq(heroSlides.id, id));
  await deleteUpload(current?.image);
  updateTag(CONTENT_TAG);
  refresh();
}
