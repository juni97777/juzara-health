import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRoles } from "@/lib/authorization";
export async function GET() {
 const auth = await requireRoles(["PATIENT","DOCTOR","FACILITY_ADMIN","SUPER_ADMIN"]);
 if (auth.response) return auth.response;
 const s = auth.session!;
 const results = await prisma.laboratoryResult.findMany({
   where: s.role === "PATIENT" ? { patient: { userId: s.userId } } : {},
   include: { validations: true, patient: { include: { user: true } } },
   orderBy: { testDate: "desc" }
 });
 return NextResponse.json({ results });
}
