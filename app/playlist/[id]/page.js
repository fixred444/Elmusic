'use client';

import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import Cover from '@/components/Cover';
import TrackList from '@/components/TrackList';
import { IconPlay } from '@/components/Icons';

export default function PlaylistPage() {
  const { id } = useParams();
  const router = useRouter();
  const { playlists, play, removeFromPlaylist, renamePlaylist, deletePlaylist } = useApp();
  const pl = playlists.find((p) => p.id === id);

  if (!pl) {
    return (
      <div className="page">
        <div className="empty">
          <h3>Playlist tidak ditemukan</h3>
          <p>Playlist ini mungkin sudah dihapus, atau tersimpan di browser lain.</p>
          <button className="btn btn-primary" onClick={() => router.push('/library')}>Ke koleksi</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="ph-head">
        <Cover tracks={pl.tracks} id={pl.id} className="ph-cover" />
        <div>
          <span className="eyebrow">Playlist</span>
          <h1 className="page-title big">{pl.name}</h1>
          <p className="hero-sub">{pl.tracks.length} lagu</p>
        </div>
      </header>

      <div className="hero-btns" style={{ margin: '24px 0 12px' }}>
        {pl.tracks.length > 0 && (
          <button className="btn btn-primary" onClick={() => play(pl.tracks[0], pl.tracks)}>
            <IconPlay size={18} /> Putar
          </button>
        )}
        <button
          className="btn btn-ghost"
          onClick={() => {
            const n = window.prompt('Nama baru', pl.name);
            if (n !== null) renamePlaylist(pl.id, n);
          }}
        >
          Ganti nama
        </button>
        <button
          className="btn btn-ghost"
          onClick={() => {
            if (window.confirm(`Hapus playlist "${pl.name}"?`)) {
              deletePlaylist(pl.id);
              router.push('/library');
            }
          }}
        >
          Hapus
        </button>
      </div>

      {pl.tracks.length > 0 ? (
        <TrackList tracks={pl.tracks} onRemove={(t) => removeFromPlaylist(pl.id, t.id)} />
      ) : (
        <div className="empty">
          <h3>Playlist ini masih kosong</h3>
          <p>Cari lagu, lalu pilih &ldquo;Simpan ke playlist&rdquo; dari menu titik tiga.</p>
        </div>
      )}
    </div>
  );
}
