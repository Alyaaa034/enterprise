<?php

namespace App\Services;

use App\Exceptions\ProductNotFoundException;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class ProductService
{
    public function getProduct(int $productId): array
    {
        try {
            $response = Http::baseUrl(
                rtrim(config('services.product.url'), '/')
            )
                ->acceptJson()
                ->connectTimeout(2)
                ->timeout(5)
                ->get("/products/{$productId}");
        } catch (ConnectionException $e) {
            throw new RuntimeException(
                'Product Service tidak dapat dihubungi.',
                0,
                $e
            );
        }

        if ($response->serverError() || $response->status() === 429) {
            throw new RuntimeException(
                'Product Service sedang mengalami gangguan.'
            );
        }

        if ($response->status() === 404) {
            throw new ProductNotFoundException(
                "Produk dengan ID {$productId} tidak ditemukan."
            );
        }

        if (!$response->successful()) {
            throw new RuntimeException(
                'Product Service mengembalikan respons yang tidak valid.'
            );
        }

        $product = $response->json('data');

        if (
            !is_array($product)
            || !isset($product['id'], $product['name'], $product['price'], $product['stock'])
        ) {
            throw new RuntimeException(
                'Format data produk dari Product Service tidak valid.'
            );
        }

        return $product;
    }
}