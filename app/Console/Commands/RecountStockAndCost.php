<?php

namespace App\Console\Commands;

use App\Models\Barang;
use App\Models\BarangStock;
use App\Models\BarangStockMovement;
use App\Models\BarangCostHistory;
use App\Models\PembelianDet;
use App\Models\Transaksi;
use App\Models\TransaksiDetail;
use App\Models\BarangRetur;
use App\Models\BarangReturDetail;
use App\Models\Opname;
use App\Traits\ManageStok;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class RecountStockAndCost extends Command
{
    protected $signature = 'stock:recount {--confirm}';

    protected $description = 'Recount all stock and cost from pembelian, penjualan, opname, retur - destructive operation';

    public function handle()
    {
        if (!$this->option('confirm')) {
            $this->error('⚠️  This will DELETE all stock movements and cost history!');
            if (!$this->confirm('Are you sure you want to continue? Type "yes" to confirm')) {
                $this->info('Cancelled.');
                return 1;
            }
        }

        try {
            DB::beginTransaction();

            $this->info('🔄 Starting full recount of all transactions...');

            // Step 1: Clear all tracking data
            $this->info('📋 Step 1: Clearing stock movements and cost history...');
            BarangStockMovement::truncate();
            BarangCostHistory::truncate();

            // Reset all stock to 0
            BarangStock::query()->update([
                'quantity' => 0,
                'reserved' => 0,
                'harga_rata_rata' => 0,
                'harga_rata_rata_updated_at' => NULL,
            ]);
            $this->info('   ✓ Cleared');

            $totalProcessed = 0;
            $totalFailed = 0;

            // Step 2: Process PEMBELIAN (purchases)
            $this->info('📦 Step 2: Processing pembelian (purchases)...');
            $pembelianDets = PembelianDet::with(['barang', 'pembelian', 'pembelian.user'])
                ->orderBy('created_at', 'asc')
                ->get();

            foreach ($pembelianDets as $det) {
                try {
                    if (!$det->barang) {
                        $totalFailed++;
                        continue;
                    }

                    $barang = $det->barang;
                    $qty = (int) $det->qty;
                    $hargaBeli = (int) $det->harga_beli;
                    $hargaBeliPerUnit = $qty > 0 ? (int) ($hargaBeli / $qty) : 0;
                    $createdAt = $det->pembelian->created_at ?? $det->created_at;
                    $userId = $det->pembelian->user_id ?? null;

                    // Add stock and record with original date and user
                    $movementId = ManageStok::addStok(
                        $barang->id,
                        $qty,
                        'in',
                        'pembelian',
                        $det->pembelian->id ?? null,
                        "Pembelian",
                        $userId,
                        $hargaBeliPerUnit
                    );

                    // Update created_at for movement and cost history to preserve original date
                    if ($movementId) {
                        BarangStockMovement::where('id', $movementId)->update(['created_at' => $createdAt]);
                        BarangCostHistory::where('reference_id', null)
                            ->latest()
                            ->first()
                            ?->update(['created_at' => $createdAt]);
                    }

                    $totalProcessed++;
                    $this->line("   ✓ {$barang->deskripsi}: +{$qty} units ({$createdAt})");
                } catch (\Exception $e) {
                    $totalFailed++;
                    $this->warn("   ✗ Error: {$e->getMessage()}");
                }
            }

            // Step 3: Process PENJUALAN (sales)
            $this->info('💰 Step 3: Processing penjualan (sales)...');
            $transaksiDetails = TransaksiDetail::with(['barang', 'transaksi', 'transaksi.user'])
                ->orderBy('created_at', 'asc')
                ->get();

            foreach ($transaksiDetails as $detail) {
                try {
                    if (!$detail->barang) {
                        $totalFailed++;
                        continue;
                    }

                    $barang = $detail->barang;
                    $qty = (int) $detail->qty;
                    $hargaBeli = (int) ($detail->hpp ?? 0);
                    $hargaBeliPerUnit = $qty > 0 ? (int) ($hargaBeli / $qty) : 0;
                    $createdAt = $detail->transaksi->created_at ?? $detail->created_at;
                    $userId = $detail->transaksi->user_id ?? null;

                    $result = ManageStok::reduceStok(
                        $barang->id,
                        $qty,
                        'out',
                        'penjualan',
                        $detail->transaksi->id ?? null,
                        "Penjualan",
                        $userId,
                        $hargaBeliPerUnit
                    );

                    // Update created_at to preserve original date
                    if ($result['success']) {
                        BarangStockMovement::where('id', $result['movement_id'])->update(['created_at' => $createdAt]);
                        BarangCostHistory::where('reference_id', null)
                            ->latest()
                            ->first()
                            ?->update(['created_at' => $createdAt]);
                    }

                    $totalProcessed++;
                    $this->line("   ✓ {$barang->deskripsi}: -{$qty} units ({$createdAt})");
                } catch (\Exception $e) {
                    $totalFailed++;
                    $this->warn("   ✗ Error: {$e->getMessage()}");
                }
            }

            // Step 4: Process RETUR (returns)
            $this->info('↩️  Step 4: Processing retur (returns)...');
            $returDetails = BarangReturDetail::with(['barang', 'barangRetur', 'barangRetur.user'])
                ->orderBy('created_at', 'asc')
                ->get();

            foreach ($returDetails as $detail) {
                try {
                    if (!$detail->barang) {
                        $totalFailed++;
                        continue;
                    }

                    $barang = $detail->barang;
                    $qty = (int) $detail->qty;
                    $hargaBeli = (int) $detail->harga_beli;
                    $hargaBeliPerUnit = $qty > 0 ? (int) ($hargaBeli / $qty) : 0;
                    $createdAt = $detail->barangRetur->created_at ?? $detail->created_at;
                    $userId = $detail->barangRetur->user_id ?? null;

                    $result = ManageStok::reduceStok(
                        $barang->id,
                        $qty,
                        'out',
                        'retur',
                        $detail->barangRetur->id ?? null,
                        "Retur",
                        $userId,
                        $hargaBeliPerUnit
                    );

                    // Update created_at to preserve original date
                    if ($result['success']) {
                        BarangStockMovement::where('id', $result['movement_id'])->update(['created_at' => $createdAt]);
                        BarangCostHistory::where('reference_id', null)
                            ->latest()
                            ->first()
                            ?->update(['created_at' => $createdAt]);
                    }

                    $totalProcessed++;
                    $this->line("   ✓ {$barang->deskripsi}: -{$qty} units (retur) ({$createdAt})");
                } catch (\Exception $e) {
                    $totalFailed++;
                    $this->warn("   ✗ Error: {$e->getMessage()}");
                }
            }

            // Step 5: Process OPNAME (stock audit)
            $this->info('📋 Step 5: Processing opname (stock audit)...');
            $opnames = Opname::with(['barang', 'user'])
                ->orderBy('created_at', 'asc')
                ->get();

            foreach ($opnames as $opname) {
                try {
                    if (!$opname->barang) {
                        $totalFailed++;
                        continue;
                    }

                    $barang = $opname->barang;
                    $selisih = (int) $opname->selisih;
                    $hargaBeli = (int) ($barang->harga_beli ?? 0);
                    $createdAt = $opname->created_at;
                    $userId = $opname->user_id ?? null;

                    if ($selisih > 0) {
                        $movementId = ManageStok::addStok(
                            $barang->id,
                            $selisih,
                            'in',
                            'opname',
                            $opname->id ?? null,
                            "Opname adjustment",
                            $userId,
                            $hargaBeli
                        );
                    } elseif ($selisih < 0) {
                        $result = ManageStok::reduceStok(
                            $barang->id,
                            abs($selisih),
                            'out',
                            'opname',
                            $opname->id ?? null,
                            "Opname adjustment",
                            $userId,
                            $hargaBeli
                        );
                        $movementId = $result['movement_id'] ?? null;
                    }

                    // Update created_at to preserve original date
                    if ($movementId ?? null) {
                        BarangStockMovement::where('id', $movementId)->update(['created_at' => $createdAt]);
                        BarangCostHistory::where('reference_id', null)
                            ->latest()
                            ->first()
                            ?->update(['created_at' => $createdAt]);
                    }

                    $totalProcessed++;
                    $this->line("   ✓ {$barang->deskripsi}: {$selisih} units (opname) ({$createdAt})");
                } catch (\Exception $e) {
                    $totalFailed++;
                    $this->warn("   ✗ Error: {$e->getMessage()}");
                }
            }

            DB::commit();

            // Summary
            $this->info("\n════════════════════════════════════════════════════════════════");
            $this->info("✅ RECOUNT COMPLETE");
            $this->info("════════════════════════════════════════════════════════════════");
            $this->info("📊 Summary:");
            $this->info("   • Transactions Processed: {$totalProcessed}");
            $this->info("   • Failed: {$totalFailed}");

            // Show stats
            $costHistoryCount = BarangCostHistory::count();
            $stockMovementCount = BarangStockMovement::count();
            $this->info("   • Cost History Records: {$costHistoryCount}");
            $this->info("   • Stock Movement Records: {$stockMovementCount}");

            return 0;

        } catch (\Exception $e) {
            DB::rollBack();
            $this->error("❌ Error: {$e->getMessage()}");
            return 1;
        }
    }
}
