import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRoles } from "@/lib/authorization";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireRoles(["PATIENT","DOCTOR"]);
  if (auth.response) return auth.response;
  const { id } = await ctx.params;
  const s = auth.session!;
  const consultation = await prisma.consultation.findFirst({
    where: { id, OR: [
      ...(s.role === "PATIENT" ? [{ patient: { userId: s.userId } }] : []),
      ...(s.role === "DOCTOR" ? [{ doctor: { userId: s.userId } }] : [])
    ] }
  });
  if (!consultation) return NextResponse.json({ error: "Konsultasi tidak ditemukan atau bukan hak akses Anda." }, { status: 404 });
  const messages = await prisma.consultationMessage.findMany({ where: { consultationId: id }, orderBy: { createdAt: "asc" } });
  return NextResponse.json({ messages });
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireRoles(["PATIENT","DOCTOR"]);
  if (auth.response) return auth.response;
  const { id } = await ctx.params;
  const parsed = z.object({ message: z.string().trim().min(1).max(4000) }).safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Pesan wajib diisi (maksimal 4.000 karakter)." }, { status: 400 });
  const s = auth.session!;
  const consultation = await prisma.consultation.findFirst({
    where: { id, status: { in: ["WAITING","ACTIVE"] }, OR: [
      ...(s.role === "PATIENT" ? [{ patient: { userId: s.userId } }] : []),
      ...(s.role === "DOCTOR" ? [{ doctor: { userId: s.userId } }] : [])
    ] },
    include: { patient: true, doctor: true }
  });
  if (!consultation) return NextResponse.json({ error: "Ruang konsultasi tidak aktif atau Anda tidak berwenang." }, { status: 403 });
  const message = await prisma.consultationMessage.create({ data: { consultationId: id, senderUserId: s.userId, message: parsed.data.message } });
  const recipientId = s.role === "PATIENT" ? consultation.doctor.userId : consultation.patient.userId;
  if (recipientId) await prisma.notification.create({ data: { userId: recipientId, title: "Pesan konsultasi baru", body: "Anda menerima pesan baru di ruang konsultasi." } });
  return NextResponse.json({ ok: true, message }, { status: 201 });
}
