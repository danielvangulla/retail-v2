<?php

namespace App\Traits;

use App\Models\Barang;
use App\Models\BarangStock;
use App\Models\BarangStockMovement;
use App\Models\BarangCostHistory;
use App\Events\StockUpdated;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

trait ManageStok
{
    /**
     * Helper: Calculate weighted average cost (rounded to integer)
     * @return int Rounded average cost
     */
    private static function calculateWeightedAverage($quantityBefore, $costBefore, $quantityNew, $costNew): int
    {
        if ($quantityBefore + $quantityNew <= 0) {
            return 0;
        }

        $totalCost = ($quantityBefore * $costBefore) + ($quantityNew * $costNew);
        $totalQty = $quantityBefore + $quantityNew;

        // Bulatkan ke integer (round up untuk fairness)
        return (int) ceil($totalCost / $totalQty);
    }

    /**
     * Helper: Record cost history jika ada perubahan
     */
    private static function recordCostHistory($barangId, $hargaLama, $hargaBaru, $triggerType, $referenceId, $referenceType, $notes, $userId)
    {
        // Hanya record jika ada perubahan
        if ($hargaLama !== $hargaBaru) {
            BarangCostHistory::create([
                'barang_id' => $barangId,
                'harga_rata_rata_lama' => (int) $hargaLama,
                'harga_rata_rata_baru' => (int) $hargaBaru,
                'trigger_type' => $triggerType,
                'reference_id' => $referenceId,
                'reference_type' => $referenceType,
                'notes' => $notes,
                'changed_by' => $userId,
            ]);

            Log::info('Cost history recorded', [
                'barang_id' => $barangId,
                'harga_lama' => $hargaLama,
                'harga_baru' => $hargaBaru,
                'trigger' => $triggerType,
            ]);
        }
    }

    /**
     * Tambah stok masuk (pembelian, retur dari pelanggan, dll)
     * Dengan weighted average cost calculation (integer, no decimal)
     * @return string|bool Movement ID jika sukses, false jika gagal
     */
    public static function addStok($barangId, int $qty, string $type = 'in', string $referenceType = '', string $referenceId = '', string $notes = '', $userId = null, $hargaBeli = null)
    {
        return DB::transaction(function () use ($barangId, $qty, $type, $referenceType, $referenceId, $notes, $userId, $hargaBeli) {
            // Lock row untuk mencegah race condition
            $stock = BarangStock::lockForUpdate()
                ->where('barang_id', $barangId)
                ->firstOrFail();

            $quantityBefore = $stock->quantity;
            $quantityAfter = $quantityBefore + $qty;
            $hargaRatarataLama = $stock->harga_rata_rata ?? 0;

            // Calculate new weighted average cost (only if type = 'in')
            $hargaBeli = $hargaBeli ?? 0;
            $hargaRatarataBaruCalculated = ($quantityBefore > 0 && $type === 'in')
                ? self::calculateWeightedAverage($quantityBefore, $hargaRatarataLama, $qty, (int) $hargaBeli)
                : $hargaRatarataLama;

            // Update stok with new average cost
            $stock->update([
                'quantity' => $quantityAfter,
                'harga_rata_rata' => $hargaRatarataBaruCalculated,
                'harga_rata_rata_updated_at' => now(),
                'last_updated_at' => now(),
            ]);

            // Catat movement history
            $movement = BarangStockMovement::create([
                'barang_id' => $barangId,
                'type' => $type,
                'quantity' => $qty,
                'quantity_before' => $quantityBefore,
                'quantity_after' => $quantityAfter,
                'reference_type' => $referenceType,
                'reference_id' => $referenceId,
                'notes' => $notes,
                'user_id' => $userId,
                'movement_date' => now(),
                'harga_beli' => (int) $hargaBeli,
            ]);

            // Record cost history jika ada perubahan
            if ($type === 'in' && $hargaRatarataBaruCalculated !== $hargaRatarataLama) {
                self::recordCostHistory(
                    $barangId,
                    $hargaRatarataLama,
                    $hargaRatarataBaruCalculated,
                    'pembelian',
                    $referenceId,
                    $referenceType,
                    "Pembelian {$qty} unit @ Rp {$hargaBeli}",
                    $userId
                );
            }

            // Clear cache
            self::clearStockCache($barangId);

            Log::info('Stock added', [
                'barang_id' => $barangId,
                'qty' => $qty,
                'type' => $type,
                'harga_beli' => $hargaBeli,
                'harga_rata_rata_baru' => $hargaRatarataBaruCalculated,
                'reference_id' => $referenceId,
                'movement_id' => $movement->id,
            ]);

            // Broadcast stock update event
            event(new StockUpdated($barangId, $quantityAfter, 'in'));

            return $movement->id;
        }, attempts: 3); // Retry 3x jika terjadi deadlock
    }

