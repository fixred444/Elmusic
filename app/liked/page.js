'use client';

import { useApp } from '@/lib/store';
import TrackList from '@/components/TrackList';
import { IconHeart, IconPlay } from '@/components/Icons';

export default function Liked() {
  const { liked, play } = useApp();
  return (
    <div className="page">
      <header className="ph-head">
        <div className="cover liked-art"><IconHeart filled size={72} /></div>
        <div>
          <span className="eyebrow">Playlist</span>
          <h1 className="page-title big">Lagu disukai</h1>
          <p className="hero-sub">{liked.length} lagu</p>
        </div>
      </header>

      {liked.length > 0 ? (
        <>
          <div className="hero-btns" style={{ margin: '24px 0 12px' }}>
            <button className="btn btn-primary" onClick={() => play(liked[0], liked)}>
              <IconPlay size={18} /> Putar semua
            </button>
          </div>
          <TrackList tracks={liked} />
        </>
      ) : (
        <div className="empty">
          <h3>Belum ada lagu yang disukai</h3>
          <p>Ketuk ikon hati pada lagu mana pun untuk menyimpannya di sini.</p>
        </div>
      )}
    </div>
  );
}
