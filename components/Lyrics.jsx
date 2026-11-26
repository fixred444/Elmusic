'use client';

import { useEffect, useRef, useState } from 'react';
import { useApp, useTime } from '@/lib/store';

const cache = new Map();

export default function Lyrics({ track }) {
  const { seek } = useApp();
  const { time } = useTime();
  const [data, setData] = useState(null); // null = memuat
  const [offset, setOffset] = useState(0);
  const boxRef = useRef(null);
  const key = track ? `${track.title}|${track.artist}` : '';

  useEffect(() => {
    setOffset(0);
    if (!track) return;
    if (cache.has(key)) {
      setData(cache.get(key));
      return;
    }
    setData(null);
    const ctrl = new AbortController();
    const p = new URLSearchParams({ title: track.title, artist: track.artist || '' });
    if (track.duration) p.set('duration', String(track.duration));
    fetch(`/api/lyrics?${p}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((d) => {
        cache.set(key, d);
        setData(d);
      })
      .catch((e) => {
        if (e.name !== 'AbortError') setData({ found: false, error: true });
      });
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Lirik berjalan hanya untuk lagu penuh; cuplikan 30 detik dari iTunes tidak cocok waktunya.
  const lines = data?.found && data.synced && (track?.full || track?.local) ? data.synced : null;
  const t = time + offset;
  let active = -1;
  if (lines) {
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].t <= t + 0.25) active = i;
      else break;
    }
  }

  useEffect(() => {
    const box = boxRef.current;
    if (!box || active < 0) return;
    const el = box.querySelector(`[data-i="${active}"]`);
    if (el) box.scrollTo({ top: el.offsetTop - box.clientHeight / 2 + el.clientHeight / 2, behavior: 'smooth' });
  }, [active]);

  if (!track) return null;

  if (data === null) {
    return (
      <div className="lyr">
        <div className="lyr-box plain">
          {[80, 60, 90, 50, 70].map((w, i) => (
            <div key={i} className="sk" style={{ height: 24, width: `${w}%`, marginBottom: 16, borderRadius: 8 }} />
          ))}
        </div>
      </div>
    );
  }

  if (!data.found) {
    return (
      <div className="lyr">
        <div className="lyr-msg">
          <b>Lirik belum tersedia</b>
          <span>Belum ada lirik untuk lagu ini di database LRCLIB.</span>
        </div>
      </div>
    );
  }

  if (lines) {
    return (
      <div className="lyr">
        <div className="lyr-box" ref={boxRef}>
          {lines.map((l, i) => (
            <button
              key={i}
              data-i={i}
              className={`lyr-l ${i === active ? 'on' : i < active ? 'past' : ''}`}
              onClick={() => seek(Math.max(0, l.t - offset))}
            >
              {l.text || '♪'}
            </button>
          ))}
        </div>
        <div className="lyr-foot">
          <span>Lirik: LRCLIB</span>
          <span className="lyr-off">
            <button onClick={() => setOffset((o) => +(o - 0.5).toFixed(1))} aria-label="Lirik lebih lambat">−</button>
            <em>geser {offset > 0 ? '+' : ''}{offset}s</em>
            <button onClick={() => setOffset((o) => +(o + 0.5).toFixed(1))} aria-label="Lirik lebih cepat">+</button>
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="lyr">
      <div className="lyr-box plain">
        <p>{data.plain || data.synced?.map((l) => l.text).join('\n')}</p>
      </div>
      <div className="lyr-foot">
        <span>Lirik: LRCLIB{track.full || track.local ? '' : ' · cuplikan 30 detik, lirik tidak berjalan otomatis'}</span>
      </div>
    </div>
  );
}
