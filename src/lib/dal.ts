import "server-only";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { decrypt, SESSION_COOKIE } from "./jwt";

/**
 * Pemeriksaan otorisasi yang sebenarnya. Wajib dipanggil di setiap halaman admin
 * dan setiap server action admin — proxy.ts hanya pemeriksaan awal (optimistic).
 */
export async function requireAdmin() {
  const session = await decrypt((await cookies()).get(SESSION_COOKIE)?.value);
  if (!session) redirect("/admin/login");

  const [user] = await db
    .select({ id: adminUsers.id, name: adminUsers.name, email: adminUsers.email })
    .from(adminUsers)
    .where(eq(adminUsers.id, session.userId))
    .limit(1);
  if (!user) redirect("/admin/login");

  return user;
}
