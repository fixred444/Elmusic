// Data beranda: dipakai bersama oleh layar Welcome dan Beranda.
// Disimpan di perangkat supaya aplikasi langsung menampilkan isi saat dibuka,
// lalu diperbarui diam-diam di belakang.
const KEY = 'elmusic:home:v1';
let inflight = null;

export function readHomeCache() {
  try {
    const d = JSON.parse(localStorage.getItem(KEY) || 'null');
    return d && d.shelves && d.shelves.length ? d : null;
  } catch {
    return null;
  }
}

export function fetchHome() {
  if (inflight) return inflight;
  inflight = fetch('/api/home')
    .then((r) => r.json())
    .then((d) => {
      if (d && d.shelves && d.shelves.length) {
        try { localStorage.setItem(KEY, JSON.stringify(d)); } catch {}
      }
      return d;
    })
    .finally(() => { setTimeout(() => { inflight = null; }, 3000); });
  return inflight;
}
