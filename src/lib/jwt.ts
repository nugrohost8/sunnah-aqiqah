import { jwtVerify, SignJWT } from "jose";

// Dipakai oleh proxy.ts dan session.ts, jadi tidak boleh bergantung pada next/headers.

export const SESSION_COOKIE = "sa_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 hari

export type SessionPayload = { userId: number };

function secretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET belum diset atau kurang dari 32 karakter");
  }
  return new TextEncoder().encode(secret);
}

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(secretKey());
}

export async function decrypt(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify<SessionPayload>(token, secretKey(), { algorithms: ["HS256"] });
    return typeof payload.userId === "number" ? { userId: payload.userId } : null;
  } catch {
    return null;
  }
}
