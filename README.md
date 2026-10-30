# Portofolio Ilyas

Starter portofolio berbahasa Indonesia dengan React, Vite, Tailwind CSS, Motion, Node.js, dan Neon.

## Menjalankan proyek

1. Pastikan Node.js 20.19+ dan npm tersedia.
2. Pasang dependensi:

   ```bash
   npm install
   ```

3. Salin `.env.example` menjadi `.env`, lalu isi `DATABASE_URL` dari dashboard Neon.
4. Jalankan SQL di `database/schema.sql` pada Neon SQL Editor.
5. Jalankan frontend dan API:

   ```bash
   npm run dev
   ```

   Frontend berjalan di `http://localhost:5173`, API di `http://localhost:3001`. Vite meneruskan permintaan `/api` ke API lokal.

Untuk memeriksa koneksi API dan Neon, buka `http://localhost:3001/api/health`. Respons `databaseConnected: true` menandakan query tes ke Neon berhasil. Tanpa `DATABASE_URL`, halaman tetap dapat dijalankan, tetapi formulir kontak dan penyimpanan lokasi tidak tersedia.

## Deploy ke Vercel melalui GitHub

Proyek ini menyiapkan `api/[...path].js` untuk endpoint API umum dan `api/visits/location.js` khusus untuk route lokasi bertingkat yang tidak tertangani oleh catch-all pada semua deployment; Vite membangun frontend ke folder `dist`.

1. Pastikan `.env` tidak akan ikut terunggah. File ini sudah tercantum di `.gitignore`; jangan pernah menambahkan atau menempelkan `DATABASE_URL` ke kode, README, atau GitHub.
2. Buat repository baru di GitHub. Jika repository kosong, dari terminal PowerShell pada folder proyek jalankan:

   ```powershell
   git init
   git add .
   git commit -m "Prepare portfolio for deployment"
   git branch -M main
   git remote add origin https://github.com/USERNAME/NAMA-REPOSITORY.git
   git push -u origin main
   ```

   Ganti URL remote dengan URL repository GitHub milikmu. Jika Git meminta identitas, atur `git config --global user.name` dan `git config --global user.email`, lalu ulangi commit.

3. Di Vercel, pilih **Add New → Project**, hubungkan GitHub jika diminta, lalu **Import** repository tersebut.
4. Pada pengaturan build, gunakan framework **Vite** (atau **Other** jika Vite tidak terdeteksi otomatis), build command `npm run build`, dan output directory `dist`. Root directory adalah folder repository. Install command `npm install`.
5. Sebelum deploy, buka **Project → Settings → Environment Variables**. Tambahkan:

   - Key: `DATABASE_URL`
   - Value: connection string Neon yang sama dengan `.env` lokal
   - Environment: **Production** dan **Preview** (tambahkan **Development** jika ingin memakai environment Vercel lokal)

   Jangan beri awalan `VITE_`: connection string harus tetap menjadi secret server dan tidak boleh dikirim ke browser.

6. Pilih **Deploy**. Setelah berhasil, buka domain Vercel proyek dan periksa `https://DOMAIN-VERCEL/api/health`; hasilnya harus memuat `"databaseConnected": true`. Tes juga formulir komentar/kontak dan lokasi setelah memberikan izin browser.
7. Deploy berikutnya berjalan otomatis setiap kali commit di-push ke GitHub. Push ke branch production yang dipilih Vercel (umumnya `main`) memperbarui situs produksi; branch lain biasanya mendapat Preview Deployment.

Jika baru menambahkan atau mengubah `DATABASE_URL`, buat **Redeploy** agar Function memakai environment variable terbaru. Geolocation hanya tersedia di HTTPS dan tetap meminta izin pengunjung.

## Lokasi pengunjung (opsional)

Persetujuan berbagi lokasi tersedia sebagai checkbox opsional pada formulir komentar. Jika dicentang, prompt izin bawaan browser muncul saat komentar dikirim. Komentar tetap dikirim jika pengunjung menolak izin; lokasi tidak dikirim. Browser hanya mengizinkan geolocation pada HTTPS atau `localhost`; bila izin pernah diblokir sebelumnya, ubah izin lokasi situs dari pengaturan browser. Setelah izin diberikan, koordinat disimpan pada kolom `NUMERIC` tanpa pembatasan jumlah angka desimal dan backend tidak membulatkannya. Presisi lokasi sebenarnya tetap bergantung pada perangkat dan browser. IP dan user-agent tidak disimpan oleh endpoint ini.

Jalankan kembali `database/schema.sql` pada Neon SQL Editor untuk membuat tabel lokasi. Hapus baris lama sesuai kebijakan retensi dan kebutuhan privasi situs Anda.

## Komentar pembaca

Form komentar menerima nama, nomor WhatsApp, dan komentar. Pengirim harus menyetujui publikasi nama serta komentarnya. Nomor WhatsApp disimpan privat di tabel `reader_comments` untuk keperluan kontak, tetapi tidak pernah dikirim ke endpoint daftar komentar maupun ditampilkan di halaman. Komentar yang dikirim langsung muncul pada daftar publik.

## Build

```bash
npm run build
npm start
```

## Sesuaikan konten

- Ubah daftar proyek dan skill di `src/App.jsx`.
- Sesuaikan nama, email, tautan sosial, dan teks halaman di `src/App.jsx` serta metadata di `index.html`.
- Ubah warna, tipografi, dan layout di `src/index.css`.
- Simpan `DATABASE_URL` hanya di `.env`; jangan masukkan kredensial Neon ke kode frontend.
