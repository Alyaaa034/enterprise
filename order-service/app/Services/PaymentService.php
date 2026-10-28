<?php

namespace App\Services;

use App\Exceptions\PaymentConflictException;
use App\Models\Order;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;

class PaymentService
{
    public function pay(int $orderId): Order
    {
        return DB::transaction(function () use ($orderId) {
            $order = Order::with('items')
                ->lockForUpdate()
                ->find($orderId);

            if (!$order) {
                throw new ModelNotFoundException(
                    'Pesanan tidak ditemukan.'
                );
            }

            if ($order->status !== 'PENDING') {
                throw new PaymentConflictException(
                    'Pesanan hanya bisa dibayar jika statusnya PENDING.'
                );
            }

            $order->status = 'PAID';
            $order->save();

            return $order->load('items');
        });
    }
}
