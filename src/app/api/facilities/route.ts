import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRoles } from "@/lib/authorization";

export async function GET(req: Request) {
  const auth = await requireRoles(["PATIENT","DOCTOR","FACILITY_ADMIN","SUPER_ADMIN"]);
  if (auth.response) return auth.response;
  const url = new URL(req.url);
  const q = url.searchParams.get("q") || "";
  const type = url.searchParams.get("type") || undefined;
  const facilities = await prisma.healthcareFacility.findMany({
    where: { AND: [
      { OR: [{ name: { contains: q, mode: "insensitive" } }, { region: { contains: q, mode: "insensitive" } }, { address: { contains: q, mode: "insensitive" } }] },
      type ? { type: type as any } : {}
    ] },
    include: { services: true, doctors: { include: { doctor: { include: { schedules: true } } } } },
    orderBy: { name: "asc" }
  });
  return NextResponse.json({ facilities });
}
