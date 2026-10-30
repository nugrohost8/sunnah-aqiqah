import "server-only";
import { cookies } from "next/headers";
import { encrypt, SESSION_COOKIE, SESSION_TTL_SECONDS } from "./jwt";

export async function createSession(userId: number) {
  const token = await encrypt({ userId });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function deleteSession() {
  (await cookies()).delete(SESSION_COOKIE);
}
