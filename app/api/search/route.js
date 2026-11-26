import { NextResponse } from 'next/server';
import { searchTracks } from '@/lib/itunes';
import { audiusSearch } from '@/lib/audius';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const q = new URL(req.url).searchParams.get('q')?.trim().slice(0, 80);
  if (!q) return NextResponse.json({ tracks: [], source: 'audius' });

  const headers = { 'Cache-Control': 's-maxage=1800, stale-while-revalidate=86400' };

  let audiusFailed = false;
  try {
    const tracks = await audiusSearch(q, 30);
    if (tracks.length) return NextResponse.json({ tracks, source: 'audius' }, { headers });
  } catch {
    audiusFailed = true;
  }

  // Audius kosong/gagal: tawarkan cuplikan iTunes agar pencarian tetap berguna.
  try {
    const tracks = await searchTracks(q, 40);
    return NextResponse.json({ tracks, source: tracks.length || audiusFailed ? 'itunes' : 'audius' }, { headers });
  } catch {
    return NextResponse.json({ tracks: [], source: 'audius', error: 'Gagal mengambil data lagu' }, { status: 502 });
  }
}
