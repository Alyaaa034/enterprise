
FROM php:8.4-cli

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        git \
        unzip \
        libzip-dev \
        default-mysql-client \
    && docker-php-ext-install pdo_mysql \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY composer.json composer.lock ./

RUN composer install \
    --no-dev \
    --no-interaction \
    --prefer-dist \
    --optimize-autoloader \
    --no-scripts

COPY . .

RUN php artisan package:discover --ansi \
    && mkdir -p storage/framework/cache \
        storage/framework/sessions \
        storage/framework/views \
        storage/logs \
        bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

EXPOSE 3003


CMD ["sh", "-c", "until mysqladmin --skip-ssl ping -h \"$DB_HOST\" -u\"$DB_USERNAME\" -p\"$DB_PASSWORD\" --silent; do echo 'Menunggu MySQL...'; sleep 2; done; php artisan migrate --force && exec php artisan serve --host=0.0.0.0 --port=3003"]
