import { NextResponse } from 'next/server';
import { searchTracks } from '@/lib/itunes';
import { SHELVES } from '@/lib/shelves';

export const dynamic = 'force-dynamic';

export async function GET() {
  const results = await Promise.all(
    SHELVES.map(async (s) => {
      try {
        const tracks = await searchTracks(s.term, 20);
        return { title: s.title, tracks };
      } catch {
        return { title: s.title, tracks: [] };
      }
    })
  );
  const shelves = results.filter((s) => s.tracks.length > 0);
  return NextResponse.json(
    { shelves },
    {
      headers: {
        'Cache-Control': shelves.length ? 's-maxage=3600, stale-while-revalidate=86400' : 'no-store',
      },
    }
  );
}
