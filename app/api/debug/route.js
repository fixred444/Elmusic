import { NextResponse } from 'next/server';
import { BASES, authHeaders, audiusTrending, rawId } from '@/lib/audius';

export const dynamic = 'force-dynamic';

// Diagnosa: buka /api/debug untuk melihat apakah Audius bisa dijangkau dan apakah lagunya terbaca.
export async function GET() {
  const info = { apiKeySet: !!process.env.AUDIUS_API_KEY, youtubeKeySet: !!process.env.YOUTUBE_API_KEY };

  // data mentah lagu pertama
  try {
    const r = await fetch(`${BASES[0]}/tracks/trending?app_name=EL_MUSIC&limit=3`, { headers: authHeaders() });
    const j = await r.json();
    const t = j.data?.[0] || {};
    info.raw = {
      status: r.status,
      count: j.data?.length ?? 0,
      keys: Object.keys(t),
      id: t.id ?? null,
      track_id: t.track_id ?? null,
      title: t.title ?? null,
      is_streamable: t.is_streamable ?? null,
      access: t.access ?? null,
      artworkKeys: t.artwork ? Object.keys(t.artwork) : null,
    };
    info.rawIdUsed = rawId(t) ?? null;
  } catch (e) {
    info.raw = { error: String(e).slice(0, 200) };
  }

  // hasil setelah dibaca oleh El Music
  try {
    const tracks = await audiusTrending('', 5);
    info.parsed = { count: tracks.length, first: tracks[0] ? { id: tracks[0].id, title: tracks[0].title, art: !!tracks[0].art, src: tracks[0].preview } : null };

    // uji alamat stream lagu pertama
    if (tracks[0]) {
      const id = tracks[0].preview.split('/').pop();
      const r = await fetch(`${BASES[0]}/tracks/${id}/stream?app_name=EL_MUSIC`, { headers: authHeaders(), redirect: 'manual' });
      info.stream = { status: r.status, redirectTo: r.headers.get('location')?.slice(0, 120) || null, type: r.headers.get('content-type') };
    }
  } catch (e) {
    info.parsed = { error: String(e).slice(0, 200) };
  }

  return NextResponse.json(info);
}
