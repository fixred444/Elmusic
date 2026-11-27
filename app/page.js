'use client';

import { useCallback, useEffect, useState } from 'react';
import { useApp } from '@/lib/store';
import { greeting } from '@/lib/util';
import Art from '@/components/Art';
import Shelf, { ShelfSkeleton } from '@/components/Shelf';
import { fetchHome as loadHome, readHomeCache } from '@/lib/homeCache';

export default function Home() {
  const { play, recent } = useApp();
  const [shelves, setShelves] = useState(null);
  const [failed, setFailed] = useState(false);
  const [source, setSource] = useState('audius');
  const [hello, setHello] = useState('');

  const fetchHome = useCallback(() => {
    setFailed(false);
    const cached = readHomeCache();
    if (cached) {
      // tampil seketika dari data tersimpan, lalu diperbarui di belakang
      setSource(cached.source || 'audius');
      setShelves(cached.shelves);
    } else setShelves(null);
    loadHome()
      .then((d) => {
        if (d.shelves?.length) {
          setSource(d.source || 'audius');
          setShelves(d.shelves);
        } else if (!cached) setFailed(true);
      })
      .catch(() => { if (!cached) setFailed(true); });
  }, []);

  useEffect(() => {
    setHello(greeting());
    fetchHome();
  }, [fetchHome]);

  const quickList = recent.length ? recent : shelves?.[0]?.tracks;
  const quick = quickList ? quickList.slice(0, 6) : [];

  return (
    <div className="page">
      <h1 className="page-title">{hello || ' '}</h1>

      {quick.length > 0 ? (
        <div className="quick">
          {quick.map((t) => (
            <button key={t.id} className="quick-i" onClick={() => play(t, quickList)}>
              <Art src={t.artSm || t.art} id={t.id} />
              <span>{t.title}</span>
            </button>
          ))}
        </div>
      ) : !failed ? (
        <div className="quick">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="sk" style={{ height: 56, borderRadius: 8 }} />
          ))}
        </div>
      ) : null}

      {failed && (
        <div className="empty">
          <h3>Belum bisa memuat lagu</h3>
          <p>Periksa koneksi internetmu, lalu coba lagi.</p>
          <button className="btn btn-primary" onClick={fetchHome}>Coba lagi</button>
        </div>
      )}

      {!shelves && !failed && (
        <>
          <ShelfSkeleton />
          <ShelfSkeleton />
        </>
      )}

      {shelves?.map((s) => (
        <Shelf key={s.title} title={s.title} tracks={s.tracks} />
      ))}

      <p className="footnote">
        {source === 'itunes'
          ? 'Katalog lagu penuh sedang tidak terjangkau, jadi yang tampil adalah cuplikan 30 detik dari iTunes. Kamu tetap bisa memutar file musik sendiri lewat tombol "Dari perangkat".'
          : 'Lagu diputar penuh dari katalog musik independen Audius. Untuk lagu populer, gunakan halaman Cari.'}
      </p>
    </div>
  );
}
