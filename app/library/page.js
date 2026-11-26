'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { useApp } from '@/lib/store';
import Cover from '@/components/Cover';
import TrackList from '@/components/TrackList';
import { IconHeart, IconPlus, IconUpload } from '@/components/Icons';

export default function Library() {
  const { liked, playlists, locals, createPlaylist, addFiles } = useApp();
  const [naming, setNaming] = useState(false);
  const [name, setName] = useState('');
  const fileRef = useRef(null);

  return (
    <div className="page">
      <h1 className="page-title">Koleksi</h1>

      <div className="hero-btns" style={{ marginBottom: 28 }}>
        <button className="btn btn-primary" onClick={() => setNaming(true)}>
          <IconPlus size={18} /> Playlist baru
        </button>
        <button className="btn btn-ghost" onClick={() => fileRef.current?.click()}>
          <IconUpload size={18} /> Dari perangkat
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="audio/*"
          multiple
          hidden
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      {naming && (
        <form
          className="inline-form glass"
          onSubmit={(e) => {
            e.preventDefault();
            createPlaylist(name);
            setName('');
            setNaming(false);
          }}
        >
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama playlist" maxLength={40} />
          <button type="submit" className="btn btn-primary">Buat</button>
          <button type="button" className="btn btn-ghost" onClick={() => setNaming(false)}>Batal</button>
        </form>
      )}

      <div className="grid">
        <Link href="/liked" className="card lib-card">
          <div className="card-art liked-art">
            <IconHeart filled size={44} />
          </div>
          <div className="card-t">Lagu disukai</div>
          <div className="card-s">{liked.length} lagu</div>
        </Link>
        {playlists.map((p) => (
          <Link key={p.id} href={`/playlist/${p.id}`} className="card lib-card">
            <div className="card-art"><Cover tracks={p.tracks} id={p.id} /></div>
            <div className="card-t">{p.name}</div>
            <div className="card-s">{p.tracks.length} lagu</div>
          </Link>
        ))}
      </div>

      {playlists.length === 0 && (
        <p className="footnote" style={{ textAlign: 'left' }}>
          Belum ada playlist. Buat satu, lalu tambahkan lagu lewat menu titik tiga di setiap lagu.
        </p>
      )}

      {locals.length > 0 && (
        <section className="shelf">
          <div className="shelf-h"><h2>Dari perangkat</h2></div>
          <TrackList tracks={locals} />
          <p className="footnote" style={{ textAlign: 'left' }}>
            File dari perangkat hanya ada selama halaman terbuka. Tambahkan lagi setelah memuat ulang.
          </p>
        </section>
      )}
    </div>
  );
}
