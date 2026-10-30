import type { Metadata } from "next";
import { Suspense } from "react";
import { PanelFallback } from "@/components/admin/PanelFallback";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { requireAdmin } from "@/lib/dal";
import { getSiteSettings } from "@/lib/settings";
import { SETTINGS_KEYS, type SettingsValues } from "@/lib/settings-schema";

export const metadata: Metadata = { title: "Pengaturan Umum" };

async function SettingsContent() {
  await requireAdmin();
  const settings = await getSiteSettings();
  // Kirim hanya nilai yang bisa diedit, bukan nilai turunan (admins, primaryWa).
  const initial = Object.fromEntries(SETTINGS_KEYS.map((k) => [k, settings[k]])) as SettingsValues;
  return <SettingsForm initial={initial} />;
}

// Judul halaman tampil seketika saat berpindah menu; data (cek sesi + query) menyusul di dalam Suspense.
export default function SettingsPage() {
  return (
    <>
      <header className="a-header">
        <div>
          <p className="a-eyebrow">Pengaturan</p>
          <h1>Pengaturan Umum</h1>
        </div>
      </header>
      <Suspense fallback={<PanelFallback />}>
        <SettingsContent />
      </Suspense>
    </>
  );
}
