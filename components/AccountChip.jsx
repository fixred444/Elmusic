'use client';

import { useAuth } from '@/lib/auth';

export default function AccountChip() {
  const { user, guest, signOut, leaveGuest } = useAuth();
  if (!user && !guest) return null;
  const label = user ? user.name : 'Tamu';
  return (
    <div className="acct">
      <span className="acct-av">{(label[0] || '?').toUpperCase()}</span>
      <span className="acct-t">
        <b>{label}</b>
        <small>{user ? user.email : 'Data tersimpan di perangkat ini'}</small>
      </span>
      {user ? (
        <button
          className="btn btn-ghost sm"
          onClick={() => {
            if (window.confirm('Keluar dari akun?')) signOut();
          }}
        >
          Keluar
        </button>
      ) : (
        <button className="btn btn-primary sm" onClick={leaveGuest}>Masuk</button>
      )}
    </div>
  );
}
