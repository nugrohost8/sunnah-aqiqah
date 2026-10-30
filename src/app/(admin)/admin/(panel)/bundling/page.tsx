import { asc } from "drizzle-orm";
import type { Metadata } from "next";
import { Suspense } from "react";
import { CrudTable } from "@/components/admin/CrudTable";
import { PanelFallback } from "@/components/admin/PanelFallback";
import { db } from "@/db";
import { bundlingPrices } from "@/db/schema";
import { requireAdmin } from "@/lib/dal";
import { deleteBundling, saveBundling } from "../../actions";

export const metadata: Metadata = { title: "Bundling Box" };

async function BundlingContent() {
  await requireAdmin();
  const rows = await db.select().from(bundlingPrices).orderBy(asc(bundlingPrices.sortOrder), asc(bundlingPrices.boxes));

  return (
    <>
      <section className="a-card">
        <div className="a-card__head">
          <p className="a-muted">Aqiqah + nasi box tipe A. Di situs, tabel dikelompokkan per jenis kelamin ananda dan jenis hewan.</p>
        </div>
        <CrudTable
          fields={[
            {
              name: "gender",
              label: "Ananda",
              type: "select",
              width: "170px",
              options: [
                { value: "perempuan", label: "Perempuan (1 ekor)" },
                { value: "laki", label: "Laki-laki (2 ekor)" },
              ],
            },
            {
              name: "animal",
              label: "Hewan",
              type: "select",
              width: "110px",
              options: [
                { value: "jantan", label: "Jantan" },
                { value: "betina", label: "Betina" },
              ],
            },
            { name: "boxes", label: "Jumlah box", type: "number", required: true },
            { name: "sate", label: "Sate", type: "number", required: true },
            { name: "gule", label: "Gule", type: "number", required: true },
            { name: "price", label: "Harga (Rp)", type: "number", width: "1.3fr", required: true },
            { name: "sortOrder", label: "Urutan", type: "number", width: "80px" },
          ]}
          rows={rows}
          newDefaults={{ sortOrder: rows.length }}
          save={saveBundling}
          remove={deleteBundling}
          addLabel="Tambah baris"
        />
      </section>
    </>
  );
}

// Judul halaman tampil seketika saat berpindah menu; data (cek sesi + query) menyusul di dalam Suspense.
export default function BundlingPage() {
  return (
    <>
      <header className="a-header">
        <div>
          <p className="a-eyebrow">Paket & Harga</p>
          <h1>Bundling Box</h1>
        </div>
      </header>
      <Suspense fallback={<PanelFallback />}>
        <BundlingContent />
      </Suspense>
    </>
  );
}
