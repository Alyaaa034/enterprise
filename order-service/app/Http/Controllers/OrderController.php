<?php

namespace App\Http\Controllers;

use App\Http\Requests\ListUserOrdersRequest;
use App\Services\OrderQueryService;
use App\Exceptions\ProductNotFoundException;
use App\Models\Order;
use App\Services\CartServiceClient;
use App\Services\ProductService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use RuntimeException;
use Throwable;

class OrderController extends Controller
{
    public function __construct(
    private ProductService $productService,
    private CartServiceClient $cartService,
    private OrderQueryService $orderQueryService
) {}

   
    // Membuat pesanan berdasarkan isi keranjang pengguna.
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'user_id' => ['required', 'integer', 'min:1'],
            ]);

            $userId = (int) $validated['user_id'];

            $cart = $this->cartService->getCart($userId);
            $items = $cart['items'];

            if (count($items) === 0) {
                return response()->json([
                    'message' => 'Keranjang belanja kosong.',
                ], 409);
            }

            $preparedItems = [];
            $totalAmount = 0;

            foreach ($items as $item) {
                $productId = (int) ($item['product_id'] ?? 0);
                $quantity = (int) ($item['quantity'] ?? 0);

                if ($productId < 1 || $quantity < 1) {
                    return response()->json([
                        'message' => 'Data item keranjang tidak valid.',
                    ], 409);
                }

                $product = $this->productService->getProduct($productId);

                if ($quantity > (int) $product['stock']) {
                    return response()->json([
                        'message' => "Stok produk {$product['name']} tidak mencukupi.",
                    ], 409);
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
            } catch (Throwable $e) {
                Log::error(
                    'Order berhasil dibuat, tetapi cart gagal dikosongkan.',
                    [
                        'order_id' => $order->id,
                        'user_id' => $userId,
                        'error' => $e->getMessage(),
                    ]
                );
            }

            return response()->json([
                'message' => 'Pesanan berhasil dibuat.',
                'data' => $order,
            ], 201);

        } catch (ValidationException $e) {
            throw $e;

        } catch (ProductNotFoundException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 409);

        } catch (RuntimeException $e) {
            Log::error(
                'Gagal membuat order karena layanan terkait bermasalah.',
                ['error' => $e->getMessage()]
            );

            return response()->json([
                'message' => 'Layanan produk atau keranjang sedang bermasalah.',
            ], 503);

        } catch (Throwable $e) {
            Log::error('Gagal membuat order.', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Terjadi kesalahan saat membuat pesanan.',
            ], 500);
        }
    }

    //Mengambil daftar pesanan milik pengguna.
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

    //Mengambil detail pesanan berdasarkan ID.
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
}
