<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use UnexpectedValueException;

class ProductService
{
    public function getProduct(int $productId): ?array
    {
        $response = Http::baseUrl(config('services.product.url'))
            ->get("/products/{$productId}");

        if ($response->notFound()) {
            return null;
        }

        $response->throw();

        $product = $response->json('data');
        if (!is_array($product)) {
            throw new UnexpectedValueException(
                "Respons product service untuk id {$productId} tidak memiliki data produk yang valid."
            );
        }

        return $product;
    }
}