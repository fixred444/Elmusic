'use client';

import { fetchHome as loadHome, readHomeCache } from '@/lib/homeCache';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { hueOf } from '@/lib/util';
import { IconCheck, IconEye, IconEyeOff } from './Icons';

export default function Welcome() {
  const { configured, signIn, signUp, continueAsGuest } = useAuth();
  const [mode, setMode] = useState('start'); // start | in | up | confirm
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [arts, setArts] = useState([]);

  // sampul lagu untuk hiasan di layar awal
  useEffect(() => {
    let dead = false;
    const c = readHomeCache();
    if (c) setArts((c.shelves?.[0]?.tracks || []).slice(0, 6).map((t) => t.artSm || t.art || null));
    loadHome()
      .then((d) => {
        if (!dead) setArts((d.shelves?.[0]?.tracks || []).slice(0, 6).map((t) => t.artSm || t.art || null));
      })
      .catch(() => {});
    return () => {
      dead = true;
    };
  }, []);

  const go = (m) => {
    setMode(m);
    setErr('');
    setShow(false);
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    if (mode === 'up' && name.trim().length < 2) return setErr('Isi namamu dulu.');
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setErr('Format email belum benar.');
    if (password.length < 6) return setErr('Kata sandi minimal 6 karakter.');
    setBusy(true);
    try {
      if (mode === 'in') await signIn({ email, password });
      else {
        const r = await signUp({ name, email, password });
        if (r.needsConfirm) go('confirm');
      }
    } catch (e2) {
      setErr(e2.message || 'Terjadi kesalahan. Coba lagi.');
    } finally {
      setBusy(false);
    }
  };

  const isUp = mode === 'up';

  return (
    <main className="auth">
      <section className="auth-visual" aria-hidden="true">
        <div className="auth-covers">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="auth-cover"
              style={{ '--d': `${i * 80}ms`, background: arts[i] ? undefined : `hsl(${hueOf('cover' + i)} 22% 20%)` }}
            >
              {arts[i] && <img src={arts[i]} alt="" />}
            </div>
          ))}
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-inner">
          <div className="auth-brand">
            <span className="logo-el">El</span>
            <span className="logo-sub">Music</span>
          </div>

          {mode === 'start' && (
            <>
              <h1 className="auth-title">Musik favoritmu, dalam satu tempat.</h1>
              <p className="auth-sub">Masuk untuk menyimpan lagu yang kamu suka dan playlist di akunmu.</p>
              <div className="auth-actions">
                <button className="btn btn-primary auth-btn" onClick={() => go('up')}>Daftar gratis</button>
                <button className="btn btn-ghost auth-btn" onClick={() => go('in')}>Masuk</button>
              </div>
              <button className="auth-link" onClick={continueAsGuest}>Lanjut sebagai tamu</button>
            </>
          )}

          {(mode === 'in' || mode === 'up') && (
            <form onSubmit={submit} noValidate>
              <button type="button" className="auth-back" onClick={() => go('start')}>‹ Kembali</button>
              <h1 className="auth-title">{isUp ? 'Buat akunmu' : 'Masuk ke El Music'}</h1>

              {!configured && (
                <div className="auth-note">
                  Layanan akun belum dipasang. Pemilik situs perlu mengisi NEXT_PUBLIC_SUPABASE_URL dan
                  NEXT_PUBLIC_SUPABASE_ANON_KEY di Vercel. Sementara itu kamu bisa lanjut sebagai tamu.
                </div>
              )}

              {isUp && (
                <label className="field">
                  <span>Nama</span>
                  <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Namamu" maxLength={40} />
                </label>
              )}
              <label className="field">
                <span>Email</span>
                <input type="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="kamu@email.com" />
              </label>
              <label className="field">
                <span>Kata sandi</span>
                <div className="field-pw">
                  <input
                    type={show ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={isUp ? 'new-password' : 'current-password'}
                    placeholder="Minimal 6 karakter"
                  />
                  <button type="button" className="ic sm" onClick={() => setShow((s) => !s)} aria-label={show ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}>
                    {show ? <IconEyeOff size={20} /> : <IconEye size={20} />}
                  </button>
                </div>
              </label>

              {err && <div className="auth-err" role="alert">{err}</div>}

              <button className="btn btn-primary auth-btn" type="submit" disabled={busy || !configured}>
                {busy ? 'Tunggu sebentar…' : isUp ? 'Daftar' : 'Masuk'}
              </button>

              <p className="auth-switch">
                {isUp ? 'Sudah punya akun?' : 'Belum punya akun?'}{' '}
                <button type="button" className="auth-link inline" onClick={() => go(isUp ? 'in' : 'up')}>
                  {isUp ? 'Masuk' : 'Daftar'}
                </button>
              </p>
              <button type="button" className="auth-link" onClick={continueAsGuest}>Lanjut sebagai tamu</button>
            </form>
          )}

          {mode === 'confirm' && (
            <>
              <div className="auth-ok"><IconCheck size={26} /></div>
              <h1 className="auth-title">Cek emailmu</h1>
              <p className="auth-sub">
                Kami mengirim tautan konfirmasi ke <b>{email.trim()}</b>. Buka emailnya, lalu kembali ke sini untuk masuk.
              </p>
              <div className="auth-actions">
                <button className="btn btn-primary auth-btn" onClick={() => go('in')}>Ke halaman masuk</button>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
