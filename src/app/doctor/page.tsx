import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import StartConsultButton from "@/components/StartConsultButton";
import DoctorProfileEditor from "@/components/DoctorProfileEditor";
export default async function DoctorDashboard() {
 const s=await getSession(); if(!s) redirect("/login"); if(s.role!=="DOCTOR") redirect("/dashboard");
 const doctor=await prisma.doctor.findUnique({where:{userId:s.userId},include:{schedules:{include:{facility:true}},user:true}});
 if(!doctor) return <main className="dashboard"><h1>Profil dokter belum terhubung.</h1></main>;
 const queue=await prisma.appointment.findMany({where:{doctorId:doctor.id,status:{in:["REGISTERED","WAITING","IN_SERVICE"]}},include:{patient:{include:{user:true}},complaint:true,facility:true},orderBy:[{visitDate:"asc"},{queueNumber:"asc"}]});
 return <main className="dashboard doctor-dashboard"><header className="dash-head"><Link href="/" className="brand"><span className="brandmark">✚</span>JUZARA <b>Health</b></Link><form action="/api/auth/logout" method="post"><button className="btn secondary">Keluar</button></form></header>
 <section className="doctor-welcome"><div><span className="section-kicker">PORTAL TENAGA MEDIS</span><h1>Selamat bertugas, {doctor.name.split(" ")[0]}.</h1><p>Kelola profil, pantau antrean, dan layani pasien dari satu tempat.</p></div><div className="doctor-welcome-icon">✚</div></section>
 <div className="doctor-summary"><article><span>👥</span><b>{queue.length}</b><small>Pasien dalam antrean</small></article><article><span>🗓️</span><b>{doctor.schedules.length}</b><small>Jadwal praktik terdaftar</small></article><article><span>🩺</span><b>{doctor.specialty}</b><small>Bidang layanan</small></article></div>
 <DoctorProfileEditor initial={{name:doctor.name,specialty:doctor.specialty,phone:doctor.user?.phone||"",photoUrl:doctor.photoUrl}}/>
 <section className="doctor-queue-section"><div className="section-heading"><div><span className="section-kicker">LAYANAN HARI INI</span><h2>Antrean pasien</h2></div><Link className="btn secondary" href="/schedules">Lihat jadwal</Link></div>
 {queue.length===0?<div className="empty-state"><span>☀️</span><h3>Belum ada pasien dalam antrean</h3><p>Daftar pasien akan muncul di sini setelah melakukan pemesanan.</p></div>:<div className="table-wrap"><table><thead><tr><th>No.</th><th>Pasien</th><th>Tanggal</th><th>Keluhan</th><th>Status / Aksi</th></tr></thead><tbody>{queue.map(a=><tr key={a.id}><td><strong className="queue-number">{a.queueNumber}</strong></td><td>{a.patient.user.fullName}</td><td>{a.visitDate.toLocaleDateString("id-ID")}</td><td>{a.complaint?.mainComplaint||"-"}</td><td><span className="status-chip">{a.status}</span><br/><StartConsultButton appointmentId={a.id}/></td></tr>)}</tbody></table></div>}</section>
 <section className="doctor-shortcuts"><Link className="doctor-shortcut" href="/consultations"><span>💬</span><div><b>Ruang konsultasi</b><small>Catatan dan percakapan pasien</small></div>→</Link><Link className="doctor-shortcut" href="/schedules"><span>📅</span><div><b>Jadwal praktik</b><small>Jadwal dokter dari database</small></div>→</Link></section>
 </main>;
}
