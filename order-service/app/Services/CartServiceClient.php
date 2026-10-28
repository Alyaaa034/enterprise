<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class CartServiceClient
{
    private function client()
    {
        return Http::baseUrl(rtrim(config('services.cart.url'), '/'))
            ->acceptJson()
            ->connectTimeout(2)
            ->timeout(5);
    }

    public function getCart(int $userId): array
    {
        $response = $this->sendRequest(
            fn () => $this->client()->get("/carts/{$userId}")
        );

        if (!$response->successful()) {
            throw new RuntimeException(
                'Cart Service gagal mengambil keranjang.'
            );
        }

        $cart = $response->json();

        if (
            !is_array($cart) ||
            !isset($cart['user_id'], $cart['items']) ||
            !is_array($cart['items'])
        ) {
            throw new RuntimeException(
                'Format data keranjang tidak valid.'
            );
        }

        return $cart;
    }

    public function clearCart(int $userId): void
    {
        $response = $this->sendRequest(
            fn () => $this->client()->delete("/carts/{$userId}")
        );

        if (!$response->successful()) {
            throw new RuntimeException(
                'Cart Service gagal mengosongkan keranjang.'
            );
        }
    }

    private function sendRequest(callable $request): Response
    {
        try {
            return $request();
        } catch (ConnectionException $e) {
            throw new RuntimeException(
                'Cart Service tidak dapat dihubungi.',
                0,
                $e
            );
        }
    }
}
