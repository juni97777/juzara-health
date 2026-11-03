"use client";
import { useEffect,useState } from "react";
export default function EducationPage(){
 const [items,setItems]=useState<any[]>([]);
 useEffect(()=>{fetch("/api/articles").then(r=>r.json()).then(d=>setItems(d.articles||[]))},[]);
 return <main className="dashboard"><a href="/dashboard">← Dashboard</a><h1>Edukasi kesehatan</h1><div className="dash-links">{items.map(a=><article className="dash-link" key={a.id}><span className="demo-tag">{a.category}</span><h3>{a.title}</h3><p>{a.summary}</p><small>{a.content}</small></article>)}</div></main>
}
