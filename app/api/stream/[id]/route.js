import { NextResponse } from 'next/server';
import { BASES, authHeaders } from '@/lib/audius';

export const dynamic = 'force-dynamic';

// Meneruskan pemutar ke alamat audio Audius. Redirect menjaga seek (range request) tetap jalan,
// dan API key (jika ada) tidak pernah sampai ke browser.
export async function GET(req, { params }) {
  const { id } = await params;
  if (!/^[A-Za-z0-9]+$/.test(id)) return new Response('ID tidak valid', { status: 400 });

  for (const base of BASES) {
    try {
      const r = await fetch(`${base}/tracks/${id}/stream?app_name=EL_MUSIC`, {
        headers: authHeaders(),
        redirect: 'manual',
      });
      const loc = r.headers.get('location');
      if (loc) return NextResponse.redirect(loc, 302);
      if (r.ok && r.body) {
        return new Response(r.body, {
          headers: { 'Content-Type': r.headers.get('content-type') || 'audio/mpeg' },
        });
      }
    } catch {}
  }
  return new Response('Lagu tidak tersedia', { status: 502 });
}
