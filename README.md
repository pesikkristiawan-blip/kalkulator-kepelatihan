# Kalkulator Kepelatihan Olahraga

Proyek Vite + React siap pakai. Semua kalkulasi berjalan di perangkat
pengguna (tidak ada server/backend), riwayat hasil tersimpan permanen
lewat `localStorage` browser.

## Menjalankan secara lokal

```bash
npm install
npm run dev
```

Buka `http://localhost:5173`.

## Build untuk produksi

```bash
npm run build
```

Hasil build ada di folder `dist/` — folder inilah yang di-hosting.

---

## Tahap 1 — Deploy sebagai web app

Pilih salah satu, keduanya gratis untuk skala kecil:

### Opsi A — Vercel (paling mudah)
1. Buat akun di vercel.com, hubungkan ke GitHub.
2. Push folder proyek ini ke repository GitHub.
3. Di Vercel: "Add New Project" -> pilih repo -> framework preset otomatis
   terdeteksi "Vite" -> Deploy.
4. Dapat URL seperti `kalkulator-kepelatihan.vercel.app`. Bisa dihubungkan
   ke domain sendiri nanti (mis. `kalkulatorkepelatihan.id`).

### Opsi B — Netlify
1. Buat akun di netlify.com.
2. Drag-and-drop folder `dist/` hasil `npm run build` ke Netlify, atau
   hubungkan ke repo GitHub dengan build command `npm run build` dan
   publish directory `dist`.

Ikon dasar (`icon-192.png`, `icon-512.png`) sudah disertakan — gaya "K"
di atas navy sesuai desain aplikasi. Ganti dengan logo final Anda kapan
pun siap (lihat bagian "Membuat ulang ikon" di bawah).

Halaman kebijakan privasi statis juga sudah disertakan di
`public/privacy.html` — otomatis ikut ter-deploy dan bisa diakses di
`https://domain-anda.com/privacy.html`. Lengkapi bagian bertanda
`[isi ...]` di dalamnya sebelum dipakai sebagai Privacy Policy URL di
Play Console.

---

## Tahap 2 -- Membungkus jadi aplikasi Android (untuk Play Store)

Aplikasi ini murni web app, jadi cara paling ringan masuk Play Store adalah
lewat **Trusted Web Activity (TWA)** -- Android akan menampilkan web app
Anda dalam bentuk aplikasi native tanpa perlu menulis ulang kode.

### Langkah-langkah:

1. **Pastikan web app sudah live** (Tahap 1) dengan HTTPS aktif (Vercel/
   Netlify otomatis menyediakan HTTPS).

2. **Gunakan PWABuilder** (paling mudah, berbasis web, tanpa install apa pun):
   - Buka https://www.pwabuilder.com
   - Masukkan URL web app Anda.
   - PWABuilder akan mengecek manifest.json (sudah disertakan di proyek
     ini) dan memberi skor kesiapan PWA.
   - Klik "Package for stores" -> pilih Android -> unduh file APK/AAB siap
     upload ke Play Console.

   Alternatif command-line: **Bubblewrap** (`npm i -g @bubblewrap/cli`)
   jika ingin kontrol lebih detail.

3. **Siapkan akun Google Play Developer**
   - Daftar di https://play.google.com/console
   - Biaya pendaftaran sekali: sekitar US$25.
   - Verifikasi identitas (KTP/dokumen) -- proses ini bisa makan waktu
     beberapa hari.

4. **Lengkapi listing di Play Console**
   - Judul, deskripsi singkat & lengkap, screenshot (minimal 2), ikon
     512x512, feature graphic 1024x500.
   - **Privacy Policy URL** -- wajib. Sudah disiapkan di
     `public/privacy.html` dan otomatis ikut ter-deploy bersama web app.
     Lengkapi bagian `[isi ...]` di dalamnya, lalu masukkan URL-nya
     (mis. `https://domain-anda.com/privacy.html`) di Play Console.
   - Kategori: Health & Fitness atau Education.
   - Content rating: isi kuesioner Google (aplikasi ini tidak mengandung
     konten sensitif, biasanya dapat rating "Everyone").

5. **Upload AAB/APK** dari PWABuilder ke Play Console, isi rilis internal
   testing dulu untuk uji coba sebelum rilis publik.

6. **Jika berbayar / ada in-app purchase**: gunakan Google Play Billing.
   Google memotong komisi (umumnya 15% untuk pendapatan tahunan pertama
   $1 juta, 30% di atas itu) -- cek kebijakan terbaru di Play Console.

### Estimasi waktu & biaya
- Deploy web: gratis, ~30 menit.
- Setup TWA via PWABuilder: gratis, ~1 jam.
- Akun Play Developer: US$25 sekali bayar, verifikasi 1-7 hari.
- Review Google sebelum aplikasi tayang: biasanya 1-3 hari (aplikasi baru
  bisa lebih lama).

---

## Sebelum publish -- checklist jujur

- [ ] Tinjau ikon `public/icon-192.png` / `icon-512.png` (gaya "K" dasar
      sudah dibuat) — ganti dengan logo/branding final jika Anda punya
- [ ] Isi bagian `[isi ...]` di `public/privacy.html` (tanggal, kontak,
      dan bagian analitik/iklan jika ada)
- [ ] Validasi ulang rumus VO2 maks (khususnya tabel kecepatan MFT yang
      disederhanakan), formula body fat, dan formula kalori dengan
      referensi ilmu kepelatihan yang Anda pegang
- [ ] Uji di beberapa ukuran layar HP nyata, bukan hanya browser desktop
- [ ] Pertimbangkan review dari ahli gizi/kepelatihan sebelum konten
      dianggap final untuk produk komersial
