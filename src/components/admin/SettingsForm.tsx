"use client";

import { useActionState } from "react";
import { saveSettings, type SettingsState } from "@/app/(admin)/admin/actions";
import { useHydrated } from "./useHydrated";
import { WA_PLACEHOLDERS, type SettingsKey, type SettingsValues } from "@/lib/settings-schema";

type FieldDef = {
  key: SettingsKey;
  label: string;
  hint?: string;
  type?: "text" | "number" | "url" | "tel" | "textarea" | "select";
  options?: { value: string; label: string }[];
  rows?: number;
  placeholder?: string;
  wide?: boolean;
};

type Group = { title: string; description: string; fields: FieldDef[] };

const generalGroups: Group[] = [
  {
    title: "Identitas",
    description: "Nama dan keterangan usaha yang tampil di hero, footer, dan judul situs.",
    fields: [
      { key: "siteName", label: "Nama usaha" },
      { key: "tagline", label: "Tagline", placeholder: "Aqiqah Sesuai Sunnah" },
      { key: "since", label: "Tahun berdiri", type: "number" },
      { key: "area", label: "Area layanan", placeholder: "Bandung & Cimahi" },
      { key: "websiteUrl", label: "Alamat website", type: "url", wide: true },
    ],
  },
  {
    title: "Kontak & WhatsApp",
    description: "Admin 1 menjadi tujuan semua tombol “Pesan Sekarang” dan formulir pesanan.",
    fields: [
      { key: "admin1Label", label: "Label admin 1" },
      { key: "admin1Phone", label: "No. WhatsApp admin 1", type: "tel", placeholder: "0813-xxxx-xxxx" },
      { key: "admin2Label", label: "Label admin 2" },
      { key: "admin2Phone", label: "No. WhatsApp admin 2", type: "tel", hint: "Kosongkan bila tidak ada admin kedua." },
      { key: "instagram", label: "Instagram", placeholder: "nama_akun", hint: "Tanpa @. Kosongkan untuk menyembunyikan." },
      { key: "serviceHours", label: "Jam layanan", placeholder: "Online 24 jam / 7 hari" },
    ],
  },
  {
    title: "Pembayaran",
    description: "Ditampilkan di bagian metode pembayaran. Kosongkan nomor rekening untuk menyembunyikan kartu transfer.",
    fields: [
      { key: "bankName", label: "Nama bank", placeholder: "Mandiri" },
      { key: "bankAccount", label: "Nomor rekening" },
      { key: "bankHolder", label: "Atas nama", wide: true },
    ],
  },
  {
    title: "SEO",
    description: "Judul dan deskripsi yang muncul di hasil pencarian Google dan saat tautan dibagikan.",
    fields: [
      { key: "metaTitle", label: "Judul halaman", wide: true, hint: "Idealnya 50–60 karakter." },
      { key: "metaDescription", label: "Deskripsi", type: "textarea", wide: true, hint: "Idealnya 120–160 karakter." },
    ],
  },
];

const onOff = [
  { value: "on", label: "Aktif" },
  { value: "off", label: "Nonaktif" },
];
const placeholderHint = `Bisa memakai ${WA_PLACEHOLDERS.map((p) => `{${p}}`).join(", ")}.`;

const whatsappGroups: Group[] = [
  {
    title: "Pesanan baru",
    description: "Dikirim otomatis lewat WA Gateway setiap ada pesanan dari formulir situs.",
    fields: [
      { key: "waNotifyAdmin", label: "Notifikasi ke admin", type: "select", options: onOff, hint: "Ke semua nomor admin di Pengaturan Umum." },
      {
        key: "waNotifyCustomer",
        label: "Konfirmasi ke pelanggan",
        type: "select",
        options: onOff,
        hint: "Maks. sekali per nomor per 30 menit, dan 30 pesan per jam.",
      },
      { key: "waCustomerTemplate", label: "Pesan konfirmasi pelanggan", type: "textarea", rows: 6, wide: true, hint: placeholderHint },
    ],
  },
  {
    title: "Perubahan status",
    description: "Dikirim ke pelanggan saat status pesanan diubah di halaman Pesanan. Kosongkan untuk tidak mengirim.",
    fields: [
      { key: "waStatusDiproses", label: "Status Diproses", type: "textarea", rows: 5, wide: true },
      { key: "waStatusSelesai", label: "Status Selesai", type: "textarea", rows: 5, wide: true },
      { key: "waStatusBatal", label: "Status Batal", type: "textarea", rows: 6, wide: true, hint: placeholderHint },
    ],
  },
];

const variants = {
  general: { groups: generalGroups, savedText: "Pengaturan tersimpan dan sudah tampil di situs." },
  whatsapp: { groups: whatsappGroups, savedText: "Pengaturan WhatsApp tersimpan." },
};

export function SettingsForm({ initial, variant = "general" }: { initial: SettingsValues; variant?: keyof typeof variants }) {
  const { groups, savedText } = variants[variant];
  const [state, formAction, pending] = useActionState<SettingsState, FormData>(saveSettings, { status: "idle" });
  const hydrated = useHydrated();
  // Setelah action, React mereset form ke defaultValue — jadi isi defaultValue dengan nilai terakhir.
  const values: Record<string, string | number> = state.status === "idle" ? initial : state.values;
  const errors = state.status === "error" ? state.fieldErrors : {};

  return (
    <form action={formAction} className="a-settings">
      {groups.map((g) => (
        <section key={g.title} className="a-card">
          <div className="a-card__head a-card__head--stack">
            <h2>{g.title}</h2>
            <p className="a-muted">{g.description}</p>
          </div>
          <div className="a-settings__grid">
            {g.fields.map((f) => {
              const id = `set-${f.key}`;
              const err = errors[f.key]?.[0];
              const common = {
                id,
                name: f.key,
                defaultValue: String(values[f.key] ?? ""),
                placeholder: f.placeholder,
                "aria-invalid": err ? true : undefined,
              };
              return (
                <label key={f.key} htmlFor={id} className={`a-field${f.wide ? " a-field--wide" : ""}`}>
                  <span>{f.label}</span>
                  {f.type === "textarea" ? (
                    <textarea {...common} rows={f.rows ?? 3} />
                  ) : f.type === "select" ? (
                    <select {...common}>
                      {f.options?.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input {...common} type={f.type ?? "text"} />
                  )}
                  {err ? <small className="a-field__error">{err}</small> : f.hint && <small>{f.hint}</small>}
                </label>
              );
            })}
          </div>
        </section>
      ))}

      <div className="a-settings__bar">
        {state.status === "saved" && <p className="a-success">{savedText}</p>}
        {state.status === "error" && <p className="a-alert">{state.message}</p>}
        <button type="submit" className="a-btn a-btn--primary" disabled={pending || !hydrated}>
          {pending ? "Menyimpan…" : "Simpan pengaturan"}
        </button>
      </div>
    </form>
  );
}
