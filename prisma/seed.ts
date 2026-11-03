import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

async function ensureStaff(email: string, password: string, fullName: string, role: Role) {
  const passwordHash = await bcrypt.hash(password, 12);
  return prisma.user.upsert({
    where: { email },
    update: { fullName, role, passwordHash, isActive: true },
    create: { email, fullName, role, passwordHash, isActive: true }
  });
}

async function main() {
  const isProduction = process.env.NODE_ENV === "production";
  if (isProduction && process.env.ALLOW_DEMO_SEED !== "true") {
    throw new Error("Seed akun/fasilitas demo dinonaktifkan di production. Aktifkan ALLOW_DEMO_SEED=true hanya untuk demo terkontrol.");
  }
  const doctorPassword = process.env.DEMO_DOCTOR_PASSWORD || (isProduction ? "" : "DokterJuzara#2026");
  const adminEmail = process.env.DEMO_ADMIN_EMAIL || (isProduction ? "" : "admin.faskes@juzara.demo");
  const adminPassword = process.env.DEMO_ADMIN_PASSWORD || (isProduction ? "" : "AdminJuzara#2026");
  const superAdminEmail = process.env.DEMO_SUPERADMIN_EMAIL || (isProduction ? "" : "superadmin@juzara.demo");
  const superAdminPassword = process.env.DEMO_SUPERADMIN_PASSWORD || (isProduction ? "" : "SuperAdminJuzara#2026");
  if (isProduction && [doctorPassword, adminEmail, adminPassword, superAdminEmail, superAdminPassword].some((v) => !v || v.length < 16)) {
    throw new Error("Untuk seed production, isi email demo dan password unik minimal 16 karakter melalui environment variables.");
  }

  const facility = await prisma.healthcareFacility.upsert({
    where: { id: "demo-faskes-makassar" }, update: {},
    create: { id: "demo-faskes-makassar", name: "Faskes Demo JUZARA Makassar", type: "CLINIC",
      address: "Lokasi demonstrasi – Makassar, Sulawesi Selatan", region: "Makassar",
      phone: "0411-000000", openingHours: "Senin–Jumat, 08.00–21.00 WITA",
      latitude: -5.1477, longitude: 119.4327, isDemo: true }
  });

  const doctors = [
    ["Zaskiya Dwi Anugrah","Dokter umum","zaskiya.doctor@juzara.demo",doctorPassword],
    ["Bayu Liburaya","Dokter gigi","bayu.doctor@juzara.demo",doctorPassword],
    ["Juniar Rahman","Spesialis penyakit dalam","juniar.doctor@juzara.demo",doctorPassword],
    ["Muhammad Zidan","Spesialis anak","zidan.doctor@juzara.demo",doctorPassword],
    ["Zahra Nur Habibah","Spesialis kandungan","zahra.doctor@juzara.demo",doctorPassword]
  ] as const;

  for (const [name, specialty, email, password] of doctors) {
    const user = await ensureStaff(email, password, name, "DOCTOR");
    let doctor = await prisma.doctor.findFirst({ where: { name } });
    if (!doctor) doctor = await prisma.doctor.create({ data: { name, specialty, isDemo: true } });
    if (doctor.userId !== user.id) doctor = await prisma.doctor.update({ where: { id: doctor.id }, data: { userId: user.id } });
    await prisma.doctorFacility.upsert({
      where: { doctorId_facilityId: { doctorId: doctor.id, facilityId: facility.id } },
      update: {}, create: { doctorId: doctor.id, facilityId: facility.id }
    });
  }

  await ensureStaff(adminEmail, adminPassword, "Administrator Faskes Demo", "FACILITY_ADMIN");
  await ensureStaff(superAdminEmail, superAdminPassword, "Administrator Utama Demo", "SUPER_ADMIN");

  const schedules = [
    ["Zaskiya Dwi Anugrah",1,"08:00","12:00","Asia/Makassar"],
    ["Muhammad Zidan",1,"13:00","17:00","Asia/Makassar"],
    ["Bayu Liburaya",2,"13:00","17:00","Asia/Makassar"],
    ["Zaskiya Dwi Anugrah",3,"08:00","12:00","Asia/Makassar"],
    ["Juniar Rahman",3,"13:00","17:00","Asia/Makassar"],
    ["Muhammad Zidan",4,"10:30","16:00","Asia/Makassar"],
    ["Zahra Nur Habibah",4,"17:00","21:00","Asia/Makassar"],
    ["Juniar Rahman",5,"08:00","11:00","Asia/Jakarta"]
  ] as const;

  for (const [name,weekday,startTime,endTime,timezone] of schedules) {
    const doctor = await prisma.doctor.findFirstOrThrow({ where: { name } });
    const exists = await prisma.doctorSchedule.findFirst({ where: { doctorId: doctor.id, facilityId: facility.id, weekday, startTime } });
    if (!exists) await prisma.doctorSchedule.create({
      data: { doctorId: doctor.id, facilityId: facility.id, weekday, startTime, endTime, timezone, quota: 20, durationMins: 15 }
    });
  }

  const articles = [
    ["Menjaga Pola Tidur Sehat","Gaya Hidup","Tidur cukup membantu tubuh memulihkan energi dan menjaga konsentrasi.","Usahakan jadwal tidur teratur, kurangi kafein menjelang malam, dan ciptakan kamar yang nyaman."],
    ["Kapan Perlu Memeriksa Tekanan Darah?","Pencegahan","Pemeriksaan tekanan darah membantu mengenali risiko lebih awal.","Lakukan pemeriksaan berkala sesuai anjuran tenaga kesehatan. Hasil pemeriksaan perlu dibaca bersama kondisi kesehatan."],
    ["Pentingnya Aktivitas Fisik","Kebugaran","Aktivitas fisik teratur mendukung kesehatan tubuh.","Mulai dengan aktivitas ringan yang sesuai kemampuan dan tingkatkan secara bertahap."]
  ] as const;
  for (const [title,category,summary,content] of articles) {
    const exists = await prisma.healthArticle.findFirst({ where: { title } });
    if (!exists) await prisma.healthArticle.create({ data: { title, category, summary, content, isPublished: true } });
  }

  console.log("Seed selesai: faskes, dokter, jadwal, artikel, dan akun staf demo.");
}
main().finally(() => prisma.$disconnect());
