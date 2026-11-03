import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireRoles } from "@/lib/authorization";

export async function GET() {
 const auth=await requireRoles(["FACILITY_ADMIN","SUPER_ADMIN"]);if(auth.response)return auth.response;
 const doctors=await prisma.doctor.findMany({include:{user:true,facilities:{include:{facility:true}},schedules:true},orderBy:{name:"asc"}});
 return NextResponse.json({doctors});
}
export async function POST(req:Request) {
 const auth=await requireRoles(["FACILITY_ADMIN","SUPER_ADMIN"]);if(auth.response)return auth.response;
 const p=z.object({name:z.string().min(3),specialty:z.string().min(3),email:z.email(),password:z.string().min(12),facilityId:z.string(),licenseNumber:z.string().optional()}).safeParse(await req.json());
 if(!p.success)return NextResponse.json({error:"Data dokter tidak valid. Password minimal 12 karakter."},{status:400});
 const exists=await prisma.user.findUnique({where:{email:p.data.email.toLowerCase()}});
 if(exists)return NextResponse.json({error:"Email akun dokter sudah terdaftar."},{status:409});
 const facility=await prisma.healthcareFacility.findUnique({where:{id:p.data.facilityId}});
 if(!facility)return NextResponse.json({error:"Fasilitas tidak ditemukan."},{status:404});
 const result=await prisma.$transaction(async tx=>{
  const user=await tx.user.create({data:{fullName:p.data.name,email:p.data.email.toLowerCase(),passwordHash:await bcrypt.hash(p.data.password,12),role:"DOCTOR"}});
  const doctor=await tx.doctor.create({data:{name:p.data.name,specialty:p.data.specialty,userId:user.id,licenseNumber:p.data.licenseNumber||null,isDemo:true}});
  await tx.doctorFacility.create({data:{doctorId:doctor.id,facilityId:facility.id}});
  await tx.auditLog.create({data:{userId:auth.session!.userId,action:"CREATE_DOCTOR",entity:"Doctor",entityId:doctor.id}});
  return {id:doctor.id,name:doctor.name,email:user.email};
 });
 return NextResponse.json({ok:true,doctor:result},{status:201});
}
