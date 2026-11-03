"use client";
import { useEffect,useState } from "react";
export default function LabsPage(){
 const [rows,setRows]=useState<any[]>([]);const [error,setError]=useState("");const [role,setRole]=useState("");
 async function load(){const [r,m]=await Promise.all([fetch("/api/labs"),fetch("/api/me")]);const d=await r.json();const md=await m.json();if(!r.ok)setError(d.error);else setRows(d.results||[]);setRole(md.user?.role||"")}
 async function validate(id:string,status:"VALIDATED"|"REJECTED"){const note=window.prompt("Catatan validasi (opsional):")||"";const r=await fetch(`/api/labs/${id}/validate`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({status,note})});const d=await r.json();if(!r.ok){setError(d.error);return}load()}
 useEffect(()=>{load()},[]);
 return <main className="dashboard"><a href="/dashboard">← Dashboard</a><h1>Hasil laboratorium</h1><p>Hasil pasien hanya dapat diunduh setelah divalidasi oleh petugas berwenang.</p>{error&&<p className="error">{error}</p>}{rows.map(x=><article className="data-card" key={x.id}><h3>{x.testName}</h3><p>{x.patient.user.fullName} · {new Date(x.testDate).toLocaleDateString("id-ID")}</p><p>Hasil: {x.result} {x.unit||""} · Referensi: {x.referenceRange||"-"}</p><p>Status: {x.validationStatus}</p>{x.validationStatus==="VALIDATED"?<a className="btn" href={`/api/labs/${x.id}/pdf`}>Unduh PDF</a>:<span className="demo-tag">BELUM TERVILIDASI</span>}{["FACILITY_ADMIN","SUPER_ADMIN"].includes(role)&&<div className="action-row"><button className="btn small green" onClick={()=>validate(x.id,"VALIDATED")}>Validasi</button><button className="btn small danger" onClick={()=>validate(x.id,"REJECTED")}>Tolak</button></div>}</article>)}</main>
}
