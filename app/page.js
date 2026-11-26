'use client';

import { useCallback, useEffect, useState } from 'react';
import { useApp } from '@/lib/store';
import { greeting } from '@/lib/util';
import Art from '@/components/Art';
import Shelf, { ShelfSkeleton } from '@/components/Shelf';
import { IconHeart, IconPlay } from '@/components/Icons';

export default function Home() {
  const { play, recent, toggleLike, likedIds } = useApp();
  const [shelves, setShelves] = useState(null);
  const [failed, setFailed] = useState(false);
  const [source, setSource] = useState('audius');
  const [hello, setHello] = useState('');

  const fetchHome = useCallback(() => {
    setFailed(false);
    setShelves(null);
    fetch('/api/home')
      .then((r) => r.json())
      .then((d) => {
        if (d.shelves?.length) {
          setSource(d.source || 'audius');
          setShelves(d.shelves);
        } else setFailed(true);
      })
      .catch(() => setFailed(true));
  }, []);

  useEffect(() => {
    setHello(greeting());
    fetchHome();
  }, [fetchHome]);

  const heroList = shelves?.[0]?.tracks;
  const hero = heroList?.[0];

  return (
    <div className="page">
      <p className="greet">{hello || ' '}</p>

      {hero ? (
        <section className="hero">
          <div className="hero-art"><Art src={hero.art} id={hero.id} /></div>
          <div className="hero-text">
            <span className="eyebrow">Pilihan El hari ini</span>
            <h1>{hero.title}</h1>
            <p className="hero-sub">{hero.artist}{hero.album ? ` — ${hero.album}` : ''}</p>
            <div className="hero-btns">
              <button className="btn btn-primary" onClick={() => play(hero, heroList)}>
                <IconPlay size={18} /> Putar
              </button>
              <button className="btn btn-ghost" onClick={() => toggleLike(hero)}>
                <IconHeart filled={likedIds.has(hero.id)} size={18} />
                {likedIds.has(hero.id) ? 'Disukai' : 'Sukai'}
              </button>
            </div>
          </div>
        </section>
      ) : !failed ? (
        <section className="hero">
          <div className="hero-art sk" />
          <div className="hero-text">
            <div className="sk" style={{ width: 120, height: 12, borderRadius: 6 }} />
            <div className="sk" style={{ width: '70%', height: 72, margin: '16px 0' }} />
            <div className="sk" style={{ width: 200, height: 16, borderRadius: 8 }} />
          </div>
        </section>
      ) : null}

      {recent.length > 0 && (
        <section className="shelf">
          <div className="shelf-h"><h2>Terakhir kamu putar</h2></div>
          <div className="quick">
            {recent.slice(0, 6).map((t) => (
              <button key={t.id} className="quick-i" onClick={() => play(t, recent)}>
                <Art src={t.art} id={t.id} />
                <span>{t.title}</span>
              </button>
            ))}
          </div>
        </section>
      )}

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
          : 'Lagu diputar penuh dari katalog musik independen Audius. Hargai senimannya: dengarkan dan bagikan.'}
      </p>
    </div>
  );
}
