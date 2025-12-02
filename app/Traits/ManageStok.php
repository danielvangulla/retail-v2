<?php

namespace App\Traits;

use App\Models\BarangStock;
use App\Models\BarangStockMovement;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

trait ManageStok
{
    /**
     * Tambah stok masuk (pembelian, retur dari pelanggan, dll)
     * Dengan transaction dan lock untuk mencegah race condition
     */
    public static function addStok($barangId, int $qty, string $type = 'in', string $referenceType = null, string $referenceId = null, string $notes = null, $userId = null): bool
    {
        return DB::transaction(function () use ($barangId, $qty, $type, $referenceType, $referenceId, $notes, $userId) {
            // Lock row untuk mencegah race condition
            $stock = BarangStock::lockForUpdate()
                ->where('barang_id', $barangId)
                ->firstOrFail();

            $quantityBefore = $stock->quantity;
            $quantityAfter = $quantityBefore + $qty;

            // Update stok
            $stock->update([
                'quantity' => $quantityAfter,
                'last_updated_at' => now(),
            ]);

            // Catat movement history
            BarangStockMovement::create([
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
            ]);

            // Clear cache
            self::clearStockCache($barangId);

            Log::info('Stock added', [
                'barang_id' => $barangId,
                'qty' => $qty,
                'type' => $type,
                'reference_id' => $referenceId,
            ]);

            return true;
        }, attempts: 3); // Retry 3x jika terjadi deadlock
    }

    /**
     * Kurangi stok keluar (penjualan, expire, dll)
     * Dengan validasi stok cukup dan lock untuk mencegah overselling
     */
    public static function reduceStok($barangId, int $qty, string $type = 'out', string $referenceType = null, string $referenceId = null, string $notes = null, $userId = null): array
    {
        return DB::transaction(function () use ($barangId, $qty, $type, $referenceType, $referenceId, $notes, $userId) {
            // Lock row untuk mencegah race condition
            $stock = BarangStock::lockForUpdate()
                ->where('barang_id', $barangId)
                ->firstOrFail();

            $available = $stock->quantity - $stock->reserved;

            // Validasi stok cukup
            if ($available < $qty) {
                return [
                    'success' => false,
                    'message' => "Stok tidak mencukupi. Available: {$available}, Requested: {$qty}",
                    'available' => $available,
                    'requested' => $qty,
                ];
            }

            $quantityBefore = $stock->quantity;
            $quantityAfter = $quantityBefore - $qty;

            // Update stok
            $stock->update([
                'quantity' => max(0, $quantityAfter),
                'last_updated_at' => now(),
            ]);

            // Catat movement history
            BarangStockMovement::create([
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
            ]);

            // Clear cache
            self::clearStockCache($barangId);

            Log::info('Stock reduced', [
                'barang_id' => $barangId,
                'qty' => $qty,
                'type' => $type,
                'reference_id' => $referenceId,
            ]);

            return [
                'success' => true,
                'message' => 'Stok berhasil dikurangi',
                'remaining' => max(0, $quantityAfter),
            ];
        }, attempts: 3);
    }

    /**
     * Reserve stok untuk pending order (belum final)
     */
    public static function reserveStok($barangId, int $qty, string $referenceId = null): array
    {
        return DB::transaction(function () use ($barangId, $qty, $referenceId) {
            $stock = BarangStock::lockForUpdate()
                ->where('barang_id', $barangId)
                ->firstOrFail();

            $available = $stock->quantity - $stock->reserved;

            if ($available < $qty) {
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
    public static function adjustStok($barangId, int $newQuantity, string $notes = null, $userId = null): bool
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
