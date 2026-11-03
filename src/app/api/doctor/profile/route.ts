import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRoles } from "@/lib/authorization";

export async function PATCH(req: Request) {
  const auth = await requireRoles(["DOCTOR"]);
  if (auth.response) return auth.response;
  try {
    const body = await req.json();
    const name = String(body.name || "").trim();
    const specialty = String(body.specialty || "").trim();
    const phone = String(body.phone || "").trim();
    const photoUrl = body.photoUrl == null ? null : String(body.photoUrl);
    if (name.length < 3 || name.length > 100 || specialty.length < 3 || specialty.length > 100)
      return NextResponse.json({ error: "Nama dan spesialisasi minimal 3 karakter." }, { status: 400 });
    if (phone.length > 25) return NextResponse.json({ error: "Nomor telepon terlalu panjang." }, { status: 400 });
    if (photoUrl && (!/^data:image\/(jpeg|png|webp);base64,/.test(photoUrl) || photoUrl.length > 1_500_000))
      return NextResponse.json({ error: "Foto harus JPG, PNG, atau WEBP dan maksimal 1 MB." }, { status: 400 });
    const doctor = await prisma.doctor.findUnique({ where: { userId: auth.session!.userId } });
    if (!doctor) return NextResponse.json({ error: "Profil dokter tidak ditemukan." }, { status: 404 });
    await prisma.$transaction([
      prisma.doctor.update({ where: { id: doctor.id }, data: { name, specialty, photoUrl } }),
      prisma.user.update({ where: { id: auth.session!.userId }, data: { fullName: name, phone: phone || null } })
    ]);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Profil belum dapat disimpan." }, { status: 400 });
  }
}
