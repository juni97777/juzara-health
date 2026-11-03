import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRoles } from "@/lib/authorization";
export async function GET(req: Request) {
  const auth = await requireRoles(["PATIENT","DOCTOR","FACILITY_ADMIN","SUPER_ADMIN"]);
  if (auth.response) return auth.response;
  const facilityId = new URL(req.url).searchParams.get("facilityId");
  const doctors = await prisma.doctor.findMany({
    where: facilityId ? { facilities: { some: { facilityId } } } : {},
    include: { facilities: { include: { facility: true } }, schedules: { where: { isActive: true } } },
    orderBy: { name: "asc" }
  });
  return NextResponse.json({ doctors });
}
