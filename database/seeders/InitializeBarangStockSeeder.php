<?php

namespace Database\Seeders;

use App\Models\Barang;
use App\Models\BarangStock;
use Illuminate\Database\Seeder;

class InitializeBarangStockSeeder extends Seeder
{
    public function run(): void
    {
        // Get all active barang and initialize stok
        $barangs = Barang::where('st_aktif', 1)->get();

        foreach ($barangs as $barang) {
            // Check if stock already exists
            $exists = BarangStock::where('barang_id', $barang->id)->exists();

            if (!$exists) {
                BarangStock::create([
                    'barang_id' => $barang->id,
                    'quantity' => 0,
                    'reserved' => 0,
                    'available' => 0,
                ]);
            }
        }

        $this->command->info('Barang stock initialized successfully!');
    }
}
