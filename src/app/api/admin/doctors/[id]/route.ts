import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRoles } from "@/lib/authorization";
export async function PATCH(req:Request,ctx:{params:Promise<{id:string}>}){
 const auth=await requireRoles(["FACILITY_ADMIN","SUPER_ADMIN"]);if(auth.response)return auth.response;
 const {id}=await ctx.params;
 const p=z.object({name:z.string().min(3).optional(),specialty:z.string().min(3).optional(),isActive:z.boolean().optional()}).safeParse(await req.json());
 if(!p.success)return NextResponse.json({error:"Data tidak valid."},{status:400});
 const doctor=await prisma.doctor.findUnique({where:{id},include:{user:true}});
 if(!doctor)return NextResponse.json({error:"Dokter tidak ditemukan."},{status:404});
 const updated=await prisma.doctor.update({where:{id},data:{name:p.data.name,specialty:p.data.specialty}});
 if(doctor.userId&&p.data.isActive!==undefined)await prisma.user.update({where:{id:doctor.userId},data:{isActive:p.data.isActive}});
 await prisma.auditLog.create({data:{userId:auth.session!.userId,action:"UPDATE_DOCTOR",entity:"Doctor",entityId:id}});
 return NextResponse.json({ok:true,doctor:updated});
}
