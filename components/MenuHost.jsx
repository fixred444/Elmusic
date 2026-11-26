'use client';

import { useEffect, useState } from 'react';
import { useApp } from '@/lib/store';
import { IconCheck, IconPlus } from './Icons';

export default function MenuHost() {
  const { menu, closeMenu, playlists, addToPlaylist, createPlaylist, playNext, addToQueue } = useApp();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    setCreating(false);
    setName('');
  }, [menu]);

  if (!menu) return null;
  const { track, rect, onRemove } = menu;

  const W = 248;
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
  const left = Math.min(Math.max(8, rect.right - W), vw - W - 8);
  const above = rect.bottom > vh * 0.55;
  const pos = above ? { bottom: vh - rect.top + 6 } : { top: rect.bottom + 6 };

  const done = (fn) => () => {
    fn();
    closeMenu();
  };

  return (
    <>
      <div className="scrim" onClick={closeMenu} />
      <div className="menu glass" style={{ left, ...pos }} role="menu">
        <div className="menu-h">
          <b>{track.title}</b>
          <span>{track.artist}</span>
        </div>
        <button className="mi" onClick={done(() => playNext(track))}>Putar berikutnya</button>
        <button className="mi" onClick={done(() => addToQueue(track))}>Tambah ke antrean</button>
        {onRemove && (
          <button className="mi danger" onClick={done(onRemove)}>Hapus dari playlist ini</button>
        )}
        {!track.local && (
          <>
            <div className="menu-sep">Simpan ke playlist</div>
            {playlists.map((p) => {
              const has = p.tracks.some((t) => t.id === track.id);
              return (
                <button
                  key={p.id}
                  className="mi"
                  disabled={has}
                  onClick={done(() => addToPlaylist(p.id, track))}
                >
                  <span className="mi-t">{p.name}</span>
                  {has && <IconCheck size={16} />}
                </button>
              );
            })}
            {creating ? (
              <form
                className="mi-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  createPlaylist(name, track);
                  closeMenu();
                }}
              >
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama playlist"
                  maxLength={40}
                />
                <button type="submit" className="btn btn-primary sm">Buat</button>
              </form>
            ) : (
              <button className="mi" onClick={() => setCreating(true)}>
                <IconPlus size={16} /> <span className="mi-t">Playlist baru</span>
              </button>
            )}
          </>
        )}
      </div>
    </>
  );
}
