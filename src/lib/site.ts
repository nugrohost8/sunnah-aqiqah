// Data situs (nama, nomor WhatsApp, rekening, dll.) kini diatur dari Admin → Pengaturan Umum.
// Lihat src/lib/settings.ts (getSiteSettings) dan src/lib/settings-schema.ts (nilai bawaan).

export function waLink(number: string, text?: string) {
  return `https://wa.me/${number}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}
