<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOpnameRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasPermissionTo('opname.create') ?? true;
    }

    public function rules(): array
    {
        return [
            'data' => ['required', 'array', 'min:1'],
            'data.*.id' => ['required', 'uuid', 'exists:barang,id'],
            'data.*.deskripsi' => ['required', 'string'],
            'data.*.qtySistem' => ['required', 'integer', 'min:0'],
            'data.*.qtyFisik' => ['required', 'integer', 'min:0'],
            'data.*.qtySelisih' => ['required', 'integer'],
            'data.*.keterangan' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'data.required' => 'Data opname harus ada',
            'data.array' => 'Data opname harus berupa array',
            'data.min' => 'Minimal ada 1 item opname',
            'data.*.id.required' => 'ID barang wajib diisi',
            'data.*.id.uuid' => 'ID barang harus uuid yang valid',
            'data.*.id.exists' => 'Barang tidak ditemukan',
            'data.*.qtySistem.required' => 'Stok sistem wajib diisi',
            'data.*.qtySistem.integer' => 'Stok sistem harus berupa angka',
            'data.*.qtyFisik.required' => 'Stok fisik wajib diisi',
            'data.*.qtyFisik.integer' => 'Stok fisik harus berupa angka',
            'data.*.keterangan.max' => 'Keterangan maksimal 500 karakter',
        ];
    }
}
