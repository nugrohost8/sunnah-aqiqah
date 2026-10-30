import { asc } from "drizzle-orm";
import type { Metadata } from "next";
import { Suspense } from "react";
import { HeroIntervalForm } from "@/components/admin/HeroIntervalForm";
import { PanelFallback } from "@/components/admin/PanelFallback";
import { SlideForm } from "@/components/admin/SlideForm";
import { db } from "@/db";
import { heroSlides } from "@/db/schema";
import { requireAdmin } from "@/lib/dal";
import { getSiteSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Hero Slider" };

async function HeroContent() {
  await requireAdmin();
  const [slides, settings] = await Promise.all([
    db.select().from(heroSlides).orderBy(asc(heroSlides.sortOrder), asc(heroSlides.id)),
    getSiteSettings(),
  ]);

  return (
    <>
      <HeroIntervalForm interval={settings.heroInterval} />
      {slides.length === 0 && (
        <p className="a-card a-muted">Belum ada slide. Situs menampilkan hero bawaan sampai Anda menambahkan slide.</p>
      )}
      {slides.map((slide) => (
        // key per id saja: form tetap terpasang setelah disimpan, jadi pesan "Slide diperbarui." tetap terlihat.
        <SlideForm key={slide.id} slide={slide} />
      ))}
      <SlideForm key={`new:${slides.length}`} nextOrder={slides.length} />
    </>
  );
}

// Judul halaman tampil seketika saat berpindah menu; data (cek sesi + query) menyusul di dalam Suspense.
export default function HeroPage() {
  return (
    <>
      <header className="a-header">
        <div>
          <p className="a-eyebrow">Pengaturan</p>
          <h1>Hero Slider</h1>
        </div>
        <p className="a-muted a-header__note">Slide aktif tampil bergantian di bagian paling atas halaman utama, diurutkan dari angka urutan terkecil.</p>
      </header>
      <Suspense fallback={<PanelFallback />}>
        <HeroContent />
      </Suspense>
    </>
  );
}
