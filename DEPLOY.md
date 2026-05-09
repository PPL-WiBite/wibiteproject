# Deploy WiBite ke Render (Free Tier)

Monolith deploy: Laravel backend + React frontend dibangun dalam 1 Docker image, jalan di 1 service Render.

## Prasyarat

1. Account Render gratis → [render.com](https://render.com) (daftar pakai GitHub)
2. Project sudah di GitHub (private repo tidak masalah, Render bisa akses)

## Langkah Deploy

### 1. Push project ke GitHub

```bash
cd wibite-laravel
git init
git add .
git commit -m "Initial WiBite Laravel"
git branch -M main
git remote add origin https://github.com/PPL-WiBite/wibiteproject.git  
git push -u origin main
```

### 2. Buat Web Service di Render

Ada **2 cara**:

#### Cara A: Pakai Blueprint (paling cepat, otomatis)

1. Di dashboard Render, klik **"New +"** → **"Blueprint"**
2. Connect repo GitHub kamu
3. Render auto-detect `render.yaml` dan preview konfigurasi
4. Klik **"Apply"**
5. Tunggu build selesai (~3-5 menit pertama kali, Docker caching)

#### Cara B: Manual Web Service

1. Klik **"New +"** → **"Web Service"**
2. Connect repo GitHub
3. Isi form:
   - **Name**: `wibite` (atau nama lain)
   - **Region**: Singapore (paling dekat Indonesia)
   - **Branch**: `main`
   - **Runtime**: `Docker`
   - **Plan**: `Free`
4. **Environment Variables** (klik "Advanced"):
   ```
   APP_NAME=WiBite
   APP_ENV=production
   APP_DEBUG=false
   APP_KEY=                          ← klik "Generate" di Render
   LOG_CHANNEL=stderr
   LOG_LEVEL=error
   DB_CONNECTION=sqlite
   DB_DATABASE=/var/www/html/database/database.sqlite
   SESSION_DRIVER=database
   CACHE_STORE=database
   QUEUE_CONNECTION=database
   ```
5. Klik **"Create Web Service"**

### 3. Tunggu deployment

Render akan:
- Clone repo
- Build Docker image (install PHP + Node + Composer + NPM deps + build React)
- Start container
- Kasih URL publik `https://wibite-xxxx.onrender.com`

Deploy pertama biasanya ~5 menit. Deploy berikutnya lebih cepat karena Docker layer caching.

### 4. Akses aplikasi

Buka URL Render yang diberikan. Login dengan akun default dari seeder:

| Email | Password | Role |
|-------|----------|------|
| admin@wibite.com | password | Admin |
| budi@example.com | password | Donor |
| siti@example.com | password | Receiver |

## Catatan Free Tier Render

- **Spin down 15 menit** tanpa traffic → saat user pertama mengakses, loading ~30-60 detik
- 750 instance hours/bulan (cukup 1 app 24/7)
- SQLite data **tidak persisten** saat container restart di free tier. Untuk data permanen, harus upgrade ke paid plan + persistent disk, atau pakai database service terpisah (PostgreSQL free 30 hari).
- Kalau perlu data permanen: setelah deploy pertama, setiap restart akan re-seed data default (admin/donor/receiver akun akan ada lagi).

## Update Aplikasi

Tinggal push ke GitHub:

```bash
git add .
git commit -m "fitur baru"
git push
```

Render auto-deploy dari branch `main` setiap ada commit baru.

## Troubleshooting

### "502 Bad Gateway" setelah deploy selesai
Apache belum siap. Tunggu 30-60 detik lagi. Cek logs di Render dashboard → Logs tab.

### Build gagal di "composer install"
Cek `composer.lock` di-commit. Kalau nggak ada, jalankan `composer install` lokal dulu.

### Build gagal di "npm run build"
Cek `frontend/package-lock.json` di-commit. Kalau nggak ada, `cd frontend && npm install` lokal dulu, commit, push.

### Login sukses tapi redirect stuck / 419 CSRF error
Pastikan `APP_KEY` sudah di-set (generate value di Render env vars).

### Database tidak di-seed
Cek logs, biasanya karena path SQLite salah. Pastikan `DB_DATABASE=/var/www/html/database/database.sqlite` (absolute path).

### Mau reset database
Render dashboard → Settings → "Clear build cache & deploy" (ini restart fresh container).

## Cara testing Docker build lokal (opsional)

Kalau install Docker Desktop:

```bash
# Build image
docker build -t wibite .

# Run
docker run -p 10000:10000 \
  -e APP_KEY=$(php artisan key:generate --show) \
  -e APP_ENV=local \
  wibite

# Buka http://localhost:10000
```

## Upgrade ke Custom Domain (opsional)

Di Render dashboard → Settings → Custom Domain:
1. Tambah domain kamu (misal `wibite.yourdomain.com`)
2. Tambahkan CNAME record di DNS provider domain kamu → point ke URL Render
3. SSL auto-provision via Let's Encrypt (free)
