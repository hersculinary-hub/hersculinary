# HerS Culinary — Website Katalog + Admin + Kasir (POS)

Website lengkap untuk toko online **HerS Culinary** (frozen food & kopi pilihan), terdiri dari 3 bagian:

1. **Katalog publik** (`/`) — pelanggan bisa lihat produk per kategori/sub kategori, cari produk, pesan via WhatsApp, dan setiap produk punya halaman + tombol bagikan ke sosial media.
2. **Admin** (`/admin`) — kelola produk (tambah/edit/hapus) dan kategori/sub kategori (tambah/edit/hapus), dilindungi login.
3. **Kasir / POS** (`/pos`) — buat transaksi, hitung total otomatis, simpan sebagai invoice, dan unduh invoice dalam bentuk **PDF**. Bisa dipakai dari PC maupun HP.

Semua halaman **responsif** (otomatis menyesuaikan tampilan PC dan HP). Dibuat dengan Next.js, di-deploy lewat **GitHub + Vercel**.

---

## 1. Login default

| Username | Password |
|---|---|
| admin | hers123 |

⚠️ **Wajib diganti** lewat environment variable `ADMIN_USERNAME` / `ADMIN_PASSWORD` sebelum website dipakai untuk umum (lihat langkah 3 & 4 di bawah).

---

## 2. Upload ke GitHub

Vercel deploy langsung dari repository GitHub — bukan dari file zip. Jadi:

