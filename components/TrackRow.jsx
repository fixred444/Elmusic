'use client';

import { useApp } from '@/lib/store';
import Art from './Art';
import { IconHeart, IconMore, IconPlay } from './Icons';

export function Eq() {
  return (
    <span className="eq" aria-hidden="true">
      <i /><i /><i />
    </span>
  );
}

export default function TrackRow({ track, list, index, onRemove }) {
  const { current, playing, play, toggle, likedIds, toggleLike, openMenu } = useApp();
  const active = current?.id === track.id;
  const liked = likedIds.has(track.id);

  const click = () => (active ? toggle() : play(track, list));

  return (
    <div
      className={`row ${active ? 'active' : ''}`}
      role="button"
      tabIndex={0}
      onClick={click}
      onKeyDown={(e) => {
        if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          click();
        }
      }}
    >
      <div className="row-idx">
        {active && playing ? <Eq /> : <span className="n">{index + 1}</span>}
        <span className="hp"><IconPlay size={16} /></span>
      </div>
      <div className="row-main">
        <Art src={track.artSm || track.art} id={track.id} className="row-art" />
        <div className="row-text">
          <div className="row-title">{track.title}</div>
          <div className="row-sub">{track.artist}</div>
        </div>
      </div>
      <div className="row-album">{track.album}</div>
      <div className="row-actions">
        {!track.local && (
          <button
            className={`ic ${liked ? 'liked' : ''}`}
            aria-label={liked ? 'Hapus dari lagu disukai' : 'Sukai lagu'}
            onClick={(e) => {
              e.stopPropagation();
              toggleLike(track);
            }}
          >
            <IconHeart filled={liked} size={19} />
          </button>
        )}
        <button
          className="ic"
          aria-label="Opsi lainnya"
          onClick={(e) => {
            e.stopPropagation();
            openMenu(track, e.currentTarget.getBoundingClientRect(), { onRemove });
          }}
        >
          <IconMore size={19} />
        </button>
      </div>
    </div>
  );
}
