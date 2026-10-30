import { asc } from "drizzle-orm";
import type { Metadata } from "next";
import { Suspense } from "react";
import { CrudTable } from "@/components/admin/CrudTable";
import { PanelFallback } from "@/components/admin/PanelFallback";
import { db } from "@/db";
import { partners } from "@/db/schema";
import { requireAdmin } from "@/lib/dal";
import { deletePartner, savePartner } from "../../actions";

export const metadata: Metadata = { title: "Partner" };

async function PartnersContent() {
  await requireAdmin();
  const rows = await db.select().from(partners).orderBy(asc(partners.sortOrder));

  return (
    <>
      <section className="a-card">
        <div className="a-card__head">
          <p className="a-muted">
            Logo diisi dengan path file di folder <code>public/</code> (mis. <code>/images/partners/gap.png</code>) atau URL gambar.
          </p>
        </div>
        <CrudTable
          fields={[
            { name: "name", label: "Nama", required: true },
            { name: "logo", label: "Logo (path / URL)", width: "1.4fr", required: true, placeholder: "/images/partners/..." },
            { name: "sortOrder", label: "Urutan", type: "number", width: "80px" },
            { name: "active", label: "Aktif", type: "checkbox", width: "60px" },
          ]}
          rows={rows}
          newDefaults={{ sortOrder: rows.length }}
          save={savePartner}
          remove={deletePartner}
          addLabel="Tambah partner"
        />
      </section>
    </>
  );
}

// Judul halaman tampil seketika saat berpindah menu; data (cek sesi + query) menyusul di dalam Suspense.
export default function PartnersPage() {
  return (
    <>
      <header className="a-header">
        <div>
          <p className="a-eyebrow">Konten</p>
          <h1>Partner</h1>
        </div>
      </header>
      <Suspense fallback={<PanelFallback />}>
        <PartnersContent />
      </Suspense>
    </>
  );
}