    /**
     * Kurangi stok keluar (penjualan, expire, dll)
     * Dengan validasi stok cukup dan lock untuk mencegah overselling
     */
    public static function reduceStok($barangId, int $qty, string $type = 'out', string $referenceType = '', string $referenceId = '', string $notes = '', $userId = null, $hargaBeli = null, $hargaJual = null): array
    {
        return DB::transaction(function () use ($barangId, $qty, $type, $referenceType, $referenceId, $notes, $userId, $hargaBeli, $hargaJual) {
            // Lock row untuk mencegah race condition
            $stock = BarangStock::lockForUpdate()
                ->where('barang_id', $barangId)
                ->firstOrFail();

            $barang = Barang::find($barangId);
            $available = $stock->quantity - $stock->reserved;

            // Validasi stok cukup - tapi izinkan jika allow_sold_zero_stock = true
            if ($available < $qty && !($barang && $barang->allow_sold_zero_stock)) {
                return [
                    'success' => false,
                    'message' => "Stok tidak mencukupi. Available: {$available}, Requested: {$qty}",
                    'available' => $available,
                    'requested' => $qty,
                ];
            }

            $quantityBefore = $stock->quantity;
            $quantityAfter = $quantityBefore - $qty;
            $hargaRatarataLama = $stock->harga_rata_rata ?? 0;

            // Update stok (gunakan weighted average cost untuk HPP)
            $stock->update([
                'quantity' => max(0, $quantityAfter),
                'last_updated_at' => now(),
            ]);

            // Catat movement history dengan weighted average cost
            $movement = BarangStockMovement::create([
                'barang_id' => $barangId,
                'type' => $type,
                'quantity' => $qty,
                'quantity_before' => $quantityBefore,
                'quantity_after' => max(0, $quantityAfter),
                'reference_type' => $referenceType,
                'reference_id' => $referenceId,
                'notes' => $notes,
                'user_id' => $userId,
                'movement_date' => now(),
                'harga_beli' => (int) $hargaRatarataLama, // Use weighted average for COGS
                'harga_jual' => (int) $hargaJual,
            ]);

            // Clear cache
            self::clearStockCache($barangId);

            Log::info('Stock reduced', [
                'barang_id' => $barangId,
                'qty' => $qty,
                'type' => $type,
                'harga_rata_rata_hpp' => $hargaRatarataLama,
                'reference_id' => $referenceId,
                'movement_id' => $movement->id,
            ]);

            // Broadcast stock update event
            event(new StockUpdated($barangId, max(0, $quantityAfter), 'out'));

            return [
                'success' => true,
                'message' => 'Stok berhasil dikurangi',
                'remaining' => max(0, $quantityAfter),
                'movement_id' => $movement->id,
            ];
        }, attempts: 3);
    }

    /**
     * Reserve stok untuk pending order (belum final)
     * Jika allow_sold_zero_stock=true, izinkan reserve meskipun available < qty
     */
    public static function reserveStok($barangId, int $qty, string $referenceId = null, $allowSoldZeroStock = false): array
    {
        return DB::transaction(function () use ($barangId, $qty, $referenceId, $allowSoldZeroStock) {
            $stock = BarangStock::lockForUpdate()
                ->where('barang_id', $barangId)
                ->firstOrFail();

            $available = $stock->quantity - $stock->reserved;

            // Validasi hanya jika allow_sold_zero_stock = false
            if ($available < $qty && !$allowSoldZeroStock) {
                return [
                    'success' => false,
                    'message' => "Tidak bisa reserve. Available: {$available}, Requested: {$qty}",
                ];
            }

            $stock->update([
                'reserved' => $stock->reserved + $qty,
                'last_updated_at' => now(),
            ]);

            return [
                'success' => true,
                'message' => 'Stok berhasil di-reserve',
            ];
        }, attempts: 3);
    }

