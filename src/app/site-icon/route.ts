import { connection } from "next/server";
import { getSiteSettings } from "@/lib/settings";

/**
 * URL favicon yang tetap (/site-icon, juga /favicon.ico lewat rewrite) dan mengarah ke favicon aktif.
 * Browser selalu meminta /favicon.ico, dan URL tetap berarti halaman tidak perlu dirender ulang saat favicon diganti.
 */
export async function GET(request: Request) {
  await connection(); // selalu baca pengaturan terbaru, jangan diprerender saat build
  const { favicon } = await getSiteSettings();
  return new Response(null, {
    status: 307,
    headers: { Location: new URL(favicon, request.url).toString(), "Cache-Control": "public, max-age=300" },
  });
}
