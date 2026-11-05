import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok", database: "connected" });
  } catch (error) {
    // Detail hanya masuk ke server logs, bukan dikirim ke browser publik.
    console.error("[health] Database connection failed:", error);
    return NextResponse.json(
      { status: "error", database: "unavailable", message: "Database belum dapat dihubungi. Periksa DATABASE_URL dan DIRECT_URL di Vercel." },
      { status: 503 },
    );
  }
}
