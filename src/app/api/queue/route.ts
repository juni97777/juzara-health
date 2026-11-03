import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRoles } from "@/lib/authorization";

export async function GET() {
  const auth = await requireRoles(["PATIENT","DOCTOR","FACILITY_ADMIN","SUPER_ADMIN"]);
  if (auth.response) return auth.response;
  const session = auth.session!;
  const where = session.role === "PATIENT"
    ? { patient: { userId: session.userId } }
    : session.role === "DOCTOR"
      ? { doctor: { userId: session.userId } }
      : {};
  const appointments = await prisma.appointment.findMany({
    where, include: { patient: { include: { user: true } }, doctor: true, facility: true, complaint: true },
    orderBy: [{ visitDate: "asc" }, { queueNumber: "asc" }], take: 100
  });
  const queues = appointments.map(a => {
    const ahead = appointments.filter(x => x.visitDate.toDateString() === a.visitDate.toDateString() &&
      x.doctorId === a.doctorId && x.queueNumber < a.queueNumber &&
      ["REGISTERED","WAITING","IN_SERVICE"].includes(x.status)).length;
    return { ...a, patientsAhead: ahead, estimatedWaitMinutes: ahead * 15 };
  });
  return NextResponse.json({ queues });
}