    /**
     * Release reserve stok
     */
    public static function releaseReservedStok($barangId, int $qty): array
    {
        return DB::transaction(function () use ($barangId, $qty) {
            $stock = BarangStock::lockForUpdate()
                ->where('barang_id', $barangId)
                ->firstOrFail();

            $stock->update([
                'reserved' => max(0, $stock->reserved - $qty),
                'last_updated_at' => now(),
            ]);

            return [
                'success' => true,
                'message' => 'Reserve stok berhasil di-release',
            ];
        }, attempts: 3);
    }

    /**
     * Adjustment stok (opname, dll)
     */
    public static function adjustStok($barangId, int $newQuantity, string $notes = '', $userId = null): bool
    {
        return DB::transaction(function () use ($barangId, $newQuantity, $notes, $userId) {
            $stock = BarangStock::lockForUpdate()
                ->where('barang_id', $barangId)
                ->firstOrFail();

            $quantityBefore = $stock->quantity;
            $adjustment = $newQuantity - $quantityBefore;

            $stock->update([
                'quantity' => max(0, $newQuantity),
                'last_updated_at' => now(),
            ]);

            // Catat adjustment
            BarangStockMovement::create([
                'barang_id' => $barangId,
                'type' => 'adjustment',
                'quantity' => abs($adjustment),
                'quantity_before' => $quantityBefore,
                'quantity_after' => max(0, $newQuantity),
                'reference_type' => 'adjustment',
                'notes' => $notes,
                'user_id' => $userId,
                'movement_date' => now(),
            ]);

            self::clearStockCache($barangId);

            return true;
        }, attempts: 3);
    }

    /**
     * Get current stok dengan cache
     */
    public static function getStok($barangId): ?BarangStock
    {
        $cacheKey = "barang_stok_{$barangId}";

        return Cache::remember($cacheKey, 3600, function () use ($barangId) {
            return BarangStock::where('barang_id', $barangId)
                ->with(['barang:id,deskripsi,satuan,min_stock'])
                ->first();
        });
    }

    /**
     * Get available stok (quantity - reserved)
     */
    public static function getAvailableStok($barangId): int
    {
        $stock = self::getStok($barangId);
        return $stock ? max(0, $stock->quantity - $stock->reserved) : 0;
    }

    /**
     * Check stok cukup
     */
    public static function isStokAvailable($barangId, int $qty): bool
    {
        return self::getAvailableStok($barangId) >= $qty;
    }

    /**
     * Get stok rendah
     */
    public static function getLowStockItems($limit = 10): array
    {
        return BarangStock::join('barang', 'barang_stock.barang_id', '=', 'barang.id')
            ->whereRaw('barang_stock.quantity - barang_stock.reserved < barang.min_stock')
            ->select([
                'barang.id',
                'barang.deskripsi',
                'barang.satuan',
                'barang.min_stock',
                'barang.harga_jual1',
                'barang_stock.quantity',
                'barang_stock.reserved',
                DB::raw('(barang_stock.quantity - barang_stock.reserved) as available'),
            ])
            ->orderBy('available', 'asc')
            ->limit($limit)
            ->get()
            ->toArray();
    }

    /**
     * Clear stock cache
     */
    public static function clearStockCache($barangId): void
    {
        Cache::forget("barang_stok_{$barangId}");
    }

    /**
     * Get stok history untuk kartu stok
     */
    public static function getStokHistory($barangId, $limit = 50): array
    {
        return BarangStockMovement::where('barang_id', $barangId)
            ->with(['user:id,name'])
            ->orderBy('movement_date', 'desc')
            ->limit($limit)
            ->get()
            ->toArray();
    }
}
