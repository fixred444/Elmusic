# El Music

Pemutar musik web dengan desain liquid glass. Dibangun dengan Next.js (App Router).

- Cuplikan lagu (30 detik) dan sampul album dari iTunes Search API, tanpa API key.
- Putar file musik milik sendiri lewat tombol "Dari perangkat".
- Lagu disukai, playlist, dan riwayat tersimpan di browser (localStorage).

## Deploy ke Vercel lewat GitHub

1. Buat repository baru di GitHub, lalu upload semua isi folder ini (bukan folder pembungkusnya).
2. Buka vercel.com, pilih Add New > Project, lalu import repository tersebut.
3. Framework otomatis terdeteksi sebagai Next.js. Tidak ada environment variable. Klik Deploy.

## Jalankan lokal

```
npm install
npm run dev
```
