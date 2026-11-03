"use client";
import { useState } from "react";
export default function StartConsultButton({appointmentId}:{appointmentId:string}){
 const [busy,setBusy]=useState(false);const [error,setError]=useState("");
 async function start(){
  setBusy(true);setError("");
  try{
   const r=await fetch("/api/consultations",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({appointmentId})});
   const d=await r.json();if(!r.ok)throw new Error(d.error||"Tidak dapat membuka konsultasi.");
   window.location.href=`/consultations/${d.consultation.id}`;
  }catch(e:any){setError(e.message)}finally{setBusy(false)}
 }
 return <span><button className="btn small" onClick={start} disabled={busy}>{busy?"Membuka...":"Mulai konsultasi"}</button>{error&&<small className="error">{error}</small>}</span>
}
