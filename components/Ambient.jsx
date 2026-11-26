'use client';

import { useApp } from '@/lib/store';
import { hueOf } from '@/lib/util';

// Latar yang ikut berubah mengikuti sampul lagu. Kaca di atasnya punya sesuatu untuk dibiaskan.
export default function Ambient() {
  const { current } = useApp();
  const hue = current ? hueOf(current.id) : 22;
  return (
    <div className="ambient" style={{ '--h': hue }} aria-hidden="true">
      <span className="blob b1" />
      <span className="blob b2" />
      <span className="blob b3" />
      {current?.art && <img key={current.art} src={current.art} alt="" />}
    </div>
  );
}
