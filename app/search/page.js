'use client';

import { useEffect, useState } from 'react';
import { useApp } from '@/lib/store';
import { GENRES, hueOf } from '@/lib/util';
import Art from '@/components/Art';
import TrackList from '@/components/TrackList';
import { IconClose, IconPlay, IconSearch } from '@/components/Icons';

export default function SearchPage() {
  const { play } = useApp();
  const [q, setQ] = useState('');
  const [res, setRes] = useState(null); // Audius / iTunes
  const [ytRes, setYtRes] = useState([]);
  const [ytOff, setYtOff] = useState(false);
  const [ytErr, setYtErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [source, setSource] = useState('audius');

  useEffect(() => {
    const term = q.trim();
    if (!term) {
      setRes(null);
      setYtRes([]);
      setBusy(false);
      setErr('');
      return;
    }
    setBusy(true);
    const ctrl = new AbortController();
    const id = setTimeout(async () => {
      const get = (url) => fetch(url, { signal: ctrl.signal }).then((r) => r.json()).catch((e) => {
        if (e.name === 'AbortError') throw e;
        return { tracks: [], error: 'Koneksi bermasalah. Coba lagi.' };
      });
      try {
        const [a, y] = await Promise.all([
          get(`/api/search?q=${encodeURIComponent(term)}`),
          get(`/api/yt-search?q=${encodeURIComponent(term)}`),
        ]);
        setRes(a.tracks || []);
        setSource(a.source || 'audius');
        setErr(a.error || '');
        setYtRes(y.tracks || []);
        setYtOff(!!y.disabled);
        setYtErr(y.error || '');
        setBusy(false);
      } catch (e) {
        /* dibatalkan karena pengetikan berikutnya */
      }
    }, 400);
    return () => {
      clearTimeout(id);
      ctrl.abort();
    };
  }, [q]);

  const hasYt = ytRes.length > 0;
  const hasRes = !!res && res.length > 0;
  const topList = hasYt ? ytRes : res;
  const top = topList?.[0];
  const nothing = !busy && res && !hasRes && !hasYt;

  return (
    <div className="page">
      <h1 className="page-title">Cari</h1>
      <label className="searchbox glass">
        <IconSearch size={22} />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Lagu, artis, atau album"
          aria-label="Cari musik"
        />
        {q && (
          <button className="ic sm" aria-label="Hapus" onClick={() => setQ('')} type="button">
            <IconClose size={18} />
          </button>
        )}
      </label>

      {!q.trim() && (
        <section className="shelf">
          <div className="shelf-h"><h2>Jelajahi genre</h2></div>
          <div className="genres">
            {GENRES.map((g) => {
              const h = hueOf(g.name);
              return (
                <button
                  key={g.name}
                  className="genre"
                  style={{ background: `linear-gradient(150deg, hsl(${h} 38% 30%), hsl(${(h + 40) % 360} 42% 14%))` }}
                  onClick={() => setQ(g.term)}
                >
                  {g.name}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {busy && (
        <div className="list-sk">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="sk" style={{ height: 56, marginBottom: 8, borderRadius: 12 }} />
          ))}
        </div>
      )}

      {!busy && q.trim() && ytOff && (
        <p className="src-note" style={{ marginTop: 18 }}>
          Pencarian lagu populer (YouTube) belum aktif. Pasang YOUTUBE_API_KEY di Vercel untuk mengaktifkannya.
        </p>
      )}
      {!busy && q.trim() && ytErr && <p className="src-note" style={{ marginTop: 18 }}>{ytErr}</p>}

      {!busy && err && !hasYt && <div className="empty"><h3>{err}</h3></div>}

      {nothing && !err && (
        <div className="empty">
          <h3>Tidak ada hasil untuk &ldquo;{q.trim()}&rdquo;</h3>
          <p>Coba kata kunci lain atau periksa ejaannya.</p>
        </div>
      )}

      {!busy && top && (
        <>
          <section className="top-result">
            <button className="top-card glass" onClick={() => play(top, topList)}>
              <Art src={top.art} id={top.id} className="top-art" />
              <span className="top-text">
                <span className="eyebrow">Hasil teratas</span>
                <b>{top.title}</b>
                <small>{top.artist}</small>
              </span>
              <span className="top-play"><IconPlay size={22} /></span>
            </button>
          </section>

          {hasYt && (
            <section className="shelf" style={{ marginTop: 28 }}>
              <div className="shelf-h">
                <h2>Lagu populer</h2>
                <p className="src-note">Diputar penuh lewat YouTube.</p>
              </div>
              <TrackList tracks={ytRes} />
            </section>
          )}

          {hasRes && (
            <section className="shelf" style={{ marginTop: 28 }}>
              <div className="shelf-h">
                <h2>{hasYt ? 'Musik independen' : 'Lagu'}</h2>
                {source === 'itunes' && (
                  <p className="src-note">Tidak ada lagu penuh untuk pencarian ini. Menampilkan cuplikan 30 detik dari iTunes.</p>
                )}
              </div>
              <TrackList tracks={res} />
            </section>
          )}
        </>
      )}
    </div>
  );
}
