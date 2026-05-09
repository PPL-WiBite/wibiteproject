// Script ini pindahkan hasil vite build ke public/ Laravel tanpa menghapus
// file bawaan Laravel seperti index.php, .htaccess, dll.
//
// Usage: node scripts/copy-to-laravel.mjs

import { existsSync, cpSync, readdirSync, statSync, rmSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const frontendRoot = resolve(__dirname, '..');
const distDir = join(frontendRoot, 'dist');
const laravelPublic = resolve(frontendRoot, '..', 'public');

if (!existsSync(distDir)) {
  console.error('\u274c dist/ tidak ditemukan di:', distDir);
  console.error('   Jalankan `npm run build` dulu.');
  process.exit(1);
}

if (!existsSync(laravelPublic)) {
  console.error('\u274c public/ Laravel tidak ditemukan di:', laravelPublic);
  process.exit(1);
}

console.log('\ud83d\udce6 Menyalin build ke:', laravelPublic);

// 1. Hapus folder assets/ lama di public (kalau ada) untuk bersih dari build sebelumnya
const oldAssets = join(laravelPublic, 'assets');
if (existsSync(oldAssets)) {
  rmSync(oldAssets, { recursive: true, force: true });
  console.log('   \ud83d\uddd1  Hapus assets/ lama');
}

// 2. Copy semua file dari dist ke public/
const entries = readdirSync(distDir);
for (const entry of entries) {
  const src = join(distDir, entry);
  const dest = join(laravelPublic, entry);

  if (statSync(src).isDirectory()) {
    cpSync(src, dest, { recursive: true });
  } else {
    cpSync(src, dest);
  }
  console.log('   \u2705', entry);
}

console.log('\u2728 Selesai. Jalankan `php artisan serve` untuk testing.');
