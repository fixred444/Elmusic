// Dipakai di server (route handler) saja.
const normalize = (r) => ({
  id: String(r.trackId),
  title: r.trackName,
  artist: r.artistName,
  album: r.collectionName || '',
  art: r.artworkUrl100 ? r.artworkUrl100.replace('100x100bb', '600x600bb') : null,
  preview: r.previewUrl,
  year: r.releaseDate ? r.releaseDate.slice(0, 4) : '',
});

export async function searchTracks(term, limit = 30) {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&entity=song&limit=${limit}&country=ID`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`iTunes ${res.status}`);
  const data = await res.json();
  const seen = new Set();
  const out = [];
  for (const r of data.results || []) {
    if (r.kind !== 'song' || !r.previewUrl) continue;
    const key = `${r.trackName}|${r.artistName}`.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(normalize(r));
  }
  return out;
}
