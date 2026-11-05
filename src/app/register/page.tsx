"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
type FormData={fullName:string;identityNumber:string;birthDate:string;gender:string;address:string;phone:string;email:string;password:string;confirmPassword:string};
export default function RegisterPage(){
 const [form,setForm]=useState<FormData>({fullName:"",identityNumber:"",birthDate:"",gender:"",address:"",phone:"",email:"",password:"",confirmPassword:""});
 const [visible,setVisible]=useState(false);const [error,setError]=useState("");const [busy,setBusy]=useState(false);const router=useRouter();
 function change(key:keyof FormData,value:string){setForm(p=>({...p,[key]:value}));}
 async function submit(e:React.FormEvent){e.preventDefault();setError("");if(!form.birthDate||Number(form.birthDate.slice(0,4))<1980||Number(form.birthDate.slice(0,4))>2026){setError("Tahun lahir harus berada pada rentang 1980–2026.");return;}if(form.password!==form.confirmPassword){setError("Konfirmasi password belum sama.");return;}setBusy(true);try{const r=await fetch("/api/auth/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});const responseText=await r.text();let d:any={};try{d=responseText?JSON.parse(responseText):{};}catch{throw new Error(`Server mengirim respons bukan JSON (HTTP ${r.status}). Periksa Vercel Functions Logs pada /api/auth/register.`);}if(!r.ok)throw new Error(d.error||`Registrasi gagal (HTTP ${r.status}).`);router.replace("/dashboard");router.refresh();}catch(e:any){setError(e.message);}finally{setBusy(false);}}
 return <main className="auth-wrap auth-register-bg"><form className="auth-card register-card register-simple" onSubmit={submit}>
 <Link href="/" className="brand"><span className="brandmark">✚</span>JUZARA <b>Health</b></Link><p className="eyebrow">DAFTAR PASIEN BARU</p><h1>Mulai hidup lebih sehat.</h1><p>Isi data utama berikut untuk membuat akun. Prosesnya singkat.</p>
 {error&&<div className="error" role="alert">{error}</div>}
 <div className="form-grid">
 <div className="field wide"><label htmlFor="fullName">Nama lengkap</label><input id="fullName" required minLength={3} autoComplete="name" value={form.fullName} onChange={e=>change("fullName",e.target.value)} placeholder="Masukkan nama lengkap"/></div>
 <div className="field"><label htmlFor="identityNumber">Nomor identitas</label><input id="identityNumber" required minLength={8} value={form.identityNumber} onChange={e=>change("identityNumber",e.target.value)} placeholder="Nomor KTP / identitas"/></div>
 <div className="field"><label htmlFor="birthDate">Tanggal lahir</label><input id="birthDate" type="date" required min="1980-01-01" max="2026-12-31" value={form.birthDate} onChange={e=>change("birthDate",e.target.value)}/></div>
 <div className="field"><label htmlFor="gender">Jenis kelamin</label><select id="gender" required value={form.gender} onChange={e=>change("gender",e.target.value)}><option value="">Pilih jenis kelamin</option><option value="MALE">Laki-laki</option><option value="FEMALE">Perempuan</option><option value="OTHER">Lainnya</option></select></div>
 <div className="field wide"><label htmlFor="address">Alamat tempat tinggal</label><textarea id="address" required minLength={5} autoComplete="street-address" value={form.address} onChange={e=>change("address",e.target.value)} placeholder="Nama jalan, kelurahan/desa, kecamatan, kota/kabupaten" rows={2}/></div>
 <div className="field"><label htmlFor="phone">Nomor telepon</label><input id="phone" type="tel" required minLength={8} autoComplete="tel" value={form.phone} onChange={e=>change("phone",e.target.value)} placeholder="08xxxxxxxxxx"/></div>
 <div className="field wide"><label htmlFor="email">Email aktif</label><input id="email" type="email" required autoComplete="email" value={form.email} onChange={e=>change("email",e.target.value)} placeholder="nama@email.com"/></div>
 <div className="field wide"><label htmlFor="password">Buat password</label><div className="password-wrap"><input id="password" type={visible?"text":"password"} required minLength={8} autoComplete="new-password" value={form.password} onChange={e=>change("password",e.target.value)} placeholder="Minimal 8 karakter"/><button type="button" className="show-password" onClick={()=>setVisible(v=>!v)}>{visible?"Sembunyikan":"Lihat"}</button></div><small className="hint">Gunakan minimal 8 karakter.</small></div>
 <div className="field wide"><label htmlFor="confirmPassword">Konfirmasi password</label><input id="confirmPassword" type={visible?"text":"password"} required minLength={8} autoComplete="new-password" value={form.confirmPassword} onChange={e=>change("confirmPassword",e.target.value)} placeholder="Masukkan kembali password"/></div>
 </div>
 <button className="btn register-submit" style={{width:"100%"}} disabled={busy}>{busy?"Membuat akun...":"Buat akun pasien"}</button><div className="auth-foot">Sudah punya akun? <Link href="/login">Masuk di sini</Link></div>
 </form></main>;
}
