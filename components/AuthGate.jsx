'use client';

import { useAuth } from '@/lib/auth';
import Welcome from './Welcome';

export default function AuthGate({ children }) {
  const { loading, user, guest } = useAuth();

  if (loading) {
    return (
      <div className="splash" aria-label="Memuat">
        <span className="logo-el">El</span>
        <span className="logo-sub">Music</span>
      </div>
    );
  }
  if (!user && !guest) return <Welcome />;
  return children;
}
