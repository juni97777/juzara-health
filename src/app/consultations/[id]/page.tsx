"use client";
import { useCallback,useEffect,useState } from "react";
import { useParams } from "next/navigation";
export default function ChatRoom(){
 const params=useParams<{id:string}>();const id=params.id;
 const [messages,setMessages]=useState<any[]>([]);const [myId,setMyId]=useState("");const [body,setBody]=useState("");const [error,setError]=useState("");const [sending,setSending]=useState(false);
 const load=useCallback(async()=>{const r=await fetch(`/api/consultations/${id}/messages`,{cache:"no-store"});const d=await r.json();if(!r.ok){setError(d.error);return}setMessages(d.messages||[]);},[id]);
 useEffect(()=>{load();fetch("/api/me").then(r=>r.json()).then(d=>setMyId(d.user?.id||""));const timer=setInterval(load,3000);return()=>clearInterval(timer)},[load]);
 async function send(e:React.FormEvent){e.preventDefault();if(!body.trim())return;setSending(true);setError("");try{const r=await fetch(`/api/consultations/${id}/messages`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:body})});const d=await r.json();if(!r.ok)throw new Error(d.error);setBody("");await load()}catch(e:any){setError(e.message)}finally{setSending(false)}}
 return <main className="dashboard"><a href="/consultations">← Kembali ke konsultasi</a><h1>Ruang chat konsultasi</h1><p>Pesan diperbarui otomatis setiap beberapa detik selama halaman terbuka.</p>{error&&<p className="error">{error}</p>}
 <section className="chat-panel">{messages.map(m=><div className={`chat-bubble ${m.senderUserId===myId?"mine":""}`} key={m.id}><p>{m.message}</p><small>{new Date(m.createdAt).toLocaleString("id-ID")}</small></div>)}{messages.length===0&&<p>Belum ada pesan. Mulai percakapan dengan dokter/pasien.</p>}</section>
 <form className="chat-compose" onSubmit={send}><textarea value={body} onChange={e=>setBody(e.target.value)} maxLength={4000} rows={2} placeholder="Tulis pesan konsultasi..." required/><button className="btn" disabled={sending}>{sending?"Mengirim...":"Kirim pesan"}</button></form>
 </main>
}
