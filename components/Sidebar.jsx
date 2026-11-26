'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRef } from 'react';
import { useApp } from '@/lib/store';
import Cover from './Cover';
import { IconHeart, IconHome, IconLibrary, IconPlus, IconSearch, IconUpload } from './Icons';

export function Logo() {
  return (
    <Link href="/" className="logo" aria-label="El Music, beranda">
      <span className="logo-el">El</span>
      <span className="logo-sub">Music</span>
    </Link>
  );
}

const NAV = [
  { href: '/', label: 'Beranda', Icon: IconHome },
  { href: '/search', label: 'Cari', Icon: IconSearch },
  { href: '/library', label: 'Koleksi', Icon: IconLibrary },
];

export default function Sidebar() {
  const path = usePathname();
  const { playlists, liked, createPlaylist, addFiles } = useApp();
  const fileRef = useRef(null);

  return (
    <aside className="sidebar glass">
      <Logo />
      <nav className="nav">
        {NAV.map(({ href, label, Icon }) => {
          const on = href === '/' ? path === '/' : path.startsWith(href);
          return (
            <Link key={href} href={href} className={`nav-i ${on ? 'on' : ''}`}>
              <Icon size={21} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="side-h">
        <span>Playlist</span>
        <button
          className="ic sm"
          aria-label="Buat playlist"
          onClick={() => {
            const n = window.prompt('Nama playlist baru');
            if (n !== null) createPlaylist(n);
          }}
        >
          <IconPlus size={18} />
        </button>
      </div>

      <div className="side-list">
        <Link href="/liked" className={`side-i ${path === '/liked' ? 'on' : ''}`}>
          <span className="side-heart"><IconHeart filled size={16} /></span>
          <span className="side-t">
            <b>Lagu disukai</b>
            <small>{liked.length} lagu</small>
          </span>
        </Link>
        {playlists.map((p) => (
          <Link key={p.id} href={`/playlist/${p.id}`} className={`side-i ${path === `/playlist/${p.id}` ? 'on' : ''}`}>
            <Cover tracks={p.tracks} id={p.id} className="side-cover" />
            <span className="side-t">
              <b>{p.name}</b>
              <small>{p.tracks.length} lagu</small>
            </span>
          </Link>
        ))}
      </div>

      <button className="btn btn-ghost side-upload" onClick={() => fileRef.current?.click()}>
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
    </aside>
  );
}
