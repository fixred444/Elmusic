import { NextResponse } from 'next/server';
import { searchTracks } from '@/lib/itunes';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const q = new URL(req.url).searchParams.get('q')?.trim();
  if (!q) return NextResponse.json({ tracks: [] });
  try {
    const tracks = await searchTracks(q.slice(0, 80), 40);
    return NextResponse.json(
      { tracks },
      { headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400' } }
    );
  } catch (e) {
    return NextResponse.json({ tracks: [], error: 'Gagal mengambil data lagu' }, { status: 502 });
  }
}