1. **Ekstrak dulu** file zip project ini di komputer kamu (klik kanan → Extract All di Windows, atau double-click di Mac). Jangan upload file `.zip`-nya langsung ke GitHub.
2. Buat repository baru di [github.com](https://github.com) (klik **New** → kasih nama, misal `hers-culinary`).
3. Di halaman repo yang masih kosong, klik **uploading an existing file** (atau **Add file → Upload files**).
4. Buka folder hasil ekstrak tadi → **select semua isinya** (folder `app`, `components`, `lib`, `public`, file `package.json`, dll — jangan folder pembungkusnya, tapi isinya langsung).
5. Drag semua file itu ke kotak upload GitHub, lalu klik **Commit changes**.
6. Pastikan hasilnya: halaman utama repo langsung menampilkan folder `app`, `components`, `lib`, dll — **bukan** satu file zip.

---

## 3. Deploy ke Vercel

1. Buka [vercel.com](https://vercel.com) → login (bisa pakai akun GitHub) → **Add New...** → **Project**.
2. Pilih repository yang baru dibuat tadi → **Import**.
3. Kasih **nama project** yang belum pernah dipakai di akun kamu (kalau ada tulisan "Project already exists", ganti namanya).
4. Klik **Deploy**. (Boleh gagal di percobaan pertama karena environment variable belum diisi — lanjut ke langkah berikut.)
5. Buka **Project → Settings → Environment Variables**, tambahkan:

   | Key | Value |
   |---|---|
   | `ADMIN_USERNAME` | username pilihanmu |
   | `ADMIN_PASSWORD` | password pilihanmu (yang kuat) |
   | `AUTH_SECRET` | teks acak panjang, bebas (misal hasil generate dari [randomkeygen.com](https://randomkeygen.com)) |

6. **Wajib**: tambahkan database supaya data produk/kategori/invoice tersimpan **permanen dan sama untuk semua orang** (PC, HP admin, HP pelanggan) — lihat langkah 4 di bawah, ini bagian paling penting.
7. Setelah environment variable & database terpasang, buka tab **Deployments** → klik **"..."** pada deployment terakhir → **Redeploy**.
8. Selesai! Website bisa diakses dari PC maupun HP di domain yang diberikan Vercel.

---

## 4. Menyambungkan database (WAJIB — supaya data tidak hilang/beda-beda tiap device)

Tanpa langkah ini, produk yang diinput dari satu HP/PC bisa jadi tidak muncul di device lain — karena server Vercel bersifat sementara dan tidak berbagi penyimpanan file secara otomatis.

1. Buka project di dashboard Vercel → tab **Storage**.
2. Klik **Create Database** → pilih **KV** (nama teknisnya Upstash Redis, ditenagai oleh Upstash) → pilih region terdekat → **Create**.
3. Setelah dibuat, klik **Connect Project** → pilih project `hers-culinary` kamu → **Connect**. Vercel otomatis menambahkan `KV_REST_API_URL` dan `KV_REST_API_TOKEN` ke Environment Variables — tidak perlu isi manual.
4. Buka tab **Deployments** → **Redeploy** supaya perubahan ini terpakai.

Setelah ini, semua device (PC, HP admin, HP pelanggan) akan melihat data yang sama, karena semuanya membaca dari database yang sama.

---

## 5. Menjalankan di komputer sendiri (opsional, untuk uji coba sebelum deploy)

Butuh [Node.js](https://nodejs.org) versi 18 ke atas.

```bash
npm install
cp .env.example .env.local
# buka .env.local, isi ADMIN_USERNAME, ADMIN_PASSWORD, AUTH_SECRET bebas (string acak)
npm run dev
```

Buka `http://localhost:3000` untuk katalog, `http://localhost:3000/admin` untuk admin, `http://localhost:3000/pos` untuk kasir.

Saat dijalankan lokal tanpa database, data disimpan sementara di file `.data/db.json` — cukup untuk uji coba, tapi **tidak dipakai saat online di Vercel** (harus lewat langkah 4 di atas).

---

## 6. Menyambungkan penyimpanan foto (WAJIB — supaya admin bisa upload foto langsung dari HP/komputer)

Form tambah/edit produk sekarang punya tombol **"Pilih Foto dari HP/Komputer"** — admin tinggal pilih file foto, tidak perlu tempel link lagi. Ini butuh satu database tambahan bernama **Blob**, disambungkan dengan cara yang sama seperti waktu menyambungkan database KV di langkah 4:

1. Buka project di dashboard Vercel → tab **Storage**.
2. Klik **Create Database** (atau **Browse Marketplace**) → cari **Blob** → pilih paket **Free/Hobby**.
3. Setelah dibuat, klik **Connect to Project** → pilih project ini → **Connect**. Vercel otomatis menambahkan `BLOB_READ_WRITE_TOKEN` ke Environment Variables.
4. Buka tab **Deployments** → **Redeploy**.

Kalau langkah ini belum dilakukan, tombol upload foto akan menampilkan pesan error yang mengarahkan ke langkah di atas — sementara itu, admin masih bisa memakai opsi cadangan **"Atau, tempel URL gambar secara manual"** yang muncul di bawah tombol upload (misalnya upload dulu ke [imgur.com](https://imgur.com), lalu tempel link gambarnya).

---

## 7. Fitur per halaman

### Katalog (`/`)
- Banner utama pakai gambar promosi yang kamu kirim (`public/banner.png`) — bisa diganti kapan saja dengan mengganti file itu.
- Filter kategori & sub kategori, kolom pencarian produk.
- Tombol **Pesan via WhatsApp** otomatis mengisi pesan dengan nama & harga produk.
- Tombol **Bagikan** di tiap produk → WhatsApp, Facebook, X (Twitter), dan salin tautan.
- Halaman detail produk (`/produk/[id]`) sebagai tautan yang dibagikan ke sosial media.

### Admin (`/admin`)
- **Produk**: tabel semua produk, tombol tambah/edit/hapus, serta tombol bagikan langsung dari daftar.
- **Kategori**: tambah/edit/hapus kategori, dan di dalam tiap kategori bisa tambah/edit/hapus sub kategori.

### Kasir / POS (`/pos`)
- Pilih produk dari katalog (dengan pencarian), atur jumlah, beri diskon, pilih metode pembayaran.
- Nomor invoice dibuat otomatis (format `HC-YYYYMMDD-0001`).
- Klik **Buat & Unduh Invoice (PDF)** → invoice tersimpan dan file PDF langsung terunduh, bisa dibuka/print dari PC maupun HP.

---

## 8. Struktur folder singkat

```
app/                    → semua halaman (Next.js App Router)
  page.js               → katalog publik
  produk/[id]/page.js   → halaman detail produk (untuk dibagikan)
  admin/                → semua halaman admin (dilindungi login)
  pos/page.js            → halaman kasir
  api/                  → backend (categories, products, invoices, auth)
components/             → komponen UI yang dipakai berulang
lib/                    → logika data (categories.js, products.js, invoices.js),
                          auth.js (login), store.js (penyimpanan data), pdfInvoice.js (pembuat PDF)
public/banner.png       → gambar banner di halaman utama
```

---

## 9. Catatan keamanan

- Ganti `ADMIN_PASSWORD` dan `AUTH_SECRET` sebelum website dipakai untuk transaksi sungguhan.
- Halaman `/admin/*` dan `/pos/*` otomatis diarahkan ke halaman login kalau belum masuk.
- Saat ini hanya ada satu akun admin (dipakai bersama untuk admin & kasir). Kalau butuh banyak akun kasir dengan hak akses berbeda, beri tahu saya — bisa ditambahkan.

---

## 10. Kalau produk sempat "hilang" lalu muncul lagi

Halaman katalog dan API produk/kategori sudah diatur supaya **tidak pernah menyimpan cache** (`revalidate = 0`, `Cache-Control: no-store`) — jadi setiap kali halaman dibuka, datanya selalu diambil langsung dari database, bukan dari salinan lama. Kalau gejala ini masih muncul setelah update terbaru:

- Pastikan sudah **redeploy** setelah update file ini (lihat langkah 3 poin 7).
- Coba **hard refresh** di browser (Ctrl+Shift+R di PC, atau tutup-buka tab di HP) untuk pastikan bukan cache di browser itu sendiri.
- Kalau masih terjadi, kemungkinan ada 2 orang menyimpan produk di waktu yang nyaris bersamaan — beri tahu saya kalau ini masih terjadi, bisa ditambahkan penguncian data (locking) supaya lebih aman.
