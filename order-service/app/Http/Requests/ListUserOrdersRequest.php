<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ListUserOrdersRequest extends FormRequest
{
    /**
     * Menentukan apakah request boleh diproses.
     */
    public function authorize(): bool
    {
        return true;
    }

    // Aturan validasi parameter daftar pesanan.
    public function rules(): array
    {
        return [
            'status' => [
                'sometimes',
                'string',
                'in:PENDING,PAID',
            ],
        ];
    }

    // Pesan validasi dalam Bahasa Indonesia.
    public function messages(): array
    {
        return [
            'status.string' => 'Status pesanan harus berupa teks.',
            'status.in' => 'Status hanya boleh PENDING atau PAID.',
        ];
    }
}
