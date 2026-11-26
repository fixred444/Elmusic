'use client';

import { useApp } from '@/lib/store';
import { hueOf } from '@/lib/util';

// Latar tipis yang warnanya mengikuti lagu. Murni gradien CSS, tanpa gambar/blur berat.
export default function Ambient() {
  const { current } = useApp();
  return <div className="ambient" style={{ '--h': current ? hueOf(current.id) : 0, '--s': current ? '34%' : '0%' }} aria-hidden="true" />;
}
