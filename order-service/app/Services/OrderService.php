<?php

namespace App\Services;

use App\Exceptions\CheckoutConflictException;
use App\Models\Order;
use Illuminate\Support\Facades\DB;

class OrderService
{
    public function __construct(
        private ProductService $productService,
        private CartServiceClient $cartService
    ) {}

    public function createFromCart(int $userId): Order
    {
        $cart = $this->cartService->getCart($userId);
        $items = $cart['items'];

        if (count($items) === 0) {
            throw new CheckoutConflictException(
                'Keranjang belanja kosong.'
            );
        }

        $preparedItems = [];
        $totalAmount = 0;

        foreach ($items as $item) {
            $productId = (int) ($item['product_id'] ?? 0);
            $quantity = (int) ($item['quantity'] ?? 0);

            if ($productId < 1 || $quantity < 1) {
                throw new CheckoutConflictException(
                    'Data item keranjang tidak valid.'
                );
            }

            $product = $this->productService->getProduct($productId);

            if ($quantity > (int) $product['stock']) {
                throw new CheckoutConflictException(
                    "Stok produk {$product['name']} tidak mencukupi."
                );
            }

            $unitPrice = (float) $product['price'];
            $subtotal = round($unitPrice * $quantity, 2);
            $totalAmount += $subtotal;

            $preparedItems[] = [
                'product_id' => $productId,
                'product_name' => $product['name'],
                'unit_price' => $unitPrice,
                'quantity' => $quantity,
                'subtotal' => $subtotal,
            ];
        }

        $order = DB::transaction(function () use (
            $userId,
            $totalAmount,
            $preparedItems
        ) {
            $order = Order::create([
                'user_id' => (string) $userId,
                'total_amount' => $totalAmount,
                'status' => 'PENDING',
            ]);

            $order->items()->createMany($preparedItems);

            return $order->load('items');
        });

        try {
            $this->cartService->clearCart($userId);
        } catch (\Throwable $e) {
            report($e);

            // Pesanan sudah tersimpan. Jangan membuat pesanan baru
            // hanya karena pengosongan keranjang mengalami kegagalan.
        }

        return $order;
    }
}
