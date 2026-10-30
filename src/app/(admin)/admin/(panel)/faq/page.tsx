import { asc } from "drizzle-orm";
import type { Metadata } from "next";
import { Suspense } from "react";
import { CrudTable } from "@/components/admin/CrudTable";
import { PanelFallback } from "@/components/admin/PanelFallback";
import { db } from "@/db";
import { faqs } from "@/db/schema";
import { requireAdmin } from "@/lib/dal";
import { deleteFaq, saveFaq } from "../../actions";

export const metadata: Metadata = { title: "FAQ" };

async function FaqContent() {
  await requireAdmin();
  const rows = await db.select().from(faqs).orderBy(asc(faqs.sortOrder));

  return (
    <>
      <section className="a-card">
        <CrudTable
          fields={[
            { name: "question", label: "Pertanyaan", type: "textarea", required: true },
            { name: "answer", label: "Jawaban", type: "textarea", width: "1.6fr", required: true },
            { name: "sortOrder", label: "Urutan", type: "number", width: "80px" },
            { name: "active", label: "Aktif", type: "checkbox", width: "60px" },
          ]}
          rows={rows}
          newDefaults={{ sortOrder: rows.length }}
          save={saveFaq}
          remove={deleteFaq}
          addLabel="Tambah FAQ"
        />
      </section>
    </>
  );
}

// Judul halaman tampil seketika saat berpindah menu; data (cek sesi + query) menyusul di dalam Suspense.
export default function FaqPage() {
  return (
    <>
      <header className="a-header">
        <div>
          <p className="a-eyebrow">Konten</p>
          <h1>FAQ</h1>
        </div>
      </header>
      <Suspense fallback={<PanelFallback />}>
        <FaqContent />
      </Suspense>
    </>
  );
}
