"use client";
import { useEffect,useState } from "react";
export default function NotificationsPage(){
 const [items,setItems]=useState<any[]>([]);
 async function load(){const r=await fetch("/api/notifications",{cache:"no-store"});const d=await r.json();if(r.ok)setItems(d.notifications||[])}
 useEffect(()=>{load();const timer=setInterval(load,5000);return()=>clearInterval(timer)},[]);
 return <main className="dashboard"><a href="/dashboard">← Dashboard</a><h1>Notifikasi</h1><p>Daftar diperbarui otomatis setiap lima detik saat halaman terbuka.</p>{items.map(n=><article className="data-card" key={n.id}><h3>{n.title}</h3><p>{n.body}</p><small>{new Date(n.createdAt).toLocaleString("id-ID")}</small></article>)}{items.length===0&&<p>Belum ada notifikasi.</p>}</main>
}
