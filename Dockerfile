# =================================================================
# STAGE 1: Build frontend React (Node.js)
# =================================================================
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy package files dulu untuk caching layer
COPY frontend/package*.json ./

RUN npm ci

# Copy source frontend
COPY frontend/ ./

# Build React ke dist/
RUN npm run build

# =================================================================
# STAGE 2: Runtime Laravel (PHP + Apache)
# =================================================================
FROM php:8.2-apache

# Install system deps + PHP extensions yang dibutuhkan Laravel
RUN apt-get update && apt-get install -y \
    libzip-dev \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libonig-dev \
    libxml2-dev \
    sqlite3 \
    libsqlite3-dev \
    unzip \
    git \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo pdo_mysql pdo_sqlite mbstring exif pcntl bcmath gd zip \
    && rm -rf /var/lib/apt/lists/*

# Enable Apache mod_rewrite untuk Laravel pretty URL
RUN a2enmod rewrite

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Config Apache: point DocumentRoot ke public/
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf \
    && sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Apache listen di port yang disediakan Render (PORT env var)
# Render expects app to bind to $PORT (default 10000)
RUN sed -i 's/Listen 80/Listen ${PORT}/' /etc/apache2/ports.conf \
    && sed -i 's/<VirtualHost \*:80>/<VirtualHost *:${PORT}>/' /etc/apache2/sites-available/000-default.conf

WORKDIR /var/www/html

# Copy composer files dulu untuk caching layer
COPY composer.json composer.lock ./

# Install PHP deps (production, tanpa dev)
RUN composer install --no-scripts --no-autoloader --no-dev --prefer-dist

# Copy seluruh source Laravel
COPY . .

# Copy hasil build React dari stage 1 ke public/
COPY --from=frontend-builder /app/frontend/dist/ /var/www/html/public/

# Finalize composer autoload
RUN composer dump-autoload --optimize --no-dev

# Set permission untuk storage & cache
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Buat file SQLite + folder database
RUN mkdir -p /var/www/html/database \
    && touch /var/www/html/database/database.sqlite \
    && chown -R www-data:www-data /var/www/html/database \
    && chmod -R 775 /var/www/html/database

# Script start: migrate + cache + jalankan Apache
COPY docker/start.sh /usr/local/bin/start.sh
RUN chmod +x /usr/local/bin/start.sh

EXPOSE 10000

CMD ["/usr/local/bin/start.sh"]
