'use client';

import { useEffect, useState } from 'react';
import { useApp } from '@/lib/store';

// Pesan error singkat (mis. video YouTube yang menolak diputar), terlihat dari layar mana pun.
export default function Toast() {
  const { error, next, queue } = useApp();
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!error) {
      setMsg('');
      return;
    }
    setMsg(error);
    const t = setTimeout(() => setMsg(''), 8000);
    return () => clearTimeout(t);
  }, [error]);

  if (!msg) return null;
  return (
    <div className="toast" role="status">
      <span>{msg}</span>
      {queue.length > 1 && (
        <button
          onClick={() => {
            setMsg('');
            next(false);
          }}
        >
          Lewati
        </button>
      )}
    </div>
  );
}
