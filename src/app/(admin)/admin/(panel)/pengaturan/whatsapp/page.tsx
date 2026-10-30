import { desc } from "drizzle-orm";
import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { PanelFallback } from "@/components/admin/PanelFallback";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { WaTestForm } from "@/components/admin/WaTestForm";
import { db } from "@/db";
import { waMessages, type WaMessageKind } from "@/db/schema";
import { requireAdmin } from "@/lib/dal";
import { formatDateTime } from "@/lib/format";
import { getSiteSettings } from "@/lib/settings";
import { SETTINGS_KEYS, type SettingsValues } from "@/lib/settings-schema";
import { getDeviceInfo, waGatewayConfigured } from "@/lib/wa-gateway";

export const metadata: Metadata = { title: "WhatsApp Gateway" };

const KIND_LABEL: Record<WaMessageKind, string> = {
  admin: "Notifikasi admin",
  customer: "Konfirmasi pelanggan",
  status: "Update status",
  test: "Pesan tes",
};

async function WhatsAppContent() {
  await requireAdmin();
  // Status perangkat diambil langsung dari gateway, jadi hanya saat request (bukan saat prerender).
  await connection();
  const configured = waGatewayConfigured();
  const [settings, device, logs] = await Promise.all([
    getSiteSettings(),
    configured ? getDeviceInfo() : null,
    db.select().from(waMessages).orderBy(desc(waMessages.id)).limit(20),
  ]);
  const initial = Object.fromEntries(SETTINGS_KEYS.map((k) => [k, settings[k]])) as SettingsValues;

  return (
    <>
      <section className="a-card">
        <div className="a-card__head a-card__head--stack">
          <h2>Status perangkat</h2>
          {!configured ? (
            <p className="a-alert">
              WA Gateway belum dikonfigurasi. Isi <code>WA_GATEWAY_URL</code>, <code>WA_API_KEY</code>, dan <code>WA_SENDER</code> di
              file env server, lalu jalankan ulang aplikasi.
            </p>
          ) : !device?.ok ? (
            <p className="a-alert">{device?.error}</p>
          ) : device.connected ? (
            <p className="a-success">
              Terhubung ({device.status}). Total {device.messageSent} pesan terkirim dari perangkat ini.
            </p>
          ) : (
            <p className="a-alert">
              Perangkat {device.status}. Buka dashboard WA Gateway dan scan ulang QR dengan nomor pengirim.
            </p>
          )}
        </div>
        {configured && <WaTestForm defaultPhone={settings.admin1Phone} />}
      </section>

      <SettingsForm initial={initial} variant="whatsapp" />

      <section className="a-card">
        <div className="a-card__head">
          <h2>Pesan terakhir</h2>
        </div>
        {logs.length === 0 ? (
          <p className="a-muted">Belum ada pesan yang dikirim lewat WA Gateway.</p>
        ) : (
          <div className="a-table-wrap">
            <table className="a-table">
              <thead>
                <tr>
                  <th>Waktu</th>
                  <th>Jenis</th>
                  <th>Tujuan</th>
                  <th>Hasil</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id}>
                    <td className="a-nowrap">{formatDateTime(l.createdAt)}</td>
                    <td>
                      {KIND_LABEL[l.kind]}
                      {l.orderId && <span className="a-muted"> · #{l.orderId}</span>}
                    </td>
                    <td>{l.recipient}</td>
                    <td>{l.ok ? <span className="a-badge a-badge--wa-ok">Terkirim</span> : <span className="a-badge a-badge--wa-fail">Gagal</span>}
                      {l.error && <><br /><small className="a-muted">{l.error}</small></>}
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

// Judul halaman tampil seketika saat berpindah menu; status perangkat & data menyusul di dalam Suspense.
export default function WhatsAppPage() {
  return (
    <>
      <header className="a-header">
        <div>
          <p className="a-eyebrow">Pengaturan</p>
          <h1>WhatsApp Gateway</h1>
        </div>
        <p className="a-muted a-header__note">Pesan otomatis ke admin dan pelanggan dikirim dari nomor perangkat WA Gateway.</p>
      </header>
      <Suspense fallback={<PanelFallback />}>
        <WhatsAppContent />
      </Suspense>
    </>
  );
}
