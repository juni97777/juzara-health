import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRoles } from "@/lib/authorization";

export async function GET() {
  const auth = await requireRoles(["PATIENT","DOCTOR","FACILITY_ADMIN","SUPER_ADMIN"]);
  if (auth.response) return auth.response;
  const s = auth.session!;
  const where = s.role === "PATIENT" ? { patient: { userId: s.userId } }
    : s.role === "DOCTOR" ? { doctor: { userId: s.userId } } : {};
  const consultations = await prisma.consultation.findMany({
    where, include: { patient: { include: { user: true } }, doctor: true, appointment: true, messages: true, record: true },
    orderBy: { appointment: { visitDate: "desc" } }
  });
  return NextResponse.json({ consultations });
}

export async function POST(req: Request) {
  const auth = await requireRoles(["DOCTOR"]);
  if (auth.response) return auth.response;
  const s = auth.session!;
  const doctor = await prisma.doctor.findUnique({ where: { userId: s.userId } });
  if (!doctor) return NextResponse.json({ error: "Profil dokter tidak ditemukan." }, { status: 404 });
  const body = await req.json();
  const appointment = await prisma.appointment.findFirst({ where: { id: body.appointmentId, doctorId: doctor.id } });
  if (!appointment) return NextResponse.json({ error: "Pendaftaran tidak ditemukan untuk dokter ini." }, { status: 404 });
  const record = await prisma.consultation.upsert({
    where: { appointmentId: appointment.id },
    update: { status: body.status === "COMPLETED" ? "COMPLETED" : "ACTIVE", endedAt: body.status === "COMPLETED" ? new Date() : null },
    create: { appointmentId: appointment.id, patientId: appointment.patientId, doctorId: doctor.id, status: "ACTIVE", startedAt: new Date() }
  });
  await prisma.appointment.update({where:{id:appointment.id},data:{status:"IN_SERVICE"}});
  await prisma.notification.create({data:{userId:appointment.patientId ? (await prisma.patientProfile.findUniqueOrThrow({where:{id:appointment.patientId}})).userId : s.userId,title:"Konsultasi dimulai",body:"Dokter telah membuka ruang konsultasi Anda."}});
  if (body.notes) {
    await prisma.consultationRecord.upsert({
      where: { consultationId: record.id },
      update: { notes: body.notes, recommendations: body.recommendations || null },
      create: { consultationId: record.id, notes: body.notes, recommendations: body.recommendations || null }
    });
  }
  if (body.status === "COMPLETED") {
    await prisma.appointment.update({ where: { id: appointment.id }, data: { status: "COMPLETED" } });
  }
  return NextResponse.json({ ok: true, consultation: record });
}
