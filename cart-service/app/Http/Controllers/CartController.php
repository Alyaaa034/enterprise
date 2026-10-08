<?php

namespace App\Http\Controllers;

use App\Exceptions\CartItemNotFoundException;
use App\Http\Requests\AddCartItemRequest;
use App\Http\Requests\UpdateCartItemRequest;
use App\Services\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Throwable;

class CartController extends Controller
{
    public function __construct(
        private CartService $cartService
    ) {}

    public function show(int $userId): JsonResponse
    {
        try {
            return response()->json(
                $this->cartService->getCart($userId)
            );
        } catch (Throwable $e) {
            Log::error('Gagal mengambil cart', [
                'user_id' => $userId,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Terjadi kesalahan pada server.',
            ], 500);
        }
    }

    public function store(AddCartItemRequest $request): JsonResponse
    {
        try {
            $item = $this->cartService->addItem(
                $request->integer('user_id'),
                $request->integer('product_id'),
                $request->integer('quantity', 1)
            );

            return response()->json($item, $item->wasRecentlyCreated ? 201 : 200);
        } catch (Throwable $e) {
            Log::error('Gagal menambahkan item ke cart', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Terjadi kesalahan pada server.',
            ], 500);
        }
    }

    public function update(
        UpdateCartItemRequest $request,
        int $id
    ): JsonResponse {
        try {
            $item = $this->cartService->updateQuantity(
                $id,
                $request->integer('quantity')
            );

            return response()->json($item);
        } catch (CartItemNotFoundException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 404);
        } catch (Throwable $e) {
            Log::error('Gagal mengubah quantity cart item', [
                'id' => $id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Terjadi kesalahan pada server.',
            ], 500);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->cartService->removeItem($id);

            return response()->json([
                'message' => 'Item berhasil dihapus.',
            ]);
        } catch (CartItemNotFoundException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 404);
        } catch (Throwable $e) {
            Log::error('Gagal menghapus cart item', [
                'id' => $id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Terjadi kesalahan pada server.',
            ], 500);
        }
    }

    public function clear(int $userId): JsonResponse
    {
        try {
            $deleted = $this->cartService->clearCart($userId);

            return response()->json([
                'message' => 'Cart berhasil dikosongkan.',
                'deleted' => $deleted,
            ]);
        } catch (Throwable $e) {
            Log::error('Gagal mengosongkan cart', [
                'user_id' => $userId,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Terjadi kesalahan pada server.',
            ], 500);
        }
    }
}