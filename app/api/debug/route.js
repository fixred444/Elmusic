import { NextResponse } from 'next/server';
import { BASES, authHeaders } from '@/lib/audius';

export const dynamic = 'force-dynamic';

// Halaman diagnosa: buka /api/debug untuk melihat apakah Audius bisa dijangkau dari server Vercel.
export async function GET() {
  const out = [];
  for (const base of BASES) {
    try {
      const r = await fetch(`${base}/tracks/trending?app_name=EL_MUSIC&limit=1`, { headers: authHeaders() });
      const text = await r.text();
      out.push({ base, status: r.status, ok: r.ok, body: text.slice(0, 160) });
    } catch (e) {
      out.push({ base, error: String(e).slice(0, 160) });
    }
  }
  return NextResponse.json({ apiKeySet: !!process.env.AUDIUS_API_KEY, results: out });
}
