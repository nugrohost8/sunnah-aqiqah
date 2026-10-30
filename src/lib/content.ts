import "server-only";
import { asc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { aqiqahPackages, bundlingPrices, faqs, heroSlides, nasiBoxes, partners, testimonials } from "@/db/schema";

/** Tag cache untuk semua konten publik; admin memanggil updateTag(CONTENT_TAG) setelah mengubah data. */
export const CONTENT_TAG = "content";

/** Semua konten halaman utama dalam satu entri cache. */
export async function getHomeContent() {
  "use cache";
  cacheLife("days");
  cacheTag(CONTENT_TAG);

  const [slides, packages, boxes, bundling, testimonialRows, faqRows, partnerRows] = await Promise.all([
    db.select().from(heroSlides).where(eq(heroSlides.active, true)).orderBy(asc(heroSlides.sortOrder), asc(heroSlides.id)),
    db.select().from(aqiqahPackages).where(eq(aqiqahPackages.active, true)).orderBy(asc(aqiqahPackages.sortOrder)),
    db.select().from(nasiBoxes).where(eq(nasiBoxes.active, true)).orderBy(asc(nasiBoxes.sortOrder)),
    db.select().from(bundlingPrices).orderBy(asc(bundlingPrices.sortOrder), asc(bundlingPrices.boxes)),
    db.select().from(testimonials).where(eq(testimonials.active, true)).orderBy(asc(testimonials.sortOrder)),
    db.select().from(faqs).where(eq(faqs.active, true)).orderBy(asc(faqs.sortOrder)),
    db.select().from(partners).where(eq(partners.active, true)).orderBy(asc(partners.sortOrder)),
  ]);

  return {
    slides,
    masak: packages.filter((p) => p.kind === "masak"),
    tanpaMasak: packages.filter((p) => p.kind === "tanpa_masak"),
    nasiBoxes: boxes,
    bundling,
    testimonials: testimonialRows,
    faqs: faqRows,
    partners: partnerRows,
    // Dihitung di dalam cache agar tidak membuat halaman jadi dinamis.
    year: new Date().getFullYear(),
  };
}

export type HomeContent = Awaited<ReturnType<typeof getHomeContent>>;
