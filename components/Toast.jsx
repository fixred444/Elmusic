'use client';

import { useEffect, useState } from 'react';
import { useApp } from '@/lib/store';

// Pesan error singkat (mis. video YouTube yang menolak diputar), terlihat dari layar mana pun.
export default function Toast() {
  const { error } = useApp();
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!error) {
      setMsg('');
      return;
    }
    setMsg(error);
    const t = setTimeout(() => setMsg(''), 6000);
    return () => clearTimeout(t);
  }, [error]);

  if (!msg) return null;
  return <div className="toast" role="status">{msg}</div>;
}
