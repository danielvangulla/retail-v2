<?php

namespace App\Console\Commands;

use App\Models\BarangStock;
use Illuminate\Console\Command;

class InitializeAverageCost extends Command
{
    protected $signature = 'app:initialize-average-cost {--reset : Reset all average costs to harga_beli}';
    protected $description = 'Initialize harga_rata_rata for existing stock from harga_beli';

    public function handle()
    {
        $reset = $this->option('reset');

        if ($reset) {
            $this->warn('⚠️  Resetting all average costs to harga_beli...');

            if ($this->confirm('Lanjutkan reset? (this will affect HPP calculation)', false)) {
                BarangStock::with('barang')
                    ->chunk(100, function ($stocks) {
                        foreach ($stocks as $stock) {
                            $stock->update([
                                'harga_rata_rata' => (int) ($stock->barang?->harga_beli ?? 0),
                                'harga_rata_rata_updated_at' => now(),
                            ]);
                        }
                    });

                $this->info('✅ Average cost initialized from harga_beli');
            }
        } else {
            $this->info('Initializing harga_rata_rata for empty records...');

            $updated = BarangStock::with('barang')
                ->where('harga_rata_rata', 0)
                ->orWhereNull('harga_rata_rata')
                ->chunk(100, function ($stocks) {
                    $count = 0;
                    foreach ($stocks as $stock) {
                        $stock->update([
                            'harga_rata_rata' => (int) ($stock->barang?->harga_beli ?? 0),
                            'harga_rata_rata_updated_at' => now(),
                        ]);
                        $count++;
                    }
                    return $count;
                });

            $this->info('✅ Initialization complete');
        }
    }
}
