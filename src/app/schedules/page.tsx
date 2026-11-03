"use client";
import { useEffect, useState } from "react";
const days=["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
export default function SchedulesPage(){
 const [rows,setRows]=useState<any[]>([]);
 useEffect(()=>{fetch("/api/schedules").then(r=>r.json()).then(d=>setRows(d.schedules||[]))},[]);
 return <main className="dashboard"><a href="/dashboard">← Dashboard</a><h1>Jadwal praktik dokter</h1><p>Jadwal diambil dari database. Jadwal yang ditandai DEMO bukan jadwal resmi faskes.</p>{rows.map(s=><article className="data-card" key={s.id}><h3>{s.doctor.name} · {s.doctor.specialty}</h3><p>{s.facility.name} <span className="demo-tag">DEMO</span></p><p>{days[s.weekday]} · {s.startTime}–{s.endTime} ({s.timezone})</p><p>Kuota: {s.quota} pasien · Durasi: {s.durationMins} menit</p></article>)}</main>
}
