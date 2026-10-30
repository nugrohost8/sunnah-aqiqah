# Sunnah Aqiqah

Website company profile + panel admin untuk layanan aqiqah **Sunnah Aqiqah** (Bandung & Cimahi).

- **Situs publik** (`/`): paket aqiqah plus masak / tanpa masak, nasi box, bundling box, testimoni, FAQ, partner, dan formulir pemesanan yang tersimpan ke database lalu diteruskan ke WhatsApp admin.
- **Panel admin** (`/admin`): login, dashboard, daftar pesanan + status, kelola paket & harga, nasi box, bundling, testimoni, FAQ, partner, serta **Pengaturan Umum** (identitas usaha, nomor WhatsApp admin, Instagram, rekening, SEO).

## Stack

| Bagian | Teknologi |
|---|---|
| Framework | Next.js 16 (App Router, Cache Components, Server Actions), React 19, TypeScript |
| Database | MySQL 8 atau MariaDB 10.6+ lewat Drizzle ORM (`mysql2`) |
| Auth admin | Cookie sesi JWT (`jose`) + password `bcryptjs` |
| Validasi | Zod |
| Styling | CSS biasa (`src/app/(site)/site.css`, `src/app/(admin)/admin.css`), font via `next/font` |

> Next.js 16 berbeda dari versi sebelumnya (mis. `middleware` → `proxy.ts`, `"use cache"`). Baca dokumentasi di `node_modules/next/dist/docs/` sebelum mengubah pola data/caching — lihat juga `AGENTS.md`.

## Menjalankan secara lokal

Butuh Node.js 20+, pnpm, dan MySQL 8.

```bash
pnpm install

# 1. Buat database & user MySQL (sekali saja)
mysql -u root -p -e "
  CREATE DATABASE sunnah_aqiqah CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  CREATE USER 'sunnah'@'localhost' IDENTIFIED BY 'ganti-password';
  GRANT ALL ON sunnah_aqiqah.* TO 'sunnah'@'localhost';"

# 2. Konfigurasi
cp .env.example .env.local     # lalu isi DATABASE_URL, SESSION_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD

# 3. Buat tabel & isi data awal (harga, menu, testimoni, FAQ, partner, akun admin)
pnpm db:migrate
pnpm db:seed

# 4. Jalankan
pnpm dev                       # http://localhost:3000 dan http://localhost:3000/admin
```

## Deploy

Panduan deploy ke VPS dengan aaPanel (Nginx + MariaDB + Node project): lihat [DEPLOY.md](DEPLOY.md).

## Skrip

| Perintah | Fungsi |
|---|---|
| `pnpm dev` / `pnpm build` / `pnpm start` | Development, build produksi, jalankan hasil build |
| `pnpm lint` / `pnpm typecheck` | ESLint / TypeScript |
| `pnpm db:generate` | Buat file migrasi baru setelah mengubah `src/db/schema.ts` |
| `pnpm db:migrate` | Terapkan migrasi ke database |
| `pnpm db:seed` | Isi data awal; aman diulang (tabel yang sudah berisi dilewati) |
| `pnpm db:studio` | Drizzle Studio untuk melihat isi database |

## Struktur

```
src/
  app/
    (site)/            # root layout situs publik: page.tsx, actions.ts (simpan pesanan), site.css
    (admin)/           # root layout admin: admin.css
      admin/
        actions.ts     # login/logout + semua server action CRUD admin
        login/
        (panel)/       # halaman yang butuh login: dashboard, pesanan, paket, nasi-box, bundling, testimoni, faq, partner, pengaturan
  components/
    site/              # bagian-bagian halaman publik
    admin/             # Sidebar, CrudTable (tabel edit generik), SettingsForm, tombol
  db/                  # schema.ts (Drizzle) + koneksi
  lib/
    content.ts         # getHomeContent(): data halaman utama, di-cache ("use cache" + tag "content")
    dal.ts             # requireAdmin(): cek sesi + user di DB
    jwt.ts, session.ts # token & cookie sesi
    settings-schema.ts # daftar kunci Pengaturan Umum + validasi + nilai bawaan
    settings.ts        # getSiteSettings(): pengaturan dari tabel site_settings, di-cache (tag "content")
  proxy.ts             # redirect awal /admin/* → /admin/login bila belum login
scripts/seed.ts        # data awal dari situs lama
drizzle/               # file migrasi SQL
mockup/                # mockup HTML statis + PNG (referensi desain)
```

## Catatan penting

- **Caching halaman utama.** Halaman `/` diprerender dan di-cache (revalidasi harian). Setiap simpan/hapus dari panel admin memanggil `updateTag("content")`, jadi perubahan langsung tampil. **Jika data diubah langsung di database** (SQL / Drizzle Studio), situs baru menampilkannya setelah cache kedaluwarsa atau setelah ada perubahan apa pun dari panel admin.
- **Build butuh database.** Karena halaman utama diprerender saat `pnpm build`, `DATABASE_URL` harus bisa diakses ketika build.
- **Keamanan admin.** `proxy.ts` hanya pemeriksaan awal. Otorisasi sebenarnya ada di `requireAdmin()` yang dipanggil di setiap halaman dan server action admin — tetap pertahankan pola ini saat menambah fitur.
- **Menambah admin / ganti password.** Belum ada UI-nya. Ganti `ADMIN_EMAIL`/`ADMIN_PASSWORD` di `.env.local` lalu jalankan `pnpm db:seed` untuk membuat admin baru (admin dengan email yang sudah ada tidak diubah).
- **Logo, favicon, dan gambar slider** yang diunggah admin disimpan di `storage/uploads` (bisa diganti lewat env `UPLOAD_DIR`) dan disajikan oleh route `/uploads/[file]`. Folder ini berisi data, bukan kode: ikutkan dalam backup dan jangan dihapus saat deploy ulang.
- **Pengaturan Umum** disimpan di tabel `site_settings`. Selama belum pernah disimpan dari admin, situs memakai nilai bawaan di `src/lib/settings-schema.ts`. Untuk menambah pengaturan baru: tambahkan kuncinya di `settingsSchema`, lalu kolomnya di `SettingsForm` — tidak perlu migrasi.
- **WhatsApp Gateway.** Bila `WA_GATEWAY_URL`, `WA_API_KEY`, `WA_SENDER` diisi, setiap pesanan baru otomatis dikirim ke semua nomor admin dan konfirmasinya ke pelanggan. Pelanggan juga dikabari saat status pesanan diubah. Semua pesan dikirim lewat `after()` (`src/lib/wa-notify.ts`), jadi gateway yang gagal atau lambat tidak menggagalkan pesanan. Tautan `wa.me` tetap ada sebagai cadangan. Saklar dan template pesan diatur di **Pengaturan → WhatsApp Gateway**; halaman itu juga menampilkan status perangkat, tombol kirim tes, dan log pesan (tabel `wa_messages`). Pesan yang gagal bisa dikirim ulang dari halaman Pesanan. Konfirmasi ke pelanggan dibatasi sekali per nomor per 30 menit dan 30 pesan per jam agar formulir publik tidak dipakai untuk spam.
- **Logo partner** diisi path file di `public/` atau URL gambar; upload file belum tersedia.
