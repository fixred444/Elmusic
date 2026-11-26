import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const HEADERS = { 'User-Agent': 'El Music (https://elmusicc.vercel.app)' };

// "[01:23.45] teks" -> { t: 83.45, text }
function parseLrc(lrc = '') {
  const out = [];
  for (const line of lrc.split('\n')) {
    const stamps = [...line.matchAll(/\[(\d+):(\d+(?:\.\d+)?)\]/g)];
    if (!stamps.length) continue;
    const text = line.replace(/\[[^\]]*\]/g, '').trim();
    for (const m of stamps) out.push({ t: parseInt(m[1], 10) * 60 + parseFloat(m[2]), text });
  }
  return out.sort((a, b) => a.t - b.t);
}

async function search(params) {
  const r = await fetch(`https://lrclib.net/api/search?${new URLSearchParams(params)}`, {
    headers: HEADERS,
    next: { revalidate: 86400 },
  });
  if (!r.ok) return [];
  const j = await r.json();
  return Array.isArray(j) ? j : [];
}

const tokens = (s = '') =>
  s.toLowerCase().replace(/[^a-z0-9À-ɏ ]+/g, ' ').split(/\s+/).filter((w) => w.length > 1);
const sameArtist = (a, b) => {
  const A = tokens(a);
  const B = new Set(tokens(b));
  return A.length === 0 || A.some((w) => B.has(w));
};

export async function GET(req) {
  const sp = new URL(req.url).searchParams;
  const title = (sp.get('title') || '').trim().slice(0, 120);
  const artist = (sp.get('artist') || '').trim().slice(0, 120);
  const dur = parseFloat(sp.get('duration') || '0');
  if (!title) return NextResponse.json({ found: false });

  try {
    let list = await search({ track_name: title, artist_name: artist });
    if (!list.length) list = await search({ q: `${title} ${artist}`.trim() });
    if (!list.length && artist) list = await search({ track_name: title });

    // buang hasil yang artisnya jelas beda (judul yang sama dipakai banyak lagu)
    const cand = list.filter(
      (x) => (x.syncedLyrics || x.plainLyrics) && sameArtist(artist, x.artistName) && (!dur || !x.duration || Math.abs(x.duration - dur) < 25)
    );
    if (!cand.length) return NextResponse.json({ found: false });

    const score = (x) => (x.syncedLyrics ? 0 : 1000) + (dur > 0 && x.duration ? Math.abs(x.duration - dur) : 30);
    cand.sort((a, b) => score(a) - score(b));
    const best = cand[0];

    return NextResponse.json(
      {
        found: true,
        synced: best.syncedLyrics ? parseLrc(best.syncedLyrics) : null,
        plain: best.plainLyrics || null,
        title: best.trackName,
        artist: best.artistName,
      },
      { headers: { 'Cache-Control': 's-maxage=86400, stale-while-revalidate=604800' } }
    );
  } catch {
    return NextResponse.json({ found: false, error: true });
  }
}
