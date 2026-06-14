# WiBite - Platform Redistribusi Makanan (Laravel)

Platform redistribusi makanan berlebih berbasis Laravel + React SPA.

## Arsitektur

- **Backend**: Laravel 12 + MySQL + Sanctum (Token-based API auth)
- **Frontend**: React 19 + Vite + Tailwind CSS 4 + React Router
- **Database**: MySQL

## Prasyarat

- PHP >= 8.2
- Composer
- MySQL
- Node.js >= 18
- npm

## Setup Backend (Laravel)

```bash
# 1. Masuk ke folder project
cd wibite-laravel

# 2. Install dependencies
composer install

# 3. Copy .env
cp .env.example .env

# 4. Generate app key
php artisan key:generate

# 5. Buat database MySQL bernama 'wibite'
# Lalu sesuaikan DB_USERNAME dan DB_PASSWORD di .env

# 6. Jalankan migration + seeder
php artisan migrate --seed

# 7. Jalankan server Laravel
php artisan serve
```

Server berjalan di `http://localhost:8000`

## Setup Frontend (React)

```bash
# 1. Masuk ke folder frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Jalankan dev server
npm run dev
```

Frontend berjalan di `http://localhost:5173`

## Akun Default (dari Seeder)

| Email | Password | Role |
|-------|----------|------|
| admin@wibite.com | password | Admin |
| budi@example.com | password | Donor |
| siti@example.com | password | Receiver |

## API Endpoints

### Public
- `GET /api/food` - Daftar makanan
- `GET /api/forum` - Daftar forum posts
- `GET /api/forum/{id}/comments` - Komentar post
- `GET /api/stats` - Statistik platform
- `POST /api/register` - Registrasi
- `POST /api/login` - Login

### Protected (Bearer Token)
- `POST /api/logout` - Logout
- `GET /api/me` - User saat ini
- `GET /api/users/profile` - Profil user
- `PUT /api/users/profile` - Update profil
- `POST /api/food` - Tambah makanan
- `PUT /api/food/{id}` - Update makanan
- `DELETE /api/food/{id}` - Hapus makanan
- `POST /api/claim` - Klaim makanan
- `POST /api/claims/complete` - Selesaikan klaim
- `POST /api/forum` - Buat post forum
- `PUT /api/forum/{id}` - Update post
- `DELETE /api/forum/{id}` - Hapus post
- `POST /api/forum/{id}/comments` - Tambah komentar
- `POST /api/feedback` - Kirim feedback

### Admin Only
- `GET /api/admin/users` - Semua users
- `DELETE /api/admin/users/{id}` - Hapus user

## Struktur Project

```
wibite-laravel/
├── app/
│   ├── Http/Controllers/    # API Controllers
│   ├── Http/Middleware/     # Admin middleware
│   └── Models/              # Eloquent models
├── database/
│   ├── migrations/          # Database schema
│   └── seeders/             # Data awal
├── routes/
│   └── api.php              # API routes
├── frontend/                # React SPA
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── lib/             # API helper & auth
│   │   └── App.tsx          # Main app
│   ├── package.json
│   └── vite.config.ts
└── .env
```
