"use client";
import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const search = useSearchParams();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Tidak dapat masuk.");
      router.replace(search.get("next") || "/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return <main className="auth-wrap">
    <form className="auth-card" onSubmit={submit}>
      <Link href="/" className="brand"><span className="brandmark">✚</span>JUZARA <b>Health</b></Link>
      <p className="eyebrow">AKSES AMAN PENGGUNA</p>
      <h1>Senang bertemu kembali.</h1>
      <p>Masuk menggunakan email dan password yang didaftarkan.</p>
      {error && <div className="error" role="alert">{error}</div>}
      <div className="field"><label htmlFor="email">Email</label>
        <input id="email" type="email" autoComplete="email" required value={email}
          onChange={e => setEmail(e.target.value)} placeholder="nama@email.com" />
      </div>
      <div className="field"><label htmlFor="password">Password</label>
        <div className="password-wrap">
          <input id="password" type={visible ? "text" : "password"} autoComplete="current-password"
            required value={password} onChange={e => setPassword(e.target.value)} placeholder="Masukkan password" />
          <button type="button" className="show-password" onClick={() => setVisible(v => !v)}
            aria-label={visible ? "Sembunyikan password" : "Lihat password"}>{visible ? "Sembunyikan" : "Lihat"}</button>
        </div>
      </div>
      <button className="btn" style={{ width: "100%" }} disabled={busy}>{busy ? "Memeriksa akun..." : "Masuk ke JUZARA"}</button>
      <div className="auth-foot">Belum punya akun? <Link href="/register">Daftar sebagai pasien</Link></div>
      <div className="auth-foot"><Link href="/">Kembali ke halaman utama</Link></div>
    </form>
  </main>;
}


export default function LoginPage() {
  return (
    <Suspense fallback={<main className="auth-wrap"><div className="auth-card">Memuat halaman masuk...</div></main>}>
      <LoginForm />
    </Suspense>
  );
}
