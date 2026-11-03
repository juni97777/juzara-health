import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { Role } from "@prisma/client";

const configuredSecret = process.env.SESSION_SECRET;
if (process.env.NODE_ENV === "production" && (!configuredSecret || configuredSecret.length < 32)) {
  throw new Error("SESSION_SECRET wajib diisi minimal 32 karakter di production.");
}
const secret = new TextEncoder().encode(configuredSecret || "local-development-secret-change-before-deploy-123456");
const key = "juzara_session";

export async function createSession(user: { id: string; role: Role; email: string }) {
  const token = await new SignJWT({ role: user.role, email: user.email })
    .setProtectedHeader({ alg: "HS256" }).setSubject(user.id).setIssuedAt().setExpirationTime("8h").sign(secret);
  const jar = await cookies();
  jar.set(key, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 28800 });
}

export async function getSession() {
  const jar = await cookies(); const token = jar.get(key)?.value; if (!token) return null;
  try { const { payload } = await jwtVerify(token, secret); return { userId: String(payload.sub), role: payload.role as Role, email: String(payload.email) }; }
  catch { return null; }
}
export async function destroySession() { const jar = await cookies(); jar.delete(key); }
