import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { AdminRole } from "@/generated/prisma/client";

export const SESSION_COOKIE = "admin_session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 jours

const secret = process.env.SESSION_SECRET;
if (!secret) throw new Error("SESSION_SECRET manquant dans .env");
const encodedKey = new TextEncoder().encode(secret);

export type SessionPayload = {
  adminId: string;
  role: AdminRole;
};

export async function signAccessToken(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

export async function verifyAccessToken(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, encodedKey, { algorithms: ["HS256"] });
    return payload as SessionPayload;
  } catch {
    return null; // signature invalide, token modifié ou expiré
  }
}

export async function createSession(payload: SessionPayload) {
  const token = await signAccessToken(payload);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(Date.now() + SESSION_DURATION_MS),
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  return verifyAccessToken(cookieStore.get(SESSION_COOKIE)?.value);
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
