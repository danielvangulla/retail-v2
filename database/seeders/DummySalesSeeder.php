<?php

namespace Database\Seeders;

use App\Models\Transaksi;
use App\Models\TransaksiDetail;
use App\Models\User;
use App\Models\Barang;
use App\Traits\ManageStok;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class DummySalesSeeder extends Seeder
{
    use ManageStok;

    public function run(): void
    {
        echo "\n🔄 Generating dummy transactions with stock movements...\n";

        // Get data
        $kasirs = User::where('level', '>=', 2)->limit(3)->get();
        $barangs = Barang::where('st_aktif', 1)->limit(10)->get();
        $spv = User::where('level', 1)->first();

        if ($kasirs->isEmpty() || $barangs->isEmpty() || !$spv) {
            echo "❌ Missing required data. Ensure UserSeeder and BarangSeeder ran first.\n";
            return;
        }

        $salesCount = 0;
        $purchaseCount = 0;

        // 1. Create purchase transactions first
        echo "\n📥 Creating purchase transactions...\n";

        foreach ($barangs as $idx => $barang) {
            $purchaseDate = Carbon::now()->subDays(rand(5, 25));
            $purchaseQty = rand(50, 150);

            $transaksi = Transaksi::create([
                'id' => Str::uuid(),
                'tgl' => $purchaseDate->toDateString(),
                'jam_mulai' => $purchaseDate,
                'jam_selesai' => $purchaseDate->copy()->addHours(1),
                'pax_tamu' => 1,
                'nama_tamu' => 'PEMBELIAN',
                'meja' => 'PB-' . str_pad($idx + 1, 3, '0', STR_PAD_LEFT),
                'brutto' => $purchaseQty * 15000,
                'disc_spv' => 0,
                'disc_promo' => 0,
                'netto' => $purchaseQty * 15000,
                'charge' => 0,
                'service' => 0,
                'tax' => 0,
                'bayar' => $purchaseQty * 15000,
                'payment' => $purchaseQty * 15000,
                'kembali' => 0,
                'status' => 1,
                'user_kasir_id' => $kasirs->first()->id,
                'user_spv_id' => $spv->id,
                'is_cancel' => 0,
                'created_at' => $purchaseDate,
                'updated_at' => $purchaseDate,
            ]);

            // Record stock movement for purchase
            $this->addStok($barang->id, $purchaseQty, 'in', 'pembelian', $transaksi->id, 'Purchase order', $spv->id);

            $purchaseCount++;
            echo "✓ Purchase {$purchaseCount}: {$barang->deskripsi} - {$purchaseQty} unit\n";
        }

        // 2. Create sales transactions for last 30 days
        echo "\n📤 Creating sales transactions...\n";

        for ($day = 0; $day < 30; $day++) {
            $date = Carbon::now()->subDays($day);
            $transactionsPerDay = rand(3, 8);

            for ($t = 0; $t < $transactionsPerDay; $t++) {
                $kasir = $kasirs->random();
                $itemCount = rand(1, 4);
                $totalBayar = 0;
                $itemsForDetails = [];

                // Pick items first
                for ($i = 0; $i < $itemCount; $i++) {
                    $barang = $barangs->random();
                    $maxQty = min(20, max(1, rand(1, 15)));
                    $qty = rand(1, $maxQty);
                    $harga = rand(20000, 50000);

                    $itemsForDetails[] = [
                        'barang' => $barang,
                        'qty' => $qty,
                        'harga' => $harga,
                        'total' => $qty * $harga,
                    ];

                    $totalBayar += $qty * $harga;
                }

                $transaksi = Transaksi::create([
                    'id' => Str::uuid(),
                    'tgl' => $date->toDateString(),
                    'jam_mulai' => $date->copy()->setTime(rand(9, 20), rand(0, 59)),
                    'jam_selesai' => $date->copy()->setTime(rand(10, 21), rand(0, 59)),
                    'pax_tamu' => 1,
                    'nama_tamu' => '',
                    'meja' => 'RETAIL',
                    'brutto' => $totalBayar,
                    'disc_spv' => 0,
                    'disc_promo' => 0,
                    'netto' => $totalBayar,
                    'charge' => 0,
                    'service' => 0,
                    'tax' => 0,
                    'bayar' => $totalBayar,
                    'payment' => $totalBayar,
                    'kembali' => 0,
                    'status' => 1,
                    'user_kasir_id' => $kasir->id,
                    'user_spv_id' => null,
                    'is_cancel' => 0,
                    'created_at' => $date,
                    'updated_at' => $date,
                ]);

                // Add items and record stock movements
                foreach ($itemsForDetails as $item) {
                    // Record stock movement for sale
                    $result = $this->reduceStok(
                        $item['barang']->id,
                        $item['qty'],
                        'out',
                        'penjualan',
                        $transaksi->id,
                        '',
                        $kasir->id
                    );

                    if ($result['success']) {
                        TransaksiDetail::create([
                            'id' => Str::uuid(),
                            'transaksi_id' => $transaksi->id,
                            'tgl' => $date->toDateString(),
                            'jam' => $date,
                            'no_co' => 'TX-' . $date->format('Ymd') . '-' . Str::random(4),
                            'sku' => $item['barang']->id,
                            'qty' => $item['qty'],
                            'harga' => $item['harga'],
                            'brutto' => $item['total'],
                            'netto' => $item['total'],
                            'note' => 'Sale',
                            'created_at' => $date,
                            'updated_at' => $date,
                        ]);
                    }
                }

                $salesCount++;
                echo "✓ Sale {$salesCount}: Rp " . number_format($totalBayar, 0, ',', '.') . " ({$itemCount} items)\n";
            }
        }

        echo "\n✅ Seeding complete!\n";
        echo "   📥 {$purchaseCount} purchase transactions\n";
        echo "   📤 {$salesCount} sales transactions\n";
        echo "   📊 Stock movements recorded for all transactions\n";
    }
}
