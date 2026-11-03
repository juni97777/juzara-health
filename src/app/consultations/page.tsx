"use client";
import { useEffect,useState } from "react";
export default function ConsultationsPage(){
 const [rows,setRows]=useState<any[]>([]);const [msg,setMsg]=useState("");
 async function load(){const r=await fetch("/api/consultations");const d=await r.json();if(r.ok)setRows(d.consultations||[]);else setMsg(d.error)}
 useEffect(()=>{load()},[]);
 return <main className="dashboard"><a href="/dashboard">← Dashboard</a><h1>Ruang konsultasi</h1>{msg&&<p className="error">{msg}</p>}
 {rows.map(c=><article className="data-card" key={c.id}><h3>{c.patient.user.fullName} · {c.status}</h3><p>Dokter: {c.doctor.name} · Booking: {c.appointment.bookingCode}</p><p>Catatan: {c.record?.notes||"Belum ada catatan"}</p><a className="btn" href={`/consultations/${c.id}`}>Buka ruang chat</a></article>)}
 {rows.length===0&&<p>Belum ada konsultasi aktif. Konsultasi dibuat oleh dokter dari antrean pasien.</p>}</main>
}
