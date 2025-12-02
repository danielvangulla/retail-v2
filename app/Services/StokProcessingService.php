<?php

namespace App\Services;

use App\Models\PembelianDet;
use App\Models\BarangReturDetail;
use App\Models\Barang;
use App\Traits\ManageStok;
use Illuminate\Support\Facades\Log;

class StokProcessingService
{
    use ManageStok;

    /**
     * Process unprocessed pembelian details (add stock)
     */
    public static function processUnprocessedPembelian()
    {
        $unprocessed = PembelianDet::where('stok_processed', false)
            ->with('pembelian', 'pembelian.user')
            ->get();

        foreach ($unprocessed as $detail) {
            $barang = Barang::find($detail->sku);
            if ($barang) {
                try {
                    $movementId = ManageStok::addStok(
                        $barang->id,
                        $detail->qty,
                        'in',
                        'pembelian',
                        $detail->pembelian_id,
                        'Pembelian #' . $detail->pembelian_id . ' (Reprocessed)',
                        $detail->pembelian->user_id
                    );
                    $detail->update([
                        'stok_processed' => true,
                        'kartu_stok_id' => $movementId,
                    ]);
                } catch (\Exception $e) {
                    // Log error but continue
                    Log::error('Failed to process pembelian detail: ' . $e->getMessage(), [
                        'detail_id' => $detail->id,
                        'barang_id' => $barang->id
                    ]);
                }
            }
        }

        return $unprocessed->count();
    }

    /**
     * Process unprocessed retur details (reduce stock)
     */
    public static function processUnprocessedRetur()
    {
        $unprocessed = BarangReturDetail::where('stok_processed', false)
            ->with('retur', 'retur.user')
            ->get();

        foreach ($unprocessed as $detail) {
            try {
                $result = ManageStok::reduceStok(
                    $detail->barang_id,
                    $detail->qty,
                    'out',
                    'retur',
                    $detail->barang_retur_id,
                    'Retur #' . $detail->barang_retur_id . ' (Reprocessed)',
                    $detail->retur->user_id
                );
                if ($result['success']) {
                    $detail->update([
                        'stok_processed' => true,
                        'kartu_stok_id' => $result['movement_id'],
                    ]);
                }
            } catch (\Exception $e) {
                // Log error but continue
                Log::error('Failed to process retur detail: ' . $e->getMessage(), [
                    'detail_id' => $detail->id,
                    'barang_id' => $detail->barang_id
                ]);
            }
        }

        return $unprocessed->count();
    }

    /**
     * Process all unprocessed items
     */
    public static function processAll()
    {
        $pembelian_count = self::processUnprocessedPembelian();
        $retur_count = self::processUnprocessedRetur();

        return [
            'pembelian_processed' => $pembelian_count,
            'retur_processed' => $retur_count,
            'total_processed' => $pembelian_count + $retur_count
        ];
    }
}
