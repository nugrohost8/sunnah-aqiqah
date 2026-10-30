import { asc } from "drizzle-orm";
import type { Metadata } from "next";
import { Suspense } from "react";
import { CrudTable, type Field } from "@/components/admin/CrudTable";
import { PanelFallback } from "@/components/admin/PanelFallback";
import { db } from "@/db";
import { aqiqahPackages } from "@/db/schema";
import { requireAdmin } from "@/lib/dal";
import { deletePackage, savePackage } from "../../actions";

export const metadata: Metadata = { title: "Paket Aqiqah" };

const priceFields: Field[] = [
  { name: "code", label: "Kode", width: "80px", required: true, placeholder: "A" },
  { name: "priceBetina", label: "Harga Betina (Rp)", type: "number", required: true },
  { name: "priceJantan", label: "Harga Jantan (Rp)", type: "number", required: true },
];
const tail: Field[] = [
  { name: "sortOrder", label: "Urutan", type: "number", width: "80px" },
  { name: "active", label: "Aktif", type: "checkbox", width: "60px" },
];

async function PackagesContent() {
  await requireAdmin();
  const rows = await db.select().from(aqiqahPackages).orderBy(asc(aqiqahPackages.sortOrder));
  const masak = rows.filter((r) => r.kind === "masak");
  const tanpaMasak = rows.filter((r) => r.kind === "tanpa_masak");

  return (
    <>
      <section className="a-card">
        <div className="a-card__head">
          <h2>Aqiqah Plus Masak</h2>
          <p className="a-muted">Harga per paket, sudah dimasak menjadi sate & gule.</p>
        </div>
        <CrudTable
          fields={[
            ...priceFields,
            { name: "sate", label: "Sate (tusuk)", type: "number", width: "110px", required: true },
            { name: "gule", label: "Gule (porsi)", type: "number", width: "110px", required: true },
            ...tail,
          ]}
          rows={masak}
          hidden={{ kind: "masak" }}
          newDefaults={{ sortOrder: masak.length }}
          save={savePackage}
          remove={deletePackage}
          addLabel="Tambah paket"
        />
      </section>

      <section className="a-card">
        <div className="a-card__head">
          <h2>Aqiqah Tanpa Masak</h2>
          <p className="a-muted">Hewan disembelih, diserahkan mentah.</p>
        </div>
        <CrudTable
          fields={[...priceFields, { name: "porsi", label: "Porsi", width: "110px", placeholder: "15–20" }, ...tail]}
          rows={tanpaMasak}
          hidden={{ kind: "tanpa_masak" }}
          newDefaults={{ sortOrder: tanpaMasak.length }}
          save={savePackage}
          remove={deletePackage}
          addLabel="Tambah paket"
        />
      </section>
    </>
  );
}

// Judul halaman tampil seketika saat berpindah menu; data (cek sesi + query) menyusul di dalam Suspense.
export default function PackagesPage() {
  return (
    <>
      <header className="a-header">
        <div>
          <p className="a-eyebrow">Paket & Harga</p>
          <h1>Paket Aqiqah</h1>
        </div>
      </header>
      <Suspense fallback={<PanelFallback />}>
        <PackagesContent />
      </Suspense>
    </>
  );
}
