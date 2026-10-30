import "server-only";
import { toWaNumber } from "./format";

/**
 * Client WA Gateway (https://wag.homeitop.web.id). Kredensial dari env:
 * WA_GATEWAY_URL, WA_API_KEY, WA_SENDER (nomor device yang sudah di-pair di dashboard gateway).
 *
 * Fungsi di sini tidak pernah melempar error: kegagalan WhatsApp tidak boleh menggagalkan pesanan.
 */

export type WaResult = { ok: true } | { ok: false; error: string };
export type DeviceInfo = { ok: true; connected: boolean; status: string; messageSent: number } | { ok: false; error: string };

const TIMEOUT_MS = 15_000;

function config() {
  const url = process.env.WA_GATEWAY_URL?.replace(/\/+$/, "");
  const apiKey = process.env.WA_API_KEY;
  const sender = process.env.WA_SENDER;
  return url && apiKey && sender ? { url, apiKey, sender: toWaNumber(sender) } : null;
}

export const waGatewayConfigured = () => config() !== null;

/** Ubah pesan gateway menjadi pesan yang dimengerti admin. Dicocokkan per awalan, sesuai saran dokumentasi. */
function explain(msg: string) {
  if (msg.startsWith("Invalid api_key")) return "API key atau nomor pengirim (WA_SENDER) salah.";
  if (msg.startsWith("Your device is not connected")) return "Perangkat WA Gateway terputus. Scan ulang QR di dashboard gateway.";
  if (msg.startsWith("Failed to send message! The destination Number not registered"))
    return "Nomor tujuan tidak terdaftar di WhatsApp.";
  if (msg.startsWith("Failed to send message!, Check your connection")) return "Server WA Gateway sedang bermasalah.";
  return msg.slice(0, 200);
}

async function post(path: string, body: Record<string, string>) {
  const cfg = config();
  if (!cfg) return { ok: false as const, error: "WA Gateway belum dikonfigurasi (WA_GATEWAY_URL, WA_API_KEY, WA_SENDER)." };

  let res: Response;
  try {
    res = await fetch(`${cfg.url}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ api_key: cfg.apiKey, sender: cfg.sender, number: cfg.sender, ...body }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
  } catch (err) {
    console.error(`WA Gateway ${path} tidak bisa dihubungi`, err);
    return { ok: false as const, error: "WA Gateway tidak bisa dihubungi." };
  }

  const data = (await res.json().catch(() => null)) as { status?: boolean; msg?: string; message?: string; info?: unknown } | null;
  const msg = String(data?.msg ?? data?.message ?? "");
  if (res.status === 403) return { ok: false as const, error: "Langganan WA Gateway sudah habis." };
  if (res.status === 429) return { ok: false as const, error: "Batas kirim WA Gateway tercapai. Coba lagi sebentar." };
  if (!res.ok || !data?.status) return { ok: false as const, error: explain(msg) || `WA Gateway error (HTTP ${res.status}).` };
  return { ok: true as const, data };
}

export async function sendWaMessage(phone: string, message: string): Promise<WaResult> {
  const result = await post("/send-message", { number: toWaNumber(phone), message });
  return result.ok ? { ok: true } : result;
}

export async function getDeviceInfo(): Promise<DeviceInfo> {
  const result = await post("/info-device", {});
  if (!result.ok) return result;
  const [device] = (result.data.info ?? []) as { status?: string; message_sent?: number }[];
  if (!device) return { ok: false, error: "Perangkat tidak ditemukan untuk nomor pengirim ini." };
  const status = String(device.status ?? "Tidak diketahui");
  return { ok: true, connected: status === "Connected", status, messageSent: Number(device.message_sent ?? 0) };
}
