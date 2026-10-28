<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Database\Eloquent\Collection;

class OrderQueryService
{
    public function listForUser(
        int $userId,
        ?string $status = null
    ): Collection {
        $query = Order::with('items')
            ->where('user_id', (string) $userId);

        if ($status !== null) {
            $query->where('status', $status);
        }

        return $query
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->get();
    }
}
