import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRoles } from "@/lib/authorization";
export async function POST() {
  const auth = await requireRoles(["DOCTOR","FACILITY_ADMIN","SUPER_ADMIN"]);
  if (auth.response) return auth.response;
  const session = auth.session!;
  const doctor = session.role === "DOCTOR"
    ? await prisma.doctor.findUnique({ where: { userId: session.userId } })
    : null;
  const next = await prisma.appointment.findFirst({
    where: { ...(doctor ? { doctorId: doctor.id } : {}), status: { in: ["REGISTERED","WAITING"] } },
    orderBy: [{ visitDate: "asc" }, { queueNumber: "asc" }]
  });
  if (!next) return NextResponse.json({ error: "Tidak ada pasien dalam antrean." }, { status: 404 });
  const updated = await prisma.appointment.update({ where: { id: next.id }, data: { status: "IN_SERVICE" } });
  return NextResponse.json({ ok: true, appointment: updated });
}
