import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRoles } from "@/lib/authorization";
export async function PATCH(req:Request,ctx:{params:Promise<{id:string}>}){
 const auth=await requireRoles(["FACILITY_ADMIN","SUPER_ADMIN"]);if(auth.response)return auth.response;
 const {id}=await ctx.params;
 const p=z.object({startTime:z.string().optional(),endTime:z.string().optional(),quota:z.number().int().min(1).max(100).optional(),durationMins:z.number().int().min(5).max(120).optional(),isActive:z.boolean().optional()}).safeParse(await req.json());
 if(!p.success)return NextResponse.json({error:"Perubahan jadwal tidak valid."},{status:400});
 const schedule=await prisma.doctorSchedule.update({where:{id},data:p.data});
 await prisma.auditLog.create({data:{userId:auth.session!.userId,action:"UPDATE_DOCTOR_SCHEDULE",entity:"DoctorSchedule",entityId:id}});
 return NextResponse.json({ok:true,schedule});
}
export async function DELETE(_req:Request,ctx:{params:Promise<{id:string}>}){
 const auth=await requireRoles(["FACILITY_ADMIN","SUPER_ADMIN"]);if(auth.response)return auth.response;
 const {id}=await ctx.params;
 const schedule=await prisma.doctorSchedule.update({where:{id},data:{isActive:false}});
 await prisma.auditLog.create({data:{userId:auth.session!.userId,action:"DEACTIVATE_DOCTOR_SCHEDULE",entity:"DoctorSchedule",entityId:id}});
 return NextResponse.json({ok:true,schedule});
}
