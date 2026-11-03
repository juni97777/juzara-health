import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const schema = z.object({
  doctorId: z.string(), facilityId: z.string(), scheduleId: z.string(),
  visitDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), startTime: z.string().regex(/^\d{2}:\d{2}$/),
  mainComplaint: z.string().min(3), symptoms: z.string().min(3),
  duration: z.string().min(1), severity: z.string().min(1),
  relevantHistory: z.string().optional(), additionalNotes: z.string().optional()
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "PATIENT") return NextResponse.json({ error: "Login sebagai pasien diperlukan." }, { status: 403 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Data reservasi belum lengkap atau format tanggal/jam salah." }, { status: 400 });
  const p = parsed.data;
  const profile = await prisma.patientProfile.findUnique({ where: { userId: session.userId } });
  if (!profile) return NextResponse.json({ error: "Profil pasien tidak ditemukan." }, { status: 404 });

  try {
    const appointment = await prisma.$transaction(async tx => {
      const schedule = await tx.doctorSchedule.findFirst({
        where: { id: p.scheduleId, doctorId: p.doctorId, facilityId: p.facilityId, isActive: true },
        include: { doctor: true, facility: true }
      });
      if (!schedule) throw new Error("Jadwal tidak tersedia.");
      const [year, month, day] = p.visitDate.split("-").map(Number);
      const date = new Date(Date.UTC(year, month - 1, day));
      if (date.toISOString().slice(0, 10) !== p.visitDate) throw new Error("Tanggal tidak valid.");
      const weekday = date.getUTCDay();
      if (schedule.weekday !== weekday) throw new Error("Tanggal tidak sesuai hari praktik dokter.");
      if (p.startTime < schedule.startTime || p.startTime >= schedule.endTime) throw new Error("Jam berada di luar jadwal praktik.");
      const patientDuplicate = await tx.appointment.findFirst({
        where: { patientId: profile.id, visitDate: date, status: { notIn: ["CANCELLED", "NO_SHOW"] } }
      });
      if (patientDuplicate) throw new Error("Anda sudah memiliki reservasi aktif pada tanggal tersebut.");
      const count = await tx.appointment.count({
        where: { doctorId: p.doctorId, facilityId: p.facilityId, visitDate: date, status: { notIn: ["CANCELLED", "NO_SHOW"] } }
      });
      if (count >= schedule.quota) throw new Error("Kuota dokter pada tanggal tersebut sudah penuh.");
      const slotUsed = await tx.appointment.findFirst({
        where: { doctorId: p.doctorId, facilityId: p.facilityId, visitDate: date, startTime: p.startTime, status: { notIn: ["CANCELLED", "NO_SHOW"] } }
      });
      if (slotUsed) throw new Error("Slot jam tersebut sudah dipesan. Silakan pilih jam lain.");
      const bookingCode = `JZ-${p.visitDate.replaceAll("-", "")}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
      const created = await tx.appointment.create({
        data: {
          bookingCode, patientId: profile.id, doctorId: p.doctorId, facilityId: p.facilityId,
          scheduleId: schedule.id, visitDate: date, startTime: p.startTime, queueNumber: count + 1,
          complaint: { create: {
            patientId: profile.id, mainComplaint: p.mainComplaint, symptoms: p.symptoms,
            duration: p.duration, severity: p.severity, relevantHistory: p.relevantHistory,
            additionalNotes: p.additionalNotes
          }}
        },
        include: { doctor: true, facility: true }
      });
      await tx.notification.create({ data: { userId: session.userId, title: "Pendaftaran berhasil", body: `Nomor antrean ${count + 1}; kode booking ${bookingCode}.` } });
      await tx.auditLog.create({ data: { userId: session.userId, action: "CREATE_APPOINTMENT", entity: "Appointment", entityId: created.id } });
      return created;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    return NextResponse.json({ ok: true, appointment }, { status: 201 });
  } catch (e: any) {
    if (e?.code === "P2034" || e?.code === "P2002") return NextResponse.json({ error: "Slot sedang dipesan pengguna lain. Muat ulang jadwal dan pilih slot lain." }, { status: 409 });
    return NextResponse.json({ error: e.message || "Reservasi gagal." }, { status: 409 });
  }
}
