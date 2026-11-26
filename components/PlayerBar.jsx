'use client';

import { useApp, useTime } from '@/lib/store';
import { fmt } from '@/lib/util';
import Art from './Art';
import Slider from './Slider';
import {
  IconHeart, IconMic, IconNext, IconPause, IconPlay, IconPrev, IconQueue,
  IconRepeat, IconRepeatOne, IconShuffle, IconVolume, IconMute,
} from './Icons';

export default function PlayerBar() {
  const {
    current, playing, buffering, toggle, next, prev,
    shuffle, toggleShuffle, repeat, cycleRepeat,
    volume, setVolume, muted, setMuted, seek,
    likedIds, toggleLike, setExpanded, setNpTab,
  } = useApp();
  const { time, duration } = useTime();
  const has = !!current;
  const liked = has && likedIds.has(current.id);
  const open = (tab) => {
    if (!has) return;
    setNpTab(tab);
    setExpanded(true);
  };

  return (
    <footer className={`player glass ${has ? '' : 'no-track'}`}>
      <div className="p-left" onClick={() => open('lirik')}>
        <button className="p-art" aria-label="Buka layar pemutar" disabled={!has}>
          <Art src={current?.artSm || current?.art} id={current?.id || 'kosong'} />
        </button>
        <div className="p-meta">
          {has ? (
            <>
              <div className="p-title">{current.title}</div>
              <div className="p-artist">{current.artist}</div>
            </>
          ) : (
            <div className="p-hint">Pilih lagu untuk mulai</div>
          )}
        </div>
        {has && !current.local && (
          <button className={`ic hide-m ${liked ? 'liked' : ''}`} aria-label="Sukai lagu" onClick={(e) => { e.stopPropagation(); toggleLike(current); }}>
            <IconHeart filled={liked} size={20} />
          </button>
        )}
      </div>

      <div className="p-center">
        <div className="ctl">
          <button className={`ic hide-m ${shuffle ? 'on' : ''}`} aria-label="Acak" onClick={toggleShuffle}>
            <IconShuffle size={19} />
          </button>
          <button className="ic hide-m" aria-label="Sebelumnya" onClick={prev} disabled={!has}>
            <IconPrev size={22} />
          </button>
          <button className="play-btn" aria-label={playing ? 'Jeda' : 'Putar'} onClick={toggle} disabled={!has}>
            {playing ? <IconPause size={22} /> : <IconPlay size={22} />}
          </button>
          <button className="ic" aria-label="Berikutnya" onClick={() => next(false)} disabled={!has}>
            <IconNext size={22} />
          </button>
          <button className={`ic hide-m ${repeat !== 'off' ? 'on' : ''}`} aria-label="Ulangi" onClick={cycleRepeat}>
            {repeat === 'one' ? <IconRepeatOne size={19} /> : <IconRepeat size={19} />}
          </button>
        </div>
        <div className="p-seek hide-m">
          <span>{fmt(time)}</span>
          <Slider value={time} max={duration} onChange={seek} label="Posisi lagu" />
          <span>{buffering ? '···' : fmt(duration)}</span>
        </div>
      </div>

      <div className="p-right hide-m">
        <button className="ic" aria-label={muted ? 'Suarakan' : 'Bisukan'} onClick={() => setMuted(!muted)}>
          {muted || volume === 0 ? <IconMute size={20} /> : <IconVolume size={20} />}
        </button>
        <Slider className="vol" value={muted ? 0 : volume} max={1} step={0.01} onChange={setVolume} label="Volume" />
        <button className="ic" aria-label="Lihat lirik" onClick={() => open('lirik')} disabled={!has}>
          <IconMic size={20} />
        </button>
        <button className="ic" aria-label="Buka antrean" onClick={() => open('antrean')} disabled={!has}>
          <IconQueue size={20} />
        </button>
      </div>

      <div className="p-mini" style={{ '--p': `${duration > 0 ? (time / duration) * 100 : 0}%` }} />
    </footer>
  );
}
