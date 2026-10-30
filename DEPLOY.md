# Deploy ke Server aaPanel

Panduan menjalankan Sunnah Aqiqah di VPS yang dikelola **aaPanel** memakai fitur **Node project**: aaPanel menjalankan aplikasi Next.js (`next start`), membuat reverse proxy Nginx ke port aplikasi, dan mengurus SSL. Database memakai **MariaDB** (MySQL 8 juga bisa; langkahnya sama).

```
Internet ──HTTPS──▶ Nginx (aaPanel, SSL) ──HTTP──▶ 127.0.0.1:3000 (Node project: next start) ──▶ MariaDB
```

Contoh di panduan ini memakai:

| Item | Nilai contoh (ganti sesuai server) |
|---|---|
| Domain | `sunnahaqiqah.com` |
| Folder aplikasi | `/www/wwwroot/sunnahaqiqah.com` |
| Folder upload | `/www/wwwroot/sunnah-data/uploads` |
| Port aplikasi | `3000` |
| Database / user | `sunnah_aqiqah` / `sunnah` |

## 1. Kebutuhan server

- VPS Linux 64-bit (Ubuntu 22.04/24.04 atau Debian 12 disarankan), **RAM minimal 2 GB**. `next build` cukup boros memori; bila RAM 1–2 GB, tambahkan swap (lihat [Masalah umum](#10-masalah-umum)).
- aaPanel sudah terpasang dan domain sudah diarahkan (record A) ke IP server.

## 2. Pasang software dari App Store aaPanel

Buka **App Store** lalu install:

1. **Nginx** (versi stabil terbaru).
2. **MariaDB 10.11** (atau 10.6 ke atas). Versi lebih lama dari 10.2 tidak mendukung default kolom `(now())` yang dipakai migrasi, jadi migrasi akan gagal.

   Aplikasi memakai driver MySQL (`mysql2` + Drizzle dialect `mysql`), yang kompatibel dengan MariaDB — tidak perlu mengubah kode.
3. **Node.js version manager** — lalu dari menu pengaturannya pasang **Node.js 22 LTS** (atau 20 LTS).

## 3. Buat database

**Databases → Add database**:

- Database name: `sunnah_aqiqah`
- Username: `sunnah`
- Password: buat yang kuat (catat — dipakai di `DATABASE_URL`)
- Access permission: **Local server** (aplikasi berjalan di server yang sama)
- Charset: **utf8mb4**

`DATABASE_URL` tetap memakai skema `mysql://` walau servernya MariaDB.

Password yang mengandung karakter khusus (`@ : / # ? %`) harus di-*URL-encode* di `DATABASE_URL` (mis. `@` → `%40`). Paling aman: buat password hanya huruf + angka.

## 4. Buat website Node.js Project

Form Node project membaca `package.json` dari folder proyek untuk mengisi pilihan perintah jalan, jadi **kode harus sudah ada di folder** sebelum form diisi.

### 4.1 Siapkan folder & kode

Buka **Terminal** aaPanel (atau SSH sebagai root). Pilih salah satu cara:

**A. Lewat Git (disarankan, memudahkan update):**

```bash
git clone <url-repo> /www/wwwroot/sunnahaqiqah.com
```

**B. Upload manual:** kompres proyek di komputer lokal **tanpa** `node_modules`, `.next`, `storage`, dan file `.env*`, lalu buat folder `/www/wwwroot/sunnahaqiqah.com` lewat **Files** aaPanel, unggah zip-nya ke sana, dan ekstrak.

```bash
# di komputer lokal
zip -r sunnah-aqiqah.zip . -x "node_modules/*" ".next/*" "storage/*" ".env*" ".git/*"
```

### 4.2 Isi form Node project

**Website → Node project → Add Node project**:

| Kolom | Isi |
|---|---|
| Project directory | `/www/wwwroot/sunnahaqiqah.com` |
| Project name | `sunnah-aqiqah` |
| Startup option / Run command | pilih script **`start`** (`next start`) |
| Project port | `3000` (port bawaan `next start`) |
| Run user | `www` |
| Node version | versi yang dipasang di langkah 2 (v22.x / v20.x) |
| Package manager | **pnpm** (bila tidak tersedia, pilih npm — install tetap dijalankan manual di langkah 6) |
| Bind domain | `sunnahaqiqah.com` (dan `www.sunnahaqiqah.com` bila perlu) |

Klik **Confirm/Submit**. aaPanel otomatis membuat situs Nginx yang mem-proxy domain ke `127.0.0.1:3000`.

**Jangan start proyek dulu** — bila aaPanel langsung menjalankannya, biarkan gagal/stop. Aplikasi baru bisa jalan setelah `.env` diisi dan `pnpm build` selesai (langkah 5–6).

## 5. File `.env` & folder upload

Semua perintah di bawah dijalankan di Terminal aaPanel sebagai root, di folder proyek. Pakai Node **versi yang sama** dengan yang dipilih di Node project:

```bash
cd /www/wwwroot/sunnahaqiqah.com
export PATH=/www/server/nodejs/v22.12.0/bin:$PATH   # sesuaikan dengan versi di /www/server/nodejs/
node -v                                             # harus sama dengan versi di Node project
corepack enable                                     # mengaktifkan pnpm 9 sesuai "packageManager" di package.json
pnpm -v
```

> Agar tidak perlu mengetik `export PATH` setiap kali, tambahkan baris tersebut ke `~/.bashrc`.

Buat **`.env`** (dibaca oleh Next.js, `drizzle-kit`, dan `scripts/seed.ts`):

```bash
cp .env.example .env
openssl rand -base64 32       # salin hasilnya untuk SESSION_SECRET
nano .env
```

Isi minimal:

```dotenv
DATABASE_URL="mysql://sunnah:PASSWORD_DB@127.0.0.1:3306/sunnah_aqiqah"
SESSION_SECRET="hasil-openssl-rand-di-atas"
ADMIN_EMAIL="admin@sunnahaqiqah.com"
ADMIN_PASSWORD="password-admin-yang-kuat"

# Simpan upload di luar folder aplikasi agar aman saat deploy ulang
UPLOAD_DIR="/www/wwwroot/sunnah-data/uploads"

# Opsional: WhatsApp Gateway (kosongkan bila tidak dipakai)
WA_GATEWAY_URL="https://wag.homeitop.web.id"
WA_API_KEY=""
WA_SENDER=""
```

Buat folder upload:

```bash
mkdir -p /www/wwwroot/sunnah-data/uploads
```

> Setelah akun admin dibuat (langkah 6), `ADMIN_PASSWORD` boleh dikosongkan lagi dari `.env`.

## 6. Install, migrasi, build

```bash
cd /www/wwwroot/sunnahaqiqah.com
pnpm install --frozen-lockfile   # dependensi dev juga dibutuhkan (drizzle-kit, tsx, TypeScript) — jangan pakai --prod
pnpm db:migrate                  # membuat tabel dari folder drizzle/
pnpm db:seed                     # data awal + akun admin; aman diulang
pnpm build
```

**Build membutuhkan database yang aktif** karena halaman utama diprerender saat build. Jika build gagal dengan error koneksi database, periksa `DATABASE_URL` dan pastikan migrasi berhasil.

Karena perintah di atas dijalankan sebagai root sedangkan proyek berjalan sebagai user `www`, serahkan kepemilikan file ke `www`:

```bash
chown -R www:www /www/wwwroot/sunnahaqiqah.com /www/wwwroot/sunnah-data
chmod 600 /www/wwwroot/sunnahaqiqah.com/.env
```

Tanpa langkah ini aplikasi gagal menulis cache di `.next/` dan gagal menyimpan upload logo/slider.

## 7. Jalankan proyek

Kembali ke **Website → Node project**, klik **Start** pada `sunnah-aqiqah`. Status harus **Running**.

Cek dari terminal:

```bash
curl -I http://127.0.0.1:3000    # harus HTTP 200
```

Log aplikasi bisa dilihat dari tombol **Log** di baris proyek. Restart/stop juga dari sana.

> **Jalankan satu instance saja** (jangan aktifkan mode cluster bila tersedia). Cache halaman utama dan `updateTag("content")` disimpan per proses; dengan banyak instance, perubahan dari panel admin hanya terlihat di sebagian request.

## 8. SSL & konfigurasi Nginx

### 8.1 SSL

Di baris proyek, buka **Settings/Config → SSL → Let's Encrypt** → centang domain → Apply. Lalu aktifkan **Force HTTPS**.

HTTPS wajib: cookie login admin bertanda `Secure` di production, sehingga login **tidak akan berhasil lewat HTTP biasa**.

### 8.2 Sesuaikan konfigurasi Nginx

Buka **Settings → Config file** (konfigurasi Nginx yang dibuat aaPanel untuk proyek ini). Di dalam blok `server { ... }`, pastikan ada:

```nginx
    # Upload logo/slider dari admin bisa sampai 5 MB (+ overhead form)
    client_max_body_size 8m;
```

dan di dalam blok `location /` yang berisi `proxy_pass http://127.0.0.1:3000;`, tambahkan (bila belum ada):

```nginx
        proxy_set_header X-Forwarded-Proto $scheme;

        # Wajib untuk streaming (Cache Components / Suspense)
        proxy_buffering off;
        proxy_cache off;
```

Bila di file itu ada blok bawaan yang menangkap file statis, **beri komentar** — blok ini mencari `/_next/static/*.js`, `.css`, dan gambar di folder root lalu menghasilkan 404:

```nginx
    # location ~ .*\.(gif|jpg|jpeg|png|bmp|swf)$ { ... }
    # location ~ .*\.(js|css)?$ { ... }
```

Biarkan blok `location ~ \.well-known` (dipakai Let's Encrypt) dan blok yang memblokir file sensitif (`.user.ini`, `.git`, `.env`, dll.).

Simpan, lalu cek: `nginx -t && nginx -s reload`.

### 8.3 Firewall

Di **Security**, pastikan port **80** dan **443** terbuka. Port **3000** dan **3306** **jangan** dibuka ke publik.

## 9. Uji coba

1. Buka `https://sunnahaqiqah.com` — halaman utama tampil lengkap dengan CSS & gambar.
2. Buka `https://sunnahaqiqah.com/admin` — login dengan akun dari `.env`.
3. Di **Pengaturan**, coba unggah logo — memastikan izin folder upload & batas ukuran Nginx sudah benar.
4. Kirim satu pesanan uji dari formulir publik, lalu cek di **Pesanan**.

## 10. Masalah umum

| Gejala | Penyebab & solusi |
|---|---|
| `pnpm build` mati dengan `Killed` / `JavaScript heap out of memory` | RAM kurang. Tambah swap: `fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile && echo '/swapfile none swap sw 0 0' >> /etc/fstab` |
| Build gagal `ECONNREFUSED` | MariaDB mati (cek di **App Store → MariaDB**) atau port di `DATABASE_URL` salah |
| `Access denied for user 'sunnah'@'127.0.0.1'` | Password salah/berisi karakter khusus yang belum di-encode, **atau** user hanya dibuat untuk host `localhost` (dengan `skip-name-resolve`, koneksi TCP ke `127.0.0.1` tidak cocok dengan `localhost`). Tambahkan user untuk `127.0.0.1`: `mysql -u root -p -e "CREATE USER 'sunnah'@'127.0.0.1' IDENTIFIED BY 'PASSWORD_DB'; GRANT ALL ON sunnah_aqiqah.* TO 'sunnah'@'127.0.0.1';"` |
| Migrasi gagal di `DEFAULT (now())` (syntax error) | Versi MariaDB terlalu lama. Cek `mysql -V`; pakai 10.6+ |
| Proyek langsung berhenti setelah Start | Belum `pnpm build`, atau `.env` belum ada. Lihat **Log** proyek |
| 502 Bad Gateway | Aplikasi tidak jalan atau port di Node project ≠ 3000. Cek status & log proyek |
| `EACCES: permission denied` di log (`.next/cache` atau folder upload) | Jalankan ulang `chown -R www:www ...` dari langkah 6 |
| Halaman tampil tanpa CSS/JS (404 di `/_next/static`) | Blok `location ~ .*\.(js|css)` di config Nginx belum dinonaktifkan (langkah 8.2) |
| Login admin kembali ke halaman login terus | Situs diakses lewat HTTP, atau `SESSION_SECRET` kosong/berubah. Aktifkan HTTPS dan isi `SESSION_SECRET` |
| Upload logo/slider gagal `413 Request Entity Too Large` | `client_max_body_size` belum diset di Nginx |
| Error `sharp` saat upload | Jalankan ulang `pnpm install` di server (jangan menyalin `node_modules` dari komputer/OS lain), lalu `pnpm build` |
| Versi Node di terminal berbeda dengan Node project | Atur `PATH` ke folder Node yang sama (langkah 5), lalu `pnpm install` & `pnpm build` ulang |
| Perubahan langsung di database tidak muncul | Normal — halaman utama di-cache. Simpan apa saja dari panel admin atau restart proyek |
| Notifikasi WA tidak terkirim | Cek `WA_*` di `.env`, lalu **Pengaturan → WhatsApp Gateway** (status perangkat, kirim tes, log pesan). Setelah ubah `.env`, restart proyek |

## 11. Update aplikasi (deploy ulang)

```bash
cd /www/wwwroot/sunnahaqiqah.com
git pull                          # atau upload & timpa file kode (jangan timpa .env)
pnpm install --frozen-lockfile
pnpm db:migrate                   # bila ada migrasi baru di drizzle/
pnpm build
chown -R www:www /www/wwwroot/sunnahaqiqah.com
```

Lalu **Restart** proyek dari **Website → Node project**. Jika build gagal, **jangan** restart — perbaiki dulu error-nya.

Setelah mengubah `.env`, cukup restart proyek (kecuali `DATABASE_URL` berubah, sebaiknya build ulang juga).

## 12. Backup

Yang perlu dibackup rutin:

1. **Database `sunnah_aqiqah`** — **Cron → Add task → Backup database**, jadwalkan harian.
2. **Folder upload** (`/www/wwwroot/sunnah-data/uploads`) — **Cron → Backup directory**. Berisi logo, favicon, dan gambar slider yang diunggah admin; tidak ada di Git.
3. **File `.env`** — simpan salinannya di tempat aman (password manager), jangan di repo.
