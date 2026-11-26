import { NextResponse } from 'next/server';
import { searchTracks } from '@/lib/itunes';
import { audiusTrending } from '@/lib/audius';
import { AUDIUS_SHELVES, SHELVES } from '@/lib/shelves';

export const dynamic = 'force-dynamic';

const safe = async (fn) => {
  try {
    return await fn();
  } catch {
    return [];
  }
};

export async function GET() {
  // 1) lagu penuh dari Audius
  let shelves = (
    await Promise.all(
      AUDIUS_SHELVES.map(async (s) => ({ title: s.title, tracks: await safe(() => audiusTrending(s.genre, 20)) }))
    )
  ).filter((s) => s.tracks.length > 0);
  let source = 'audius';

  // 2) cadangan: cuplikan iTunes
  if (shelves.length === 0) {
    source = 'itunes';
    shelves = (
      await Promise.all(
        SHELVES.map(async (s) => ({ title: s.title, tracks: await safe(() => searchTracks(s.term, 20)) }))
      )
    ).filter((s) => s.tracks.length > 0);
  }

  return NextResponse.json(
    { shelves, source },
    {
      headers: {
        'Cache-Control': shelves.length ? 's-maxage=1800, stale-while-revalidate=86400' : 'no-store',
      },
    }
  );
}
