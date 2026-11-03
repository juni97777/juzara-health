import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRoles } from "@/lib/authorization";
export async function POST(req: Request) {
 const auth = await requireRoles(["FACILITY_ADMIN","SUPER_ADMIN"]);
 if (auth.response) return auth.response;
 const parsed = z.object({doctorId:z.string(),facilityId:z.string(),weekday:z.number().int().min(0).max(6),startTime:z.string(),endTime:z.string(),quota:z.number().int().min(1).max(100),durationMins:z.number().int().min(5).max(120)}).safeParse(await req.json());
 if (!parsed.success) return NextResponse.json({error:"Data jadwal tidak valid."},{status:400});
 const schedule = await prisma.doctorSchedule.create({data:parsed.data});
 await prisma.auditLog.create({data:{userId:auth.session!.userId,action:"CREATE_DOCTOR_SCHEDULE",entity:"DoctorSchedule",entityId:schedule.id}});
 return NextResponse.json({ok:true,schedule},{status:201});
}
