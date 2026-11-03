import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRoles } from "@/lib/authorization";
export async function GET() {
 const auth = await requireRoles(["FACILITY_ADMIN","SUPER_ADMIN"]);
 if (auth.response) return auth.response;
 const facilities = await prisma.healthcareFacility.findMany({ include: { doctors: { include: { doctor: true } }, services: true } });
 return NextResponse.json({ facilities });
}
export async function POST(req: Request) {
 const auth = await requireRoles(["FACILITY_ADMIN","SUPER_ADMIN"]);
 if (auth.response) return auth.response;
 const parsed = z.object({name:z.string().min(3),type:z.enum(["PUSKESMAS","CLINIC","HOSPITAL","LABORATORY"]),address:z.string().min(5),region:z.string().min(2),phone:z.string().optional(),openingHours:z.string().optional()}).safeParse(await req.json());
 if (!parsed.success) return NextResponse.json({error:"Data fasilitas tidak valid."},{status:400});
 const facility = await prisma.healthcareFacility.create({data:{...parsed.data,isDemo:true}});
 await prisma.auditLog.create({data:{userId:auth.session!.userId,action:"CREATE_FACILITY",entity:"HealthcareFacility",entityId:facility.id}});
 return NextResponse.json({ok:true,facility},{status:201});
}
