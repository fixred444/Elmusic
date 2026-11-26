'use client';

import { useEffect } from 'react';
import { useApp, useTime } from '@/lib/store';
import { fmt, hueOf } from '@/lib/util';
import Art from './Art';
import Slider from './Slider';
import { Eq } from './TrackRow';
import {
  IconDown, IconHeart, IconNext, IconPause, IconPlay, IconPrev,
  IconRepeat, IconRepeatOne, IconShuffle,
} from './Icons';

export default function NowPlaying() {
  const {
    expanded, setExpanded, current, playing, error, toggle, next, prev,
    shuffle, toggleShuffle, repeat, cycleRepeat, seek,
    likedIds, toggleLike, queue, index, jumpTo,
  } = useApp();
  const { time, duration } = useTime();

  useEffect(() => {
    document.body.style.overflow = expanded ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [expanded]);

  const liked = current && likedIds.has(current.id);
  const upcoming = queue.map((t, i) => ({ t, i })).filter(({ i }) => i !== index);

  return (
    <section className={`np ${expanded ? 'open' : ''}`} aria-hidden={!expanded} aria-label="Sedang diputar">
      <div className="np-bg" style={{ '--h': current ? hueOf(current.id) : 0 }} />

      <div className="np-top">
        <button className="ic glass-btn" onClick={() => setExpanded(false)} aria-label="Tutup">
          <IconDown size={22} />
        </button>
        <span>Sedang diputar</span>
        <span style={{ width: 40 }} />
      </div>

      {current && (
        <div className="np-wrap">
          <div className={`np-art ${playing ? '' : 'paused'}`}>
            <Art src={current.art} id={current.id} />
          </div>

          <div className="np-side">
            <div className="np-info">
              <div className="np-text">
                <h2>{current.title}</h2>
                <p>{current.artist}{current.album ? ` · ${current.album}` : ''}</p>
              </div>
              {!current.local && (
                <button className={`ic ${liked ? 'liked' : ''}`} aria-label="Sukai lagu" onClick={() => toggleLike(current)}>
                  <IconHeart filled={liked} size={24} />
                </button>
              )}
            </div>

            {error && <div className="np-err">{error}</div>}

            <div className="np-seek">
              <Slider value={time} max={duration} onChange={seek} label="Posisi lagu" />
              <div><span>{fmt(time)}</span><span>{fmt(duration)}</span></div>
            </div>

            <div className="ctl big">
              <button className={`ic ${shuffle ? 'on' : ''}`} aria-label="Acak" onClick={toggleShuffle}><IconShuffle size={21} /></button>
              <button className="ic" aria-label="Sebelumnya" onClick={prev}><IconPrev size={28} /></button>
              <button className="play-btn xl" aria-label={playing ? 'Jeda' : 'Putar'} onClick={toggle}>
                {playing ? <IconPause size={30} /> : <IconPlay size={30} />}
              </button>
              <button className="ic" aria-label="Berikutnya" onClick={() => next(false)}><IconNext size={28} /></button>
              <button className={`ic ${repeat !== 'off' ? 'on' : ''}`} aria-label="Ulangi" onClick={cycleRepeat}>
                {repeat === 'one' ? <IconRepeatOne size={21} /> : <IconRepeat size={21} />}
              </button>
            </div>

            {upcoming.length > 0 && (
              <div className="np-queue">
                <div className="np-q-h">Antrean</div>
                {upcoming.slice(0, 40).map(({ t, i }) => (
                  <button key={`${t.id}-${i}`} className="q-i" onClick={() => jumpTo(i)}>
                    <Art src={t.artSm || t.art} id={t.id} className="q-art" />
                    <span className="q-t">
                      <b>{t.title}</b>
                      <small>{t.artist}</small>
                    </span>
                    {i === index && playing && <Eq />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
