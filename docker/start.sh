#!/bin/bash
set -e

export PORT=${PORT:-10000}

echo ">> PORT: $PORT"
echo ">> DB_CONNECTION: $DB_CONNECTION"
echo ">> SESSION_CONNECTION: $SESSION_CONNECTION"

# 1. Pastikan APP_KEY format Laravel yang benar (base64:xxx, 32 bytes)
if [ -z "$APP_KEY" ] || [[ "$APP_KEY" != base64:* ]]; then
  echo ">> APP_KEY belum valid (butuh format base64:xxx). Generating..."
  export APP_KEY="base64:$(openssl rand -base64 32)"
  echo ">> APP_KEY berhasil di-generate in-memory"
fi

# 2. Pastikan SQLite file ada & writable
SQLITE_PATH=${DB_DATABASE:-/var/www/html/database/database.sqlite}
if [ ! -f "$SQLITE_PATH" ]; then
  echo ">> Creating SQLite file at $SQLITE_PATH"
  mkdir -p "$(dirname "$SQLITE_PATH")"
  touch "$SQLITE_PATH"
fi
chown -R www-data:www-data "$(dirname "$SQLITE_PATH")"
chmod -R 775 "$(dirname "$SQLITE_PATH")"

# 3. Pastikan storage & bootstrap/cache writable
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# 4. Clear cache lama (kalau ada yang nyangkut dari build sebelumnya)
echo ">> Clearing old caches..."
php artisan config:clear || true
php artisan cache:clear || true
php artisan route:clear || true
php artisan view:clear || true

# 5. Migrate (dengan seed, biar akun default ada)
echo ">> Running migrations..."
php artisan migrate --force --seed || echo "!! Migrate failed (lanjut anyway)"

# 6. Cache config untuk performa (setelah migrate sukses)
echo ">> Caching config..."
php artisan config:cache || true
php artisan route:cache || true

# 7. Update Apache port binding dynamically
sed -i "s/Listen \${PORT}/Listen $PORT/" /etc/apache2/ports.conf || true
sed -i "s/<VirtualHost \*:\${PORT}>/<VirtualHost *:$PORT>/" /etc/apache2/sites-available/000-default.conf || true

echo ">> Starting Apache on port $PORT..."
exec apache2-foreground
