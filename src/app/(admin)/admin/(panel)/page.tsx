import { count, desc } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PanelFallback } from "@/components/admin/PanelFallback";
import { StatusBadge, STATUS_LABEL } from "@/components/admin/StatusBadge";
import { db } from "@/db";
import { ORDER_STATUSES, orders } from "@/db/schema";
import { requireAdmin } from "@/lib/dal";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Dashboard" };

async function DashboardContent() {
  const user = await requireAdmin();
  const [byStatus, latest] = await Promise.all([
    db.select({ status: orders.status, total: count() }).from(orders).groupBy(orders.status),
    db.select().from(orders).orderBy(desc(orders.createdAt)).limit(5),
  ]);
  const totals = Object.fromEntries(byStatus.map((r) => [r.status, r.total]));

  return (
    <>
      <p className="a-greeting">Assalamu’alaikum, {user.name}.</p>

      <div className="a-stats">
        {ORDER_STATUSES.map((s) => (
          <Link key={s} href={`/admin/pesanan?status=${s}`} className={`a-stat a-stat--${s}`}>
            <span>Pesanan {STATUS_LABEL[s]}</span>
            <strong>{totals[s] ?? 0}</strong>
          </Link>
        ))}
      </div>

      <section className="a-card">
        <div className="a-card__head">
          <h2>Pesanan Terbaru</h2>
          <Link href="/admin/pesanan">Lihat semua →</Link>
        </div>
        {latest.length === 0 ? (
          <p className="a-muted">Belum ada pesanan masuk.</p>
        ) : (
          <table className="a-table">
            <thead>
              <tr>
                <th>Masuk</th>
                <th>Nama</th>
                <th>Paket</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {latest.map((o) => (
                <tr key={o.id}>
                  <td>{formatDateTime(o.createdAt)}</td>
                  <td>{o.name}</td>
                  <td>
                    {o.packageType} · {o.animal}
                  </td>
                  <td>
                    <StatusBadge status={o.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}

// Judul halaman tampil seketika saat berpindah menu; data (cek sesi + query) menyusul di dalam Suspense.
export default function DashboardPage() {
  return (
    <>
      <header className="a-header">
        <div>
          <p className="a-eyebrow">Ringkasan</p>
          <h1>Dashboard</h1>
        </div>
      </header>
      <Suspense fallback={<PanelFallback />}>
        <DashboardContent />
      </Suspense>
    </>
  );
}
