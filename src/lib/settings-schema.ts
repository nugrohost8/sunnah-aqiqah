import { z } from "zod";
import { toWaNumber } from "./format";

const phone = z
  .string()
  .trim()
  .regex(/^(\+?62|0)8[0-9\s-]{7,14}$/, "Format nomor tidak valid (contoh: 0813-2242-2825)");

/** Path gambar yang boleh dipakai: aset bawaan di public/images atau hasil upload. */
export const imagePath = z
  .string()
  .trim()
  .regex(/^\/(images|uploads)\/[\w./-]+$/, "Path gambar tidak valid");

/** Saklar on/off. Disimpan sebagai teks karena checkbox yang tidak dicentang tidak ikut terkirim di FormData. */
const toggle = z.enum(["on", "off"]);

/** Template pesan WhatsApp; kosong berarti pesan tidak dikirim. */
const waTemplate = z.string().trim().max(1000);

/** Placeholder yang bisa dipakai di template pesan WhatsApp. */
export const WA_PLACEHOLDERS = ["nama", "ananda", "tanggal", "paket", "hewan", "status", "situs"] as const;

/** Satu-satunya sumber kebenaran untuk kunci pengaturan umum, validasi, dan nilai bawaannya. */
export const settingsSchema = z.object({
  // Identitas
  siteName: z.string().trim().min(2).max(80).default("Sunnah Aqiqah"),
  tagline: z.string().trim().min(2).max(120).default("Aqiqah Sesuai Sunnah"),
  since: z.coerce.number().int().min(1900).max(2100).default(2017),
  area: z.string().trim().min(2).max(120).default("Bandung & Cimahi"),
  websiteUrl: z.url({ protocol: /^https?$/, message: "URL harus diawali http:// atau https://" }).default("https://sunnahaqiqah.com"),
  // Kontak
  admin1Label: z.string().trim().min(1).max(40).default("Admin 1"),
  admin1Phone: phone.default("0813-2242-2825"),
  admin2Label: z.string().trim().max(40).default("Admin 2"),
  admin2Phone: z.union([z.literal(""), phone]).default("0813-9447-7346"),
  instagram: z
    .string()
    .trim()
    .max(60)
    .transform((v) => v.replace(/^@/, ""))
    .default("sunnah.aqiqah"),
  serviceHours: z.string().trim().min(2).max(80).default("Online 24 jam / 7 hari"),
  // Pembayaran
  bankName: z.string().trim().max(60).default("Mandiri"),
  bankAccount: z.string().trim().max(40).default("1310086013333"),
  bankHolder: z.string().trim().max(120).default("PT Global Agro Pratama"),
  // Logo, favicon & hero slider (diatur dari halaman Logo & Favicon dan Hero Slider)
  logoMain: imagePath.default("/images/logo-emerald.png"),
  logoLight: imagePath.default("/images/logo-ivory.png"),
  favicon: imagePath.default("/images/favicon.png"),
  heroInterval: z.coerce.number().int().min(0, "Minimal 0").max(60, "Maksimal 60 detik").default(6),
  // WhatsApp Gateway (diatur dari halaman WhatsApp Gateway). Template boleh memakai {placeholder} dari WA_PLACEHOLDERS.
  waNotifyAdmin: toggle.default("on"),
  waNotifyCustomer: toggle.default("on"),
  waCustomerTemplate: waTemplate.default(
    "Assalamu'alaikum {nama},\n\nJazakumullahu khairan, pesanan Anda di {situs} sudah kami terima:\nPaket: {paket} ({hewan})\nTanggal acara: {tanggal}\n\nAdmin kami akan segera menghubungi Anda untuk konfirmasi harga & pembayaran.",
  ),
  waStatusDiproses: waTemplate.default(
    "Assalamu'alaikum {nama},\n\nPesanan aqiqah Anda ({paket}, {hewan}) sedang kami proses. Insya Allah siap pada {tanggal}.\n\n— {situs}",
  ),
  waStatusSelesai: waTemplate.default(
    "Assalamu'alaikum {nama},\n\nAlhamdulillah, pesanan aqiqah Anda sudah selesai. Semoga ananda {ananda} menjadi anak yang shalih/shalihah. Jazakumullahu khairan telah mempercayakan aqiqah kepada {situs}.",
  ),
  waStatusBatal: waTemplate.default(""),
  // SEO
  metaTitle: z.string().trim().min(10).max(120).default("Sunnah Aqiqah — Jasa Aqiqah Sesuai Sunnah di Bandung & Cimahi"),
  metaDescription: z
    .string()
    .trim()
    .min(30)
    .max(300)
    .default(
      "Sunnah Aqiqah sejak 2017: jasa aqiqah Bandung–Cimahi. Domba pilihan, disembelih sesuai syariat, dimasak higienis, diantar tepat waktu. Aqiqah + masak, tanpa masak, nasi box, dan bundling box.",
    ),
});

export type SettingsValues = z.infer<typeof settingsSchema>;
export type SettingsKey = keyof SettingsValues;
export const SETTINGS_KEYS = Object.keys(settingsSchema.shape) as SettingsKey[];
export const DEFAULT_SETTINGS: SettingsValues = settingsSchema.parse({});

/** Pengaturan + nilai turunan yang dipakai komponen situs. */
export function deriveSettings(v: SettingsValues) {
  const admins = [
    { label: v.admin1Label, display: v.admin1Phone, wa: toWaNumber(v.admin1Phone) },
    ...(v.admin2Phone ? [{ label: v.admin2Label || "Admin 2", display: v.admin2Phone, wa: toWaNumber(v.admin2Phone) }] : []),
  ];
  return { ...v, admins, primaryWa: admins[0].wa };
}

export type SiteSettings = ReturnType<typeof deriveSettings>;
