<?php

namespace App\Listeners;

use App\Models\Barang;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Cache;

class BarangCacheListener
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(object $event): void
    {
        // Cache::forget('barangList');

        // $barang = Barang::select('id', 'sku', 'barcode', 'deskripsi', 'satuan', 'isi', 'volume', 'harga_jual1', 'harga_jual2', 'st_aktif')
        //     ->with(['beliDetails' => function ($q) {
        //         $q->selectRaw('sku, sum(qty) as qty');
        //         $q->groupBy('sku');
        //     }])
        //     ->with(['trxDetails' => function ($q) {
        //         $q->selectRaw('sku, sum(qty) as qty');
        //         $q->groupBy('sku');
        //     }])
        //     ->orderBy('deskripsi')->get();

        // Cache::forever('barangList', $barang);
    }
}

