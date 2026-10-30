const number = new Intl.NumberFormat("id-ID");

/** 1450000 -> "1.450.000" */
export const formatNumber = (n: number) => number.format(n);

/** 1450000 -> "Rp1.450.000" */
export const formatRupiah = (n: number) => `Rp${number.format(n)}`;

const dateTime = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" });
const dateOnly = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeZone: "UTC" });

export const formatDateTime = (d: Date) => dateTime.format(d);

/** "2026-11-02" -> "2 Nov 2026" */
export const formatDate = (iso: string) => dateOnly.format(new Date(`${iso}T00:00:00Z`));

/** "0812-3456 7890" / "+62812..." -> "6281234567890" untuk tautan wa.me */
export function toWaNumber(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("0") ? `62${digits.slice(1)}` : digits;
}
