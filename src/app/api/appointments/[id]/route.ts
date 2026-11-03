import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRoles } from "@/lib/authorization";

export async function PATCH(req:Request,ctx:{params:Promise<{id:string}>}){
 const auth=await requireRoles(["PATIENT","DOCTOR","FACILITY_ADMIN","SUPER_ADMIN"]);if(auth.response)return auth.response;
 const {id}=await ctx.params;const s=auth.session!;
 const parsed=z.object({status:z.enum(["WAITING","IN_SERVICE","COMPLETED","CANCELLED","NO_SHOW"])}).safeParse(await req.json());
 if(!parsed.success)return NextResponse.json({error:"Status tidak valid."},{status:400});
 const appointment=await prisma.appointment.findUnique({where:{id},include:{patient:{include:{user:true}},doctor:true}});
 if(!appointment)return NextResponse.json({error:"Reservasi tidak ditemukan."},{status:404});
 const next=parsed.data.status;
 if(s.role==="PATIENT"){
   if(appointment.patient.userId!==s.userId)return NextResponse.json({error:"Bukan reservasi milik Anda."},{status:403});
   if(next!=="CANCELLED"||["IN_SERVICE","COMPLETED","NO_SHOW"].includes(appointment.status))return NextResponse.json({error:"Pasien hanya dapat membatalkan reservasi yang belum dilayani."},{status:403});
 } else if(s.role==="DOCTOR"){
   if(appointment.doctor.userId!==s.userId)return NextResponse.json({error:"Reservasi bukan pasien dokter ini."},{status:403});
   if(!["WAITING","IN_SERVICE","COMPLETED","NO_SHOW"].includes(next))return NextResponse.json({error:"Dokter tidak dapat melakukan perubahan status tersebut."},{status:403});
 } else if(!["WAITING","IN_SERVICE","COMPLETED","CANCELLED","NO_SHOW"].includes(next)) {
   return NextResponse.json({error:"Status tidak diizinkan."},{status:403});
 }
 const updated=await prisma.appointment.update({where:{id},data:{status:next}});
 await prisma.notification.create({data:{userId:appointment.patient.userId,title:"Status reservasi diperbarui",body:`Status reservasi ${appointment.bookingCode} sekarang: ${next}.`}});
 await prisma.auditLog.create({data:{userId:s.userId,action:"UPDATE_APPOINTMENT_STATUS",entity:"Appointment",entityId:id,metadata:{from:appointment.status,to:next}}});
 return NextResponse.json({ok:true,appointment:updated});
}
