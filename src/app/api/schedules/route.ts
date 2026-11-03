import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRoles } from "@/lib/authorization";
export async function GET(req: Request) {
  const auth = await requireRoles(["PATIENT","DOCTOR","FACILITY_ADMIN","SUPER_ADMIN"]);
  if (auth.response) return auth.response;
  const url = new URL(req.url);
  const doctorId = url.searchParams.get("doctorId");
  const facilityId = url.searchParams.get("facilityId");
  const schedules = await prisma.doctorSchedule.findMany({
    where: { isActive: true, ...(doctorId ? { doctorId } : {}), ...(facilityId ? { facilityId } : {}) },
    include: { doctor: true, facility: true }, orderBy: [{ weekday: "asc" }, { startTime: "asc" }]
  });
  return NextResponse.json({ schedules });
}
