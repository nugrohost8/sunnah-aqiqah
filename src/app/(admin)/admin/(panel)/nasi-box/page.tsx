import { asc } from "drizzle-orm";
import type { Metadata } from "next";
import { Suspense } from "react";
import { CrudTable } from "@/components/admin/CrudTable";
import { PanelFallback } from "@/components/admin/PanelFallback";
import { db } from "@/db";
import { nasiBoxes } from "@/db/schema";
import { requireAdmin } from "@/lib/dal";
import { deleteNasiBox, saveNasiBox } from "../../actions";

export const metadata: Metadata = { title: "Nasi Box" };

async function NasiBoxContent() {
  await requireAdmin();
  const rows = await db.select().from(nasiBoxes).orderBy(asc(nasiBoxes.sortOrder));

  return (
    <>
      <section className="a-card">
        <CrudTable
          fields={[
            { name: "name", label: "Nama", width: "160px", required: true },
            { name: "contents", label: "Isi box", type: "textarea", width: "2fr", required: true },
            { name: "price", label: "Harga (Rp)", type: "number", width: "120px", required: true },
            { name: "isSignature", label: "Spesial", type: "checkbox", width: "60px" },
            { name: "sortOrder", label: "Urutan", type: "number", width: "80px" },
            { name: "active", label: "Aktif", type: "checkbox", width: "60px" },
          ]}
          rows={rows}
          newDefaults={{ sortOrder: rows.length, isSignature: false }}
          save={saveNasiBox}
          remove={deleteNasiBox}
          addLabel="Tambah nasi box"
        />
      </section>
    </>
  );
}

// Judul halaman tampil seketika saat berpindah menu; data (cek sesi + query) menyusul di dalam Suspense.
export default function NasiBoxPage() {
  return (
    <>
      <header className="a-header">
        <div>
          <p className="a-eyebrow">Paket & Harga</p>
          <h1>Nasi Box</h1>
        </div>
      </header>
      <Suspense fallback={<PanelFallback />}>
        <NasiBoxContent />
      </Suspense>
    </>
  );
}
