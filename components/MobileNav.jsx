'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconHome, IconLibrary, IconSearch } from './Icons';

const NAV = [
  { href: '/', label: 'Beranda', Icon: IconHome },
  { href: '/search', label: 'Cari', Icon: IconSearch },
  { href: '/library', label: 'Koleksi', Icon: IconLibrary },
];

export default function MobileNav() {
  const path = usePathname();
  return (
    <nav className="mnav glass" aria-label="Navigasi utama">
      {NAV.map(({ href, label, Icon }) => {
        const on = href === '/' ? path === '/' : path.startsWith(href);
        return (
          <Link key={href} href={href} className={on ? 'on' : ''}>
            <Icon size={22} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
