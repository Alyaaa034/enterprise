<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateOrderRequest;
use App\Exceptions\CheckoutConflictException;
use App\Exceptions\PaymentConflictException;
use App\Exceptions\ProductNotFoundException;
use App\Http\Requests\ListUserOrdersRequest;
use App\Models\Order;
use App\Services\OrderQueryService;
use App\Services\OrderService;
use App\Services\PaymentService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use RuntimeException;
use Throwable;

class OrderController extends Controller
{
    public function __construct(
        private OrderService $orderService,
        private OrderQueryService $orderQueryService,
        private PaymentService $paymentService
    ) {}

    // Membuat pesanan berdasarkan isi keranjang pengguna.
    public function store(CreateOrderRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();

            $order = $this->orderService->createFromCart(
                (int) $validated['user_id']
            );

            return response()->json([
                'message' => 'Pesanan berhasil dibuat.',
                'data' => $order,
            ], 201);

        } catch (CheckoutConflictException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 409);

        } catch (ProductNotFoundException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 409);

        } catch (RuntimeException $e) {
            Log::error(
                'Gagal membuat pesanan karena layanan terkait bermasalah.',
                ['error' => $e->getMessage()]
            );

            return response()->json([
                'message' => 'Layanan produk atau keranjang sedang bermasalah.',
            ], 503);

        } catch (Throwable $e) {
            Log::error('Gagal membuat pesanan.', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Terjadi kesalahan saat membuat pesanan.',
            ], 500);
        }
    }

    // Mengambil daftar pesanan milik pengguna.
    public function indexByUser(
        ListUserOrdersRequest $request,
        string $userId
    ): JsonResponse {
        if (!ctype_digit($userId) || (int) $userId < 1) {
            return response()->json([
                'message' => 'Pengguna tidak valid.',
            ], 404);
        }

        $orders = $this->orderQueryService->listForUser(
            (int) $userId,
            $request->validated('status')
        );

        return response()->json([
            'message' => 'Daftar pesanan berhasil diambil.',
            'data' => $orders,
        ], 200);
    }

    // Mengambil detail pesanan berdasarkan ID.
    public function show(string $id): JsonResponse
    {
        if (!ctype_digit($id) || (int) $id < 1) {
            return response()->json([
                'message' => 'Pesanan tidak ditemukan.',
            ], 404);
        }

        $order = Order::with('items')->find((int) $id);

        if (!$order) {
            return response()->json([
                'message' => 'Pesanan tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'message' => 'Detail pesanan berhasil diambil.',
            'data' => $order,
        ], 200);
    }

    // Mengubah status pesanan dari PENDING menjadi PAID.
    public function pay(string $id): JsonResponse
    {
        if (!ctype_digit($id) || (int) $id < 1) {
            return response()->json([
                'message' => 'Pesanan tidak ditemukan.',
            ], 404);
        }

        try {
            $order = $this->paymentService->pay((int) $id);

            return response()->json([
                'message' => 'Pembayaran berhasil.',
                'data' => $order,
            ], 200);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Pesanan tidak ditemukan.',
            ], 404);

        } catch (PaymentConflictException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 409);

        } catch (Throwable $e) {
            Log::error('Gagal memproses pembayaran pesanan.', [
                'order_id' => $id,
                'exception' => $e,
            ]);

            return response()->json([
                'message' => 'Terjadi kesalahan pada server.',
            ], 500);
        }
    }
}
