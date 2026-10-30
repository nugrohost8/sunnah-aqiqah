import type { Metadata } from "next";
import { Suspense } from "react";
import { LogoUploader } from "@/components/admin/LogoUploader";
import { PanelFallback } from "@/components/admin/PanelFallback";
import { requireAdmin } from "@/lib/dal";
import { getSiteSettings } from "@/lib/settings";
import { DEFAULT_SETTINGS } from "@/lib/settings-schema";

export const metadata: Metadata = { title: "Logo & Favicon" };

async function LogoContent() {
  await requireAdmin();
  const s = await getSiteSettings();
  return (
    <div className="a-logo-grid">
      <LogoUploader
        logoKey="logoMain"
        title="Logo utama"
        description="Untuk latar terang: navbar situs dan halaman login admin. Gunakan PNG/WebP transparan."
        src={s.logoMain}
        isDefault={s.logoMain === DEFAULT_SETTINGS.logoMain}
        dark={false}
      />
      <LogoUploader
        logoKey="logoLight"
        title="Logo versi terang"
        description="Untuk latar gelap: footer situs dan sidebar admin. Gunakan logo berwarna putih/terang."
        src={s.logoLight}
        isDefault={s.logoLight === DEFAULT_SETTINGS.logoLight}
        dark
      />
      <LogoUploader
        logoKey="favicon"
        title="Favicon"
        description="Ikon kecil di tab browser dan bookmark. Gunakan gambar persegi (mis. 512×512) dengan bentuk sederhana; gambar lain otomatis dibuat persegi."
        src={s.favicon}
        isDefault={s.favicon === DEFAULT_SETTINGS.favicon}
        dark={false}
      />
    </div>
  );
}

// Judul halaman tampil seketika saat berpindah menu; data (cek sesi + query) menyusul di dalam Suspense.
export default function LogoPage() {
  return (
    <>
      <header className="a-header">
        <div>
          <p className="a-eyebrow">Pengaturan</p>
          <h1>Logo &amp; Favicon</h1>
        </div>
      </header>
      <Suspense fallback={<PanelFallback />}>
        <LogoContent />
      </Suspense>
    </>
  );
}
