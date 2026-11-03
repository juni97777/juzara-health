import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { prisma } from "@/lib/prisma";
import { requireRoles } from "@/lib/authorization";

export async function GET(_req:Request,ctx:{params:Promise<{id:string}>}){
 const auth=await requireRoles(["PATIENT","DOCTOR","FACILITY_ADMIN","SUPER_ADMIN"]);if(auth.response)return auth.response;
 const {id}=await ctx.params;const s=auth.session!;
 const result=await prisma.laboratoryResult.findUnique({where:{id},include:{patient:{include:{user:true}},validations:true}});
 if(!result)return NextResponse.json({error:"Hasil pemeriksaan tidak ditemukan."},{status:404});
 if(s.role==="PATIENT"&&result.patient.userId!==s.userId)return NextResponse.json({error:"Anda tidak berhak mengakses hasil ini."},{status:403});
 if(s.role==="PATIENT"&&result.validationStatus!=="VALIDATED")return NextResponse.json({error:"Hasil belum divalidasi petugas."},{status:403});
 const pdf=await PDFDocument.create();const page=pdf.addPage([595,842]);const font=await pdf.embedFont(StandardFonts.Helvetica);const bold=await pdf.embedFont(StandardFonts.HelveticaBold);
 page.drawText("JUZARA HEALTH - LAPORAN HASIL LABORATORIUM",{x:45,y:790,size:15,font:bold});
 const lines=[
  `Nama pasien: ${result.patient.user.fullName}`,
  `Pemeriksaan: ${result.testName}`,
  `Jenis pemeriksaan: ${result.testType}`,
  `Tanggal: ${result.testDate.toLocaleDateString("id-ID")}`,
  `Hasil: ${result.result} ${result.unit||""}`,
  `Rentang referensi: ${result.referenceRange||"-"}`,
  `Interpretasi: ${result.interpretation||"-"}`,
  `Status validasi: ${result.validationStatus}`,
  `Catatan: Dokumen ini merupakan keluaran aplikasi; periksa validasi dan sumber data.`
 ];
 let y=740;for(const line of lines){page.drawText(line,{x:45,y,size:11,font});y-=30;}
 page.drawText("Dokumen demonstrasi JUZARA Health",{x:45,y:70,size:9,font});
const bytes = await pdf.save();

const body = new ArrayBuffer(bytes.byteLength);
new Uint8Array(body).set(bytes);

return new NextResponse(body, {
  headers: {
    "Content-Type": "application/pdf",
    "Content-Disposition": "attachment; filename=laboratory-result.pdf",
  },
});
