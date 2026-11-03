import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRoles } from "@/lib/authorization";
export async function GET() {
 const auth = await requireRoles(["PATIENT","DOCTOR","FACILITY_ADMIN","SUPER_ADMIN"]);
 if (auth.response) return auth.response;
 const notifications = await prisma.notification.findMany({ where: { userId: auth.session!.userId }, orderBy: { createdAt: "desc" }, take: 50 });
 return NextResponse.json({ notifications });
}
