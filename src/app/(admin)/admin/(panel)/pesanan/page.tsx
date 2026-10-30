import { desc, eq, inArray } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { DeleteButton, SubmitButton } from "@/components/admin/Buttons";
import { PanelFallback } from "@/components/admin/PanelFallback";
import { StatusBadge, STATUS_LABEL } from "@/components/admin/StatusBadge";
import { db } from "@/db";
import { ORDER_STATUSES, orders, waMessages, type OrderStatus, type WaMessage } from "@/db/schema";
import { requireAdmin } from "@/lib/dal";
import { formatDate, formatDateTime, toWaNumber } from "@/lib/format";
import { deleteOrder, resendOrderWa, updateOrderStatus } from "../../actions";

export const metadata: Metadata = { title: "Pesanan" };

/** Ringkasan WA per pesanan: hanya percobaan terakhir per jenis & penerima yang dihitung. */
function summarizeWa(logs: WaMessage[]) {
  const latest = new Map<string, WaMessage>();
  for (const l of logs) if (!latest.has(`${l.kind}:${l.recipient}`)) latest.set(`${l.kind}:${l.recipient}`, l);
  const items = [...latest.values()];
  return { sent: items.filter((l) => l.ok).length, failed: items.filter((l) => !l.ok) };
}

type SearchParams = PageProps<"/admin/pesanan">["searchParams"];

async function OrdersContent({ searchParams }: { searchParams: SearchParams }) {
  await requireAdmin();
  const param = (await searchParams).status;
  const status = ORDER_STATUSES.find((s) => s === param) as OrderStatus | undefined;

  const rows = await db
    .select()
    .from(orders)
    .where(status ? eq(orders.status, status) : undefined)
    .orderBy(desc(orders.createdAt))
    .limit(200);

  const logs = rows.length
    ? await db
        .select()
        .from(waMessages)
        .where(inArray(waMessages.orderId, rows.map((o) => o.id)))
        .orderBy(desc(waMessages.id))
    : [];
  const waByOrder = new Map<number, WaMessage[]>();
  for (const l of logs) if (l.orderId) waByOrder.set(l.orderId, [...(waByOrder.get(l.orderId) ?? []), l]);

  return (
    <>
      <nav className="a-tabs a-tabs--bar">
        <Link href="/admin/pesanan" className={!status ? "active" : undefined}>
          Semua
        </Link>
        {ORDER_STATUSES.map((s) => (
          <Link key={s} href={`/admin/pesanan?status=${s}`} className={status === s ? "active" : undefined}>
            {STATUS_LABEL[s]}
          </Link>
        ))}
      </nav>

      <section className="a-card">
        {rows.length === 0 ? (
          <p className="a-muted">Tidak ada pesanan{status ? ` berstatus ${STATUS_LABEL[status].toLowerCase()}` : ""}.</p>
        ) : (
          <div className="a-table-wrap">
            <table className="a-table a-table--orders">
              <thead>
                <tr>
                  <th>Masuk</th>
                  <th>Pemesan</th>
                  <th>Ananda / Acara</th>
                  <th>Paket</th>
                  <th>Catatan</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((o) => (
                  <tr key={o.id}>
                    <td className="a-nowrap">
                      {formatDateTime(o.createdAt)}
                      <br />
                      <StatusBadge status={o.status} />
                    </td>
                    <td>
                      <strong>{o.name}</strong>
                      <br />
                      <a href={`https://wa.me/${toWaNumber(o.phone)}`} target="_blank" rel="noopener">
                        {o.phone} ↗
                      </a>
                    </td>
                    <td>
                      {o.childName ?? "—"}
                      <br />
                      <span className="a-muted">{o.eventDate ? formatDate(o.eventDate) : "Tanggal belum diisi"}</span>
                    </td>
                    <td>
                      {o.packageType}
                      <br />
                      <span className="a-muted">{o.animal}</span>
                    </td>
                    <td className="a-notes">{o.notes ?? "—"}</td>
                    <td>
                      <form action={updateOrderStatus} className="a-inline-form">
                        <input type="hidden" name="id" value={o.id} />
                        <select name="status" defaultValue={o.status} aria-label="Status pesanan">
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {STATUS_LABEL[s]}
                            </option>
                          ))}
                        </select>
                        <SubmitButton>Simpan</SubmitButton>
                        <DeleteButton action={deleteOrder} confirmText={`Hapus pesanan dari ${o.name}?`} />
                      </form>
                      <WaSummary orderId={o.id} logs={waByOrder.get(o.id) ?? []} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

function WaSummary({ orderId, logs }: { orderId: number; logs: WaMessage[] }) {
  if (logs.length === 0) return null;
  const { sent, failed } = summarizeWa(logs);
  return (
    <form action={resendOrderWa} className="a-wa">
      <input type="hidden" name="id" value={orderId} />
      {sent > 0 && <span className="a-badge a-badge--wa-ok">WA terkirim {sent}</span>}
      {failed.length > 0 && (
        <>
          <span className="a-badge a-badge--wa-fail" title={failed.map((l) => `${l.recipient}: ${l.error}`).join("\n")}>
            WA gagal {failed.length}
          </span>
          <SubmitButton small pendingText="Mengirim…">
            Kirim ulang
          </SubmitButton>
        </>
      )}
    </form>
  );
}

// Judul halaman tampil seketika saat berpindah menu; filter & data menyusul di dalam Suspense.
export default function OrdersPage({ searchParams }: PageProps<"/admin/pesanan">) {
  return (
    <>
      <header className="a-header">
        <div>
          <p className="a-eyebrow">Pesanan dari formulir situs</p>
          <h1>Pesanan</h1>
        </div>
      </header>
      <Suspense fallback={<PanelFallback />}>
        <OrdersContent searchParams={searchParams} />
      </Suspense>
    </>
  );
}
