export const fmt = (s) => {
  if (!isFinite(s) || s < 0) return '0:00';
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${String(r).padStart(2, '0')}`;
};

export const hueOf = (str = '') => {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h % 360;
};

export const greeting = () => {
  const h = new Date().getHours();
  if (h < 4) return 'Masih terjaga';
  if (h < 11) return 'Selamat pagi';
  if (h < 15) return 'Selamat siang';
  if (h < 18) return 'Selamat sore';
  return 'Selamat malam';
};

export const GENRES = [
  { name: 'Pop Indonesia', term: 'pop indonesia' },
  { name: 'Hip-hop', term: 'hip hop' },
  { name: 'Indie', term: 'indie' },
  { name: 'Rock', term: 'rock' },
  { name: 'Jazz', term: 'jazz' },
  { name: 'R&B', term: 'r&b soul' },
  { name: 'K-Pop', term: 'kpop' },
  { name: 'Dangdut', term: 'dangdut' },
  { name: 'Akustik', term: 'acoustic' },
  { name: 'Elektronik', term: 'electronic' },
  { name: 'Lo-fi', term: 'lofi' },
  { name: 'Klasik', term: 'classical piano' },
];
