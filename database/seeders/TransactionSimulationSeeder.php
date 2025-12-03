<?php

namespace Database\Seeders;

use App\Models\Barang;
use App\Models\BarangRetur;
use App\Models\BarangReturDetail;
use App\Models\Opname;
use App\Models\Pembelian;
use App\Models\PembelianDet;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TransactionSimulationSeeder extends Seeder
{
    /**
     * Run the seeder to simulate complete transaction flow:
     * 1. Purchase products at different prices
     * 2. Sell products and observe HPP using weighted average
     * 3. Create returns to adjust stock
     * 4. Perform opname (stock audit)
     */
    public function run(): void
    {
        echo "\n\n";
        echo "════════════════════════════════════════════════════════════════════════════\n";
        echo "  🚀 TRANSACTION SIMULATION SEEDER - Average Perpetual Cost Testing\n";
        echo "════════════════════════════════════════════════════════════════════════════\n";

        try {
            DB::beginTransaction();

            // Get test users
            $admin = User::where('level', 1)->first();
            $kasir = User::where('level', '>=', 2)->first();

            if (!$admin || !$kasir) {
                echo "\n❌ Error: Admin or Kasir user not found. Run UserSeeder first.\n";
                return;
            }

            // Get test products (take first 3 for clear tracking)
            $barangs = Barang::where('st_aktif', 1)->limit(3)->get();

            if ($barangs->isEmpty()) {
                echo "\n❌ Error: No active products found. Run BarangSeeder first.\n";
                return;
            }

            echo "\n📋 Test Users:\n";
            echo "   • Admin: {$admin->email}\n";
            echo "   • Kasir: {$kasir->email}\n";
            echo "\n📦 Test Products: {$barangs->count()} items\n";

            // ============================================================================
            // PHASE 1: PEMBELIAN (Purchase) - First batch at price A
            // ============================================================================
            echo "\n\n";
            echo "─────────────────────────────────────────────────────────────────────────\n";
            echo "  PHASE 1: PEMBELIAN (PURCHASE) - First Batch\n";
            echo "─────────────────────────────────────────────────────────────────────────\n";

            $purchaseData1 = [];
            foreach ($barangs as $idx => $barang) {
                $purchaseData1[] = [
                    'sku' => $barang->sku,
                    'barcode' => $barang->barcode,
                    'qtyBeli' => 10,
                    'hargaBeli' => 50000 * ($idx + 1), // Different price per product
                    'total' => 10 * 50000 * ($idx + 1),
                ];
            }

            $pembelian1 = $this->simulatePembelian($purchaseData1, $admin);
            echo "\n✅ Purchase Order #{$pembelian1->id} created\n";

            // ============================================================================
            // PHASE 2: PEMBELIAN (Purchase) - Second batch at higher price
            // ============================================================================
            echo "\n\n";
            echo "─────────────────────────────────────────────────────────────────────────\n";
            echo "  PHASE 2: PEMBELIAN (PURCHASE) - Second Batch (Higher Price)\n";
            echo "─────────────────────────────────────────────────────────────────────────\n";

            $purchaseData2 = [];
            foreach ($barangs as $idx => $barang) {
                $purchaseData2[] = [
                    'sku' => $barang->sku,
                    'barcode' => $barang->barcode,
                    'qtyBeli' => 5,
                    'hargaBeli' => 60000 * ($idx + 1), // Higher price
                    'total' => 5 * 60000 * ($idx + 1),
                ];
            }

            $pembelian2 = $this->simulatePembelian($purchaseData2, $admin);
            echo "\n✅ Purchase Order #{$pembelian2->id} created\n";

            // Display weighted average calculation
            $this->displayAverageCostCalculation($barangs);

            // ============================================================================
            // PHASE 3: PENJUALAN (Sales)
            // ============================================================================
            echo "\n\n";
            echo "─────────────────────────────────────────────────────────────────────────\n";
            echo "  PHASE 3: PENJUALAN (SALES)\n";
            echo "─────────────────────────────────────────────────────────────────────────\n";

            // Sales will use weighted average cost for HPP calculation
            echo "\n📊 When selling, the system will use weighted average cost for HPP:\n";
            foreach ($barangs as $idx => $barang) {
                $stock = DB::table('barang_stock')
                    ->where('barang_id', $barang->id)
                    ->first();

                if ($stock) {
                    echo "\n   Product: {$barang->deskripsi}\n";
                    echo "   • Current Stock Qty: {$stock->quantity}\n";
                    echo "   • Weighted Average Cost (HPP): Rp " . number_format($stock->harga_rata_rata, 0, ',', '.') . "\n";
                    echo "   • Available (Qty - Reserved): " . ($stock->quantity - $stock->reserved) . "\n";
                }
            }

            echo "\n📝 Note: Actual sales transactions would be recorded in transaksi table.\n";
            echo "   For now, we're demonstrating the weighted average setup.\n";

            // ============================================================================
            // PHASE 4: RETUR (Returns)
            // ============================================================================
            echo "\n\n";
            echo "─────────────────────────────────────────────────────────────────────────\n";
            echo "  PHASE 4: RETUR (RETURNS)\n";
            echo "─────────────────────────────────────────────────────────────────────────\n";

            $barangToReturn = $barangs->first();
            $returData = [
                [
                    'sku' => $barangToReturn->sku,
                    'barcode' => $barangToReturn->barcode,
                    'qtyRetur' => 3,
                    'hargaBeli' => 55000, // Average price between batches
                    'total' => 3 * 55000,
                ],
            ];

            $retur = $this->simulateRetur($returData, $admin);
            echo "\n✅ Return Order #{$retur->id} created\n";
            echo "   Product: {$barangToReturn->deskripsi}\n";
            echo "   Quantity Returned: 3\n";

            // ============================================================================
            // PHASE 5: OPNAME (Stock Audit)
            // ============================================================================
            echo "\n\n";
            echo "─────────────────────────────────────────────────────────────────────────\n";
            echo "  PHASE 5: OPNAME (STOCK AUDIT)\n";
            echo "─────────────────────────────────────────────────────────────────────────\n";

            $barangToOpname = $barangs->get(1) ?? $barangs->first();
            $stock = DB::table('barang_stock')
                ->where('barang_id', $barangToOpname->id)
                ->first();

            if ($stock) {
                $sistemQty = $stock->quantity;
                $fisikQty = $sistemQty - 2; // Simulate 2 units missing
                $selisih = $fisikQty - $sistemQty;

                $opnameData = [
                    [
                        'id' => $barangToOpname->id,
                        'qtySistem' => $sistemQty,
                        'qtyFisik' => $fisikQty,
                        'qtySelisih' => $selisih,
                        'keterangan' => 'Opname rutin - shortage found',
                    ],
                ];

                $opname = $this->simulateOpname($opnameData, $admin);
                echo "\n✅ Opname #{$opname->id} created\n";
                echo "   Product: {$barangToOpname->deskripsi}\n";
                echo "   System Qty: {$sistemQty}\n";
                echo "   Physical Qty: {$fisikQty}\n";
                echo "   Shortage: 2 units\n";
            }

            // ============================================================================
            // DISPLAY FINAL COST HISTORY
            // ============================================================================
            echo "\n\n";
            echo "─────────────────────────────────────────────────────────────────────────\n";
            echo "  COST HISTORY & SUMMARY\n";
            echo "─────────────────────────────────────────────────────────────────────────\n";

            $this->displayCostHistory($barangs);

            DB::commit();

            echo "\n\n";
            echo "════════════════════════════════════════════════════════════════════════════\n";
            echo "  ✅ SIMULATION COMPLETE - Average Perpetual Cost System Ready!\n";
            echo "════════════════════════════════════════════════════════════════════════════\n";
            echo "\n📋 What to check:\n";
            echo "   1. Open /cost-history to view cost changes\n";
            echo "   2. Check Kartu Stok to see stock movements\n";
            echo "   3. View Daily Profit to see HPP calculations with weighted average\n";
            echo "   4. Check BarangCostHistory table for all cost changes\n\n";

        } catch (\Exception $e) {
            DB::rollBack();
            echo "\n❌ Error during simulation: {$e->getMessage()}\n";
            echo "   File: {$e->getFile()}\n";
            echo "   Line: {$e->getLine()}\n\n";
        }
    }

    /**
     * Simulate Pembelian (Purchase) transaction
     */
    private function simulatePembelian($data, $user): Pembelian
    {
        $pembelian = Pembelian::create([
            'tgl_faktur' => Carbon::now()->toDateString(),
            'user_id' => $user->id,
            'grand_total' => 0,
            'is_lunas' => true,
        ]);

        $grandTotal = 0;

        foreach ($data as $item) {
            $barang = Barang::where('sku', $item['sku'])->first();

            if ($barang) {
                $qty = $item['qtyBeli'] * $barang->isi;
                $hargaBeli = $item['hargaBeli'];
                $total = $item['total'];

                // Create pembelian detail
                $detail = PembelianDet::create([
                    'pembelian_id' => $pembelian->id,
                    'sku' => $item['sku'],
                    'barcode' => $item['barcode'],
                    'qty' => $qty,
                    'satuan_beli' => $barang->volume,
                    'harga_beli' => $hargaBeli,
                    'total' => $total,
                    'stok_processed' => false,
                ]);

                // Add stock using ManageStok trait
                $hargaBeliPerUnit = (int) ($hargaBeli / $barang->isi);
                $movementId = \App\Traits\ManageStok::addStok(
                    $barang->id,
                    $qty,
                    'in',
                    'pembelian',
                    $pembelian->id,
                    'Pembelian #' . $pembelian->id,
                    $user->id,
                    $hargaBeliPerUnit
                );

                $detail->update([
                    'stok_processed' => true,
                    'kartu_stok_id' => $movementId,
                ]);

                $grandTotal += $total;

                echo "   ✓ {$barang->deskripsi}: {$qty} units @ Rp " . number_format($hargaBeliPerUnit, 0, ',', '.') . "/unit\n";
            }
        }

        $pembelian->update(['grand_total' => $grandTotal]);

        return $pembelian;
    }

    /**
     * Simulate Retur (Return) transaction
     */
    private function simulateRetur($data, $user): BarangRetur
    {
        $retur = BarangRetur::create([
            'user_id' => $user->id,
            'ket' => 'Stock return - simulation',
        ]);

        foreach ($data as $item) {
            $barang = Barang::where('sku', $item['sku'])->first();

            if ($barang) {
                $detail = BarangReturDetail::create([
                    'barang_retur_id' => $retur->id,
                    'barang_id' => $barang->id,
                    'qty' => $item['qtyRetur'],
                    'volume' => $barang->volume,
                    'harga_beli' => $item['hargaBeli'],
                    'total' => $item['total'],
                    'stok_processed' => false,
                ]);

                // Reduce stock using ManageStok trait
                $hargaBeli = (int) $item['hargaBeli'];
                $result = \App\Traits\ManageStok::reduceStok(
                    $barang->id,
                    $item['qtyRetur'],
                    'out',
                    'retur',
                    $retur->id,
                    'Retur #' . $retur->id,
                    $user->id,
                    $hargaBeli
                );

                if ($result['success']) {
                    $detail->update([
                        'stok_processed' => true,
                        'kartu_stok_id' => $result['movement_id'],
                    ]);

                    echo "   ✓ {$barang->deskripsi}: {$item['qtyRetur']} units returned\n";
                }
            }
        }

        return $retur;
    }

    /**
     * Simulate Opname (Stock Audit)
     */
    private function simulateOpname($data, $user)
    {
        foreach ($data as $item) {
            $opname = Opname::create([
                'user_id' => $user->id,
                'barang_id' => $item['id'],
                'tgl' => now()->toDateString(),
                'sistem' => $item['qtySistem'],
                'fisik' => $item['qtyFisik'],
                'selisih' => $item['qtySelisih'],
                'keterangan' => $item['keterangan'] ?? null,
            ]);

            // Update stok if there's a difference
            if ($item['qtySelisih'] !== 0) {
                $barang = Barang::find($item['id']);
                $hargaBeli = (int) $barang?->harga_beli;

                if ($item['qtySelisih'] > 0) {
                    \App\Traits\ManageStok::addStok(
                        $item['id'],
                        $item['qtySelisih'],
                        'in',
                        'opname',
                        $opname->id,
                        'Opname stok: ' . ($item['keterangan'] ?? 'Penyesuaian stok'),
                        $user->id,
                        $hargaBeli
                    );
                } else {
                    \App\Traits\ManageStok::reduceStok(
                        $item['id'],
                        abs($item['qtySelisih']),
                        'out',
                        'opname',
                        $opname->id,
                        'Opname stok: ' . ($item['keterangan'] ?? 'Penyesuaian stok'),
                        $user->id,
                        $hargaBeli
                    );
                }
            }

            return $opname;
        }
    }

    /**
     * Display weighted average calculation
     */
    private function displayAverageCostCalculation($barangs): void
    {
        echo "\n📊 Weighted Average Cost Calculation:\n";

        foreach ($barangs as $idx => $barang) {
            $price1 = 50000 * ($idx + 1);
            $qty1 = 10;
            $price2 = 60000 * ($idx + 1);
            $qty2 = 5;

            $avgCost = (int) ceil(($qty1 * $price1 + $qty2 * $price2) / ($qty1 + $qty2));

            echo "\n   {$barang->deskripsi}:\n";
            echo "   • Batch 1: {$qty1} units @ Rp " . number_format($price1, 0, ',', '.') . " = Rp " . number_format($qty1 * $price1, 0, ',', '.') . "\n";
            echo "   • Batch 2: {$qty2} units @ Rp " . number_format($price2, 0, ',', '.') . " = Rp " . number_format($qty2 * $price2, 0, ',', '.') . "\n";
            echo "   • Total Stock: " . ($qty1 + $qty2) . " units\n";
            echo "   • Weighted Average: Rp " . number_format($avgCost, 0, ',', '.') . " per unit\n";
        }
    }

    /**
     * Display cost history
     */
    private function displayCostHistory($barangs): void
    {
        foreach ($barangs as $barang) {
            $costHistory = DB::table('barang_cost_history')
                ->where('barang_id', $barang->id)
                ->orderBy('created_at')
                ->get();

            if ($costHistory->isNotEmpty()) {
                echo "\n   {$barang->deskripsi}:\n";

                foreach ($costHistory as $history) {
                    $change = $history->harga_rata_rata_baru - $history->harga_rata_rata_lama;
                    $changeSymbol = $change > 0 ? '↑' : '↓';

                    echo "   • {$changeSymbol} Rp " . number_format($history->harga_rata_rata_lama, 0, ',', '.') . " → Rp " . number_format($history->harga_rata_rata_baru, 0, ',', '.') . "\n";
                    echo "     ({$history->trigger_type})\n";
                }
            }
        }
    }
}
