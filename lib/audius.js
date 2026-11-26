// Katalog musik independen Audius: lagu penuh, legal, diputar langsung (streaming), tanpa disimpan.
// Dipakai di server saja. API key bersifat opsional (env AUDIUS_API_KEY).
export const AUDIUS_BASE = 'https://api.audius.co/v1';
const APP = 'EL_MUSIC';

export const authHeaders = () => {
  const h = { Accept: 'application/json' };
  if (process.env.AUDIUS_API_KEY) h['x-api-key'] = process.env.AUDIUS_API_KEY;
  return h;
};

const normalize = (t) => ({
  id: `au-${t.id}`,
  title: t.title,
  artist: t.user?.name || 'Tanpa nama',
  album: t.genre || '',
  art: t.artwork?.['480x480'] || t.artwork?.['1000x1000'] || t.artwork?.['150x150'] || null,
  preview: `/api/stream/${t.id}`,
  full: true,
  duration: t.duration || 0,
});

const playable = (t) =>
  t && t.id && t.title && t.is_streamable !== false && (t.access ? t.access.stream !== false : true);

async function getTracks(path, params) {
  const qs = new URLSearchParams({ app_name: APP, ...params });
  const res = await fetch(`${AUDIUS_BASE}${path}?${qs}`, {
    headers: authHeaders(),
    next: { revalidate: 1800 },
  });
  if (!res.ok) throw new Error(`Audius ${res.status}`);
  const json = await res.json();
  const list = Array.isArray(json.data) ? json.data : [];
  return list.filter(playable).map(normalize);
}

export const audiusTrending = (genre, limit = 20) =>
  getTracks('/tracks/trending', { limit: String(limit), time: 'week', ...(genre ? { genre } : {}) });

export const audiusSearch = (query, limit = 30) =>
  getTracks('/tracks/search', { query, limit: String(limit) });
