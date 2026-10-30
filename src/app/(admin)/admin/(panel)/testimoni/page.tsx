import { asc } from "drizzle-orm";
import type { Metadata } from "next";
import { Suspense } from "react";
import { CrudTable } from "@/components/admin/CrudTable";
import { PanelFallback } from "@/components/admin/PanelFallback";
import { db } from "@/db";
import { testimonials } from "@/db/schema";
import { requireAdmin } from "@/lib/dal";
import { deleteTestimonial, saveTestimonial } from "../../actions";

export const metadata: Metadata = { title: "Testimoni" };

async function TestimonialsContent() {
  await requireAdmin();
  const rows = await db.select().from(testimonials).orderBy(asc(testimonials.sortOrder));

  return (
    <>
      <section className="a-card">
        <CrudTable
          fields={[
            { name: "name", label: "Nama", width: "140px", required: true },
            { name: "subtitle", label: "Keterangan", width: "180px", placeholder: "Aqiqah putri pertama" },
            { name: "quote", label: "Testimoni", type: "textarea", width: "2fr", required: true },
            {
              name: "rating",
              label: "Bintang",
              type: "select",
              width: "80px",
              options: ["5", "4", "3", "2", "1"].map((v) => ({ value: v, label: `${v}★` })),
            },
            { name: "sortOrder", label: "Urutan", type: "number", width: "80px" },
            { name: "active", label: "Aktif", type: "checkbox", width: "60px" },
          ]}
          rows={rows.map((r) => ({ ...r, rating: String(r.rating) }))}
          newDefaults={{ sortOrder: rows.length }}
          save={saveTestimonial}
          remove={deleteTestimonial}
          addLabel="Tambah testimoni"
        />
      </section>
    </>
  );
}

// Judul halaman tampil seketika saat berpindah menu; data (cek sesi + query) menyusul di dalam Suspense.
export default function TestimonialsPage() {
  return (
    <>
      <header className="a-header">
        <div>
          <p className="a-eyebrow">Konten</p>
          <h1>Testimoni</h1>
        </div>
      </header>
      <Suspense fallback={<PanelFallback />}>
        <TestimonialsContent />
      </Suspense>
    </>
  );
}
