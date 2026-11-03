import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
export default async function AdminDashboard(){
 const s=await getSession(); if(!s) redirect("/login"); if(!["FACILITY_ADMIN","SUPER_ADMIN"].includes(s.role)) redirect("/dashboard");
 const [patients,doctors,facilities,appointments]=await Promise.all([
  prisma.patientProfile.count(),prisma.doctor.count(),prisma.healthcareFacility.count(),prisma.appointment.count()
 ]);
 return <main className="dashboard"><header className="dash-head"><Link href="/" className="brand">✚ JUZARA <b>Health</b></Link><form action="/api/auth/logout" method="post"><button className="btn secondary">Keluar</button></form></header><section className="dash-panel"><div><p>Panel administrator</p><h1>Pengelolaan JUZARA</h1><p>Ringkasan data operasional demonstrasi.</p></div><div className="dash-doctor">🏥</div></section><section className="stats-grid"><article><b>{patients}</b><small>Pasien</small></article><article><b>{doctors}</b><small>Dokter</small></article><article><b>{facilities}</b><small>Fasilitas</small></article><article><b>{appointments}</b><small>Reservasi</small></article></section><section className="dash-links"><Link className="dash-link" href="/admin/management">Kelola dokter & jadwal<small>Buat akun dokter dan atur jadwal</small></Link><Link className="dash-link" href="/facilities">Kelola fasilitas<small>Tambah fasilitas demo</small></Link><Link className="dash-link" href="/schedules">Kelola jadwal<small>Jadwal dokter dan kuota</small></Link><Link className="dash-link" href="/queues">Kelola antrean<small>Daftar antrean pasien</small></Link><Link className="dash-link" href="/labs">Hasil laboratorium<small>Data hasil dan status validasi</small></Link></section></main>;
}
