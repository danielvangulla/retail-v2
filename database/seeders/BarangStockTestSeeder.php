<?php

namespace Database\Seeders;

use App\Models\Barang;
use App\Models\BarangStock;
use App\Models\BarangStockMovement;
use App\Traits\ManageStok;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class BarangStockTestSeeder extends Seeder
{
    use ManageStok;

    public function run(): void
    {
        $this->command->info('Seeding barang stock for testing...');

        // Get first 20 active barang
        $barangs = Barang::where('st_aktif', 1)->limit(20)->get();

        if ($barangs->isEmpty()) {
            $this->command->warn('No active barang found. Please seed barang first.');
            return;
        }

        foreach ($barangs as $barang) {
            // Check if stock already exists
            $exists = BarangStock::where('barang_id', $barang->id)->exists();

            if (!$exists) {
                // Create initial stock entry
                $stock = BarangStock::create([
                    'barang_id' => $barang->id,
                    'quantity' => rand(0, 100),
                    'reserved' => 0,
                    'available' => 0,
                ]);

                // Add some mock movements for history
                $this->createMockMovements($barang->id, $stock->quantity);

                $this->command->line("✓ Initialized stock for: {$barang->deskripsi}");
            }
        }

        $this->command->info('Stock seeding completed!');
    }

    private function createMockMovements($barangId, $currentQty): void
    {
        // Simulate purchase history
        BarangStockMovement::create([
            'barang_id' => $barangId,
            'type' => 'in',
            'quantity' => $currentQty,
            'quantity_before' => 0,
            'quantity_after' => $currentQty,
            'reference_type' => 'pembelian',
            'reference_id' => 'PB-' . rand(1000, 9999),
            'notes' => 'Initial stock purchase',
            'movement_date' => Carbon::now()->subDays(rand(1, 30)),
        ]);

        // Simulate sales history (if current qty > 5)
        if ($currentQty > 5) {
            $sold = rand(1, min(10, $currentQty - 1));
            BarangStockMovement::create([
                'barang_id' => $barangId,
                'type' => 'out',
                'quantity' => $sold,
                'quantity_before' => $currentQty,
                'quantity_after' => $currentQty - $sold,
                'reference_type' => 'penjualan',
                'reference_id' => 'TRX-' . rand(10000, 99999),
                'notes' => 'Sales transaction',
                'movement_date' => Carbon::now()->subDays(rand(0, 5)),
            ]);
        }
    }
}
