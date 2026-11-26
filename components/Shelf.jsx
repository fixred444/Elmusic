'use client';

import { useApp } from '@/lib/store';
import Art from './Art';
import { Eq } from './TrackRow';
import { IconPause, IconPlay } from './Icons';

export function ShelfSkeleton() {
  return (
    <section className="shelf">
      <div className="sk" style={{ width: 220, height: 30, marginBottom: 18 }} />
      <div className="rail">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i}>
            <div className="sk" style={{ aspectRatio: '1', borderRadius: 16 }} />
            <div className="sk" style={{ height: 12, width: '70%', marginTop: 12, borderRadius: 6 }} />
            <div className="sk" style={{ height: 10, width: '45%', marginTop: 8, borderRadius: 6 }} />
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Shelf({ title, tracks }) {
  const { play, toggle, current, playing } = useApp();
  return (
    <section className="shelf">
      <div className="shelf-h">
        <h2>{title}</h2>
      </div>
      <div className="rail">
        {tracks.map((t) => {
          const active = current?.id === t.id;
          return (
            <button
              key={t.id}
              className={`card ${active ? 'active' : ''}`}
              onClick={() => (active ? toggle() : play(t, tracks))}
            >
              <div className="card-art">
                <Art src={t.art} id={t.id} />
                <span className="card-play glass">
                  {active && playing ? <IconPause size={18} /> : <IconPlay size={18} />}
                </span>
                {active && playing && (
                  <span className="card-eq glass"><Eq /></span>
                )}
              </div>
              <div className="card-t">{t.title}</div>
              <div className="card-s">{t.artist}</div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
