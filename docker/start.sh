#!/bin/bash
set -e

# Default PORT 10000 untuk Render
export PORT=${PORT:-10000}

echo ">> Running migrations..."
php artisan migrate --force --seed || echo "Migrate failed (non-fatal, maybe DB not ready)"

echo ">> Caching config & routes..."
php artisan config:cache
php artisan route:cache
php artisan view:cache || true

echo ">> Starting Apache on port $PORT..."
exec apache2-foreground
