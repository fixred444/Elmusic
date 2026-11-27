'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

// Akun memakai Supabase Auth lewat REST (tanpa paket tambahan).
// Butuh dua environment variable di Vercel:
//   NEXT_PUBLIC_SUPABASE_URL  dan  NEXT_PUBLIC_SUPABASE_ANON_KEY
const BASE = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
export const configured = Boolean(BASE && KEY);

const SESSION_KEY = 'elmusic:session';
const GUEST_KEY = 'elmusic:guest';

const AuthCtx = createContext({ user: null, guest: false, loading: true, configured, uid: 'guest' });
export const useAuth = () => useContext(AuthCtx);

class AuthError extends Error {
  constructor(message, network = false) {
    super(message);
    this.network = network;
  }
}

function explain(data, status) {
  const code = data?.error_code || data?.code || '';
  const msg = String(data?.msg || data?.message || data?.error_description || '');
  if (code === 'invalid_credentials' || /invalid login/i.test(msg)) return 'Email atau kata sandi salah.';
  if (code === 'email_not_confirmed' || /not confirmed/i.test(msg)) return 'Email belum dikonfirmasi. Cek kotak masukmu.';
  if (code === 'user_already_exists' || /already registered/i.test(msg)) return 'Email ini sudah terdaftar. Coba masuk.';
  if (code === 'weak_password' || /password should be/i.test(msg)) return 'Kata sandi terlalu lemah. Gunakan minimal 6 karakter.';
  if (code === 'signup_disabled') return 'Pendaftaran sedang ditutup.';
  if (code === 'validation_failed' || /valid email/i.test(msg)) return 'Format email belum benar.';
  if (status === 429 || /rate limit/i.test(code + msg)) return 'Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.';
  return msg ? `Gagal: ${msg}` : 'Terjadi kesalahan. Coba lagi.';
}

async function call(path, { method = 'POST', body, token } = {}) {
  if (!configured) throw new AuthError('Layanan akun belum dipasang oleh pemilik situs.');
  let res;
  try {
    res = await fetch(`${BASE}/auth/v1${path}`, {
      method,
      headers: {
        apikey: KEY,
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new AuthError('Koneksi bermasalah. Coba lagi.', true);
  }
  let data = null;
  try {
    data = await res.json();
  } catch {}
  if (!res.ok) throw new AuthError(explain(data, res.status));
  return data;
}

const toSession = (d) => {
  const u = d.user || {};
  return {
    access_token: d.access_token,
    refresh_token: d.refresh_token,
    expires_at: d.expires_at || Math.floor(Date.now() / 1000) + (d.expires_in || 3600),
    user: { id: u.id, email: u.email, name: u.user_metadata?.name || u.email?.split('@')[0] || 'Pengguna' },
  };
};

const readSession = () => {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
  } catch {
    return null;
  }
};
const writeSession = (s) => {
  try {
    if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    else localStorage.removeItem(SESSION_KEY);
  } catch {}
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [guest, setGuest] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let dead = false;
    (async () => {
      let isGuest = false;
      try {
        isGuest = localStorage.getItem(GUEST_KEY) === '1';
      } catch {}
      let s = readSession();
      if (s && s.expires_at - Date.now() / 1000 < 60) {
        try {
          s = toSession(await call('/token?grant_type=refresh_token', { body: { refresh_token: s.refresh_token } }));
          writeSession(s);
        } catch (e) {
          // offline: tetap pakai sesi lama; selain itu sesi dianggap berakhir
          if (!e.network) {
            s = null;
            writeSession(null);
          }
        }
      }
      if (dead) return;
      setGuest(isGuest);
      setUser(s?.user || null);
      setLoading(false);
    })();
    return () => {
      dead = true;
    };
  }, []);

  const signIn = useCallback(async ({ email, password }) => {
    const d = await call('/token?grant_type=password', { body: { email: email.trim(), password } });
    const s = toSession(d);
    writeSession(s);
    setUser(s.user);
  }, []);

  const signUp = useCallback(async ({ name, email, password }) => {
    const d = await call('/signup', { body: { email: email.trim(), password, data: { name: name.trim() } } });
    if (d?.access_token) {
      const s = toSession(d);
      writeSession(s);
      setUser(s.user);
      return { needsConfirm: false };
    }
    // email yang sudah terdaftar dikembalikan tanpa identitas bila konfirmasi email aktif
    if (Array.isArray(d?.identities) && d.identities.length === 0) {
      throw new AuthError('Email ini sudah terdaftar. Coba masuk.');
    }
    return { needsConfirm: true };
  }, []);

  const signOut = useCallback(async () => {
    const s = readSession();
    writeSession(null);
    setUser(null);
    if (s?.access_token) call('/logout', { token: s.access_token }).catch(() => {});
  }, []);

  const continueAsGuest = useCallback(() => {
    try {
      localStorage.setItem(GUEST_KEY, '1');
    } catch {}
    setGuest(true);
  }, []);

  const leaveGuest = useCallback(() => {
    try {
      localStorage.removeItem(GUEST_KEY);
    } catch {}
    setGuest(false);
  }, []);

  const value = useMemo(
    () => ({ user, guest, loading, configured, uid: user?.id || 'guest', signIn, signUp, signOut, continueAsGuest, leaveGuest }),
    [user, guest, loading, signIn, signUp, signOut, continueAsGuest, leaveGuest]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
