import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const decode = (s = '') =>
  s.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

function clean(rawTitle, channel) {
  let title = decode(rawTitle)
    .replace(/\s*[(\[][^)\]]*(official|video|audio|lyric|lirik|mv|clip|hd|4k|live)[^)\]]*[)\]]/gi, '')
    .replace(/\s*\|.*$/, '')
    .trim();
  let artist = decode(channel).replace(/\s*-\s*Topic$/i, '').replace(/VEVO$/i, '').trim();
  const m = title.match(/^(.+?)\s+[-–]\s+(.+)$/);
  if (m) {
    artist = m[1].trim();
    title = m[2].trim();
  }
  return { title: title || decode(rawTitle), artist };
}

export async function GET(req) {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return NextResponse.json({ tracks: [], disabled: true });

  const q = new URL(req.url).searchParams.get('q')?.trim().slice(0, 80);
  if (!q) return NextResponse.json({ tracks: [] });

  const params = new URLSearchParams({
    part: 'snippet',
    type: 'video',
    videoCategoryId: '10',
    videoEmbeddable: 'true',
    videoSyndicated: 'true',
    maxResults: '20',
    q,
    key,
  });

  try {
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) {
      return NextResponse.json({ tracks: [], error: `YouTube menolak permintaan (${res.status})` }, { status: 502 });
    }
    const json = await res.json();
    const tracks = (json.items || [])
      .filter((i) => i.id?.videoId)
      .map((i) => {
        const { title, artist } = clean(i.snippet.title, i.snippet.channelTitle);
        const id = i.id.videoId;
        return {
          id: `yt-${id}`,
          yt: id,
          title,
          artist,
          album: 'YouTube',
          art: i.snippet.thumbnails?.medium?.url || `https://i.ytimg.com/vi/${id}/mqdefault.jpg`,
          artSm: i.snippet.thumbnails?.default?.url || i.snippet.thumbnails?.medium?.url || null,
          preview: null,
          full: true,
        };
      });
    return NextResponse.json(
      { tracks },
      { headers: { 'Cache-Control': 's-maxage=86400, stale-while-revalidate=86400' } }
    );
  } catch {
    return NextResponse.json({ tracks: [], error: 'Gagal menghubungi YouTube' }, { status: 502 });
  }
}
