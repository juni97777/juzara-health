import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const configuredSecret = process.env.SESSION_SECRET;
if (process.env.NODE_ENV === "production" && (!configuredSecret || configuredSecret.length < 32)) {
  throw new Error("SESSION_SECRET wajib diisi minimal 32 karakter di production.");
}
const secret = new TextEncoder().encode(configuredSecret || "local-development-secret-change-before-deploy-123456");

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isPublic = path === "/" || path === "/login" || path === "/register" || path === "/api/health" || path.startsWith("/api/auth/") || path.startsWith("/_next/") || path === "/favicon.ico";
  if (isPublic) return NextResponse.next();
  const token = req.cookies.get("juzara_session")?.value;
  if (!token) { const url = new URL("/login", req.url); url.searchParams.set("next", path); return NextResponse.redirect(url); }
  try { await jwtVerify(token, secret); return NextResponse.next(); }
  catch { const response = NextResponse.redirect(new URL("/login", req.url)); response.cookies.delete("juzara_session"); return response; }
}
export const config = { matcher: ["/((?!.*\\.).*)", "/api/:path*"] };
