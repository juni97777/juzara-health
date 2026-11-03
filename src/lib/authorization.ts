import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";
import type { Role } from "@prisma/client";

export async function requireRoles(roles: Role[]) {
  const session = await getSession();
  if (!session) return { session: null, response: NextResponse.json({ error: "Silakan login terlebih dahulu." }, { status: 401 }) };
  if (!roles.includes(session.role)) return { session: null, response: NextResponse.json({ error: "Anda tidak memiliki hak akses." }, { status: 403 }) };
  return { session, response: null };
}
