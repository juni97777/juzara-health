import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRoles } from "@/lib/authorization";

export async function POST(req:Request,ctx:{params:Promise<{id:string}>}){
 const auth=await requireRoles(["FACILITY_ADMIN","SUPER_ADMIN"]);if(auth.response)return auth.response;
 const {id}=await ctx.params;
 const parsed=z.object({status:z.enum(["VALIDATED","REJECTED"]),note:z.string().max(1000).optional()}).safeParse(await req.json());
 if(!parsed.success)return NextResponse.json({error:"Status validasi tidak valid."},{status:400});
 const result=await prisma.laboratoryResult.findUnique({where:{id},include:{patient:{include:{user:true}}}});
 if(!result)return NextResponse.json({error:"Hasil lab tidak ditemukan."},{status:404});
 const updated=await prisma.$transaction(async tx=>{
  const lab=await tx.laboratoryResult.update({where:{id},data:{validationStatus:parsed.data.status}});
  await tx.laboratoryValidation.create({data:{resultId:id,validatorName:auth.session!.email,validatedAt:new Date(),status:parsed.data.status,note:parsed.data.note}});
  await tx.notification.create({data:{userId:result.patient.userId,title:"Pembaruan hasil laboratorium",body:`Hasil ${result.testName}: ${parsed.data.status}.`}});
  await tx.auditLog.create({data:{userId:auth.session!.userId,action:"VALIDATE_LAB_RESULT",entity:"LaboratoryResult",entityId:id,metadata:{status:parsed.data.status}}});
  return lab;
 });
 return NextResponse.json({ok:true,result:updated});
}
