"use client";
import { useEffect,useMemo,useState } from "react";
const weekdays=["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
export default function BookingPage(){
 const [facilities,setFacilities]=useState<any[]>([]),[doctors,setDoctors]=useState<any[]>([]),[schedules,setSchedules]=useState<any[]>([]);
 const [facilityId,setFacilityId]=useState(""),[doctorId,setDoctorId]=useState(""),[scheduleId,setScheduleId]=useState("");
 const [date,setDate]=useState(""),[time,setTime]=useState("");
 const [complaint,setComplaint]=useState({mainComplaint:"",symptoms:"",duration:"",severity:"",relevantHistory:"",additionalNotes:""});
 const [result,setResult]=useState<any>(null),[error,setError]=useState(""),[busy,setBusy]=useState(false);
 useEffect(()=>{fetch("/api/facilities").then(r=>r.json()).then(d=>setFacilities(d.facilities||[]))},[]);
 useEffect(()=>{if(!facilityId)return;fetch("/api/doctors?facilityId="+facilityId).then(r=>r.json()).then(d=>setDoctors(d.doctors||[]));setDoctorId("");setScheduleId("")},[facilityId]);
 useEffect(()=>{if(!doctorId)return;fetch("/api/schedules?doctorId="+doctorId+"&facilityId="+facilityId).then(r=>r.json()).then(d=>setSchedules(d.schedules||[]));setScheduleId("")},[doctorId,facilityId]);
 const schedule=schedules.find(s=>s.id===scheduleId);
 const validDate=useMemo(()=>date&&schedule&&new Date(date+"T12:00:00").getDay()===schedule.weekday,[date,schedule]);
 async function submit(e:React.FormEvent){e.preventDefault();setError("");setResult(null);if(!validDate){setError("Tanggal tidak sesuai hari praktik dokter.");return}setBusy(true);try{const r=await fetch("/api/appointments",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({doctorId,facilityId,scheduleId,visitDate:date,startTime:time,...complaint})});const d=await r.json();if(!r.ok)throw new Error(d.error);setResult(d.appointment)}catch(e:any){setError(e.message)}finally{setBusy(false)}}
 return <main className="dashboard"><a href="/dashboard">← Dashboard</a><h1>Daftar konsultasi</h1><p>Pilih faskes, dokter, jadwal, dan isi keluhan. Reservasi tersimpan ke database.</p>
 {error&&<p className="error">{error}</p>}{result&&<article className="data-card success"><h2>Pendaftaran berhasil</h2><p>Kode booking: <b>{result.bookingCode}</b></p><p>Nomor antrean: <b>{result.queueNumber}</b></p><p>{result.facility.name} · {result.doctor.name} · {new Date(result.visitDate).toLocaleDateString("id-ID")} · {result.startTime}</p></article>}
 <form className="auth-card booking-form" onSubmit={submit}>
 <div className="field"><label>Fasilitas kesehatan</label><select required value={facilityId} onChange={e=>setFacilityId(e.target.value)}><option value="">Pilih fasilitas</option>{facilities.map(f=><option key={f.id} value={f.id}>{f.name} {f.isDemo?"(DEMO)":""}</option>)}</select></div>
 <div className="field"><label>Dokter</label><select required value={doctorId} onChange={e=>setDoctorId(e.target.value)} disabled={!facilityId}><option value="">Pilih dokter</option>{doctors.map(d=><option key={d.id} value={d.id}>{d.name} — {d.specialty}</option>)}</select></div>
 <div className="field"><label>Jadwal praktik</label><select required value={scheduleId} onChange={e=>setScheduleId(e.target.value)} disabled={!doctorId}><option value="">Pilih jadwal</option>{schedules.map(s=><option key={s.id} value={s.id}>{weekdays[s.weekday]} · {s.startTime}–{s.endTime} · kuota {s.quota}</option>)}</select></div>
 <div className="field"><label>Tanggal konsultasi</label><input type="date" required value={date} onChange={e=>setDate(e.target.value)} disabled={!scheduleId}/>{date&&schedule&&!validDate&&<small className="error">Pilih tanggal pada hari {weekdays[schedule.weekday]}.</small>}</div>
 <div className="field"><label>Jam konsultasi</label><select required value={time} onChange={e=>setTime(e.target.value)} disabled={!scheduleId}><option value="">Pilih jam mulai</option>{schedule&&Array.from({length:Math.max(1,Math.floor((parseInt(schedule.endTime.slice(0,2))*60+parseInt(schedule.endTime.slice(3))-parseInt(schedule.startTime.slice(0,2))*60-parseInt(schedule.startTime.slice(3)))/schedule.durationMins))},(_,i)=>{const mins=parseInt(schedule.startTime.slice(0,2))*60+parseInt(schedule.startTime.slice(3))+i*schedule.durationMins;return `${String(Math.floor(mins/60)).padStart(2,"0")}:${String(mins%60).padStart(2,"0")}`}).map(t=><option key={t}>{t}</option>)}</select></div>
 <h3>Informasi keluhan</h3>
 {([["mainComplaint","Keluhan utama"],["symptoms","Gejala yang dirasakan"],["duration","Lama mengalami keluhan"],["severity","Tingkat keluhan (ringan/sedang/berat)"],["relevantHistory","Riwayat penyakit relevan"],["additionalNotes","Catatan tambahan"]] as const).map(([key,label])=><div className="field" key={key}><label>{label}</label><textarea required={["mainComplaint","symptoms","duration","severity"].includes(key)} rows={2} value={complaint[key]} onChange={e=>setComplaint(p=>({...p,[key]:e.target.value}))}/></div>)}
 <button className="btn" disabled={busy}>{busy?"Menyimpan reservasi...":"Konfirmasi pendaftaran"}</button>
 </form></main>
}
