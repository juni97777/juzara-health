"use client";
import { useRef, useState } from "react";

export default function DoctorProfileEditor({ initial }: { initial: { name: string; specialty: string; phone: string; photoUrl: string | null } }) {
  const [name,setName]=useState(initial.name); const [specialty,setSpecialty]=useState(initial.specialty);
  const [phone,setPhone]=useState(initial.phone); const [photo,setPhoto]=useState<string|null>(initial.photoUrl);
  const [message,setMessage]=useState(""); const [busy,setBusy]=useState(false); const fileRef=useRef<HTMLInputElement>(null);
  async function choose(file?: File) {
    if(!file)return;
    if(!["image/jpeg","image/png","image/webp"].includes(file.type)||file.size>1024*1024){setMessage("Pilih foto JPG, PNG, atau WEBP maksimal 1 MB.");return;}
    const reader=new FileReader(); reader.onload=()=>setPhoto(String(reader.result)); reader.readAsDataURL(file);
  }
  async function save(e:React.FormEvent){e.preventDefault();setBusy(true);setMessage("");try{const r=await fetch("/api/doctor/profile",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,specialty,phone,photoUrl:photo})});const d=await r.json();if(!r.ok)throw new Error(d.error||"Gagal menyimpan profil.");setMessage("Profil berhasil diperbarui.");}catch(e:any){setMessage(e.message);}finally{setBusy(false);}}
  return <form className="doctor-profile-card" onSubmit={save}>
    <div className="profile-editor-head"><div><span className="section-kicker">PROFIL PROFESIONAL</span><h2>Kelola profil dokter</h2><p>Perbarui informasi yang akan ditampilkan kepada pasien.</p></div><div className="profile-avatar">{photo?<img src={photo} alt="Foto profil dokter"/>:<span>＋</span>}</div></div>
    <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={e=>choose(e.target.files?.[0])}/>
    <button type="button" className="btn secondary" onClick={()=>fileRef.current?.click()}>Ganti foto profil</button>
    <div className="profile-fields"><label>Nama dokter<input required minLength={3} value={name} onChange={e=>setName(e.target.value)}/></label><label>Spesialisasi<input required minLength={3} value={specialty} onChange={e=>setSpecialty(e.target.value)}/></label><label>Nomor telepon<input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="08xxxxxxxxxx"/></label></div>
    <div className="profile-save-row"><span className="profile-message" role="status">{message}</span><button className="btn" disabled={busy}>{busy?"Menyimpan...":"Simpan perubahan"}</button></div>
  </form>;
}
