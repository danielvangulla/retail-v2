<?php

namespace App\Http\Controllers\FrontRetail;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Helpers;
use App\Models\Shift;
use App\Models\Transaksi;
use App\Models\TransaksiPayment;
use App\Models\TransaksiPaymentType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ShiftController extends Controller
{
    /**
     * Get current active shift for logged-in kasir.
     */
    public function current(): JsonResponse
    {
        $shift = Shift::where('kasir_id', Auth::id())
            ->where('is_closed', false)
            ->latest('open_time')
            ->first();

        return response()->json([
            'status' => 'ok',
            'shift' => $shift,
        ]);
    }

    /**
     * Open a new shift with initial cash balance.
     */
    public function open(Request $request): JsonResponse
    {
        $request->validate([
            'saldo_awal' => 'required|numeric|min:0',
        ]);

        // Close any previously unclosed shift for this kasir
        Shift::where('kasir_id', Auth::id())
            ->where('is_closed', false)
            ->update(['is_closed' => true, 'close_time' => now()]);

        $shift = Shift::create([
            'kasir_id' => Auth::id(),
            'open_time' => now(),
            'saldo_awal' => $request->saldo_awal,
            'is_closed' => false,
        ]);

        return response()->json([
            'status' => 'ok',
            'shift' => $shift,
            'message' => 'Shift dibuka',
        ]);
    }

    /**
     * Close the current shift and calculate totals from transactions during the shift.
     */
    public function close(Request $request): JsonResponse
    {
        $shift = Shift::where('kasir_id', Auth::id())
            ->where('is_closed', false)
            ->latest('open_time')
            ->first();

        if (! $shift) {
            return response()->json([
                'status' => 'error',
                'message' => 'Tidak ada shift yang aktif',
            ], 404);
        }

        // Aggregate transactions during this shift for this kasir
        $totals = Transaksi::where('user_kasir_id', Auth::id())
            ->where('is_cancel', 0)
            ->where('status', '!=', 0)
            ->where('jam_selesai', '>=', $shift->open_time)
            ->selectRaw('
                COUNT(*) as jumlah_transaksi,
                SUM(bayar) as total_penjualan
            ')
            ->first();

        // Breakdown by payment type (tunai vs non-tunai)
        $tunaiTypeIds = TransaksiPaymentType::where('ket', 'LIKE', '%tunai%')
            ->orWhere('ket', 'LIKE', '%cash%')
            ->pluck('id');

        $totalTunai = TransaksiPayment::whereIn('transaksi_id',
            Transaksi::where('user_kasir_id', Auth::id())
                ->where('is_cancel', 0)
                ->where('status', '!=', 0)
                ->where('jam_selesai', '>=', $shift->open_time)
                ->select('id')
        )
            ->whereIn('type_id', $tunaiTypeIds)
            ->sum('nominal');

        $totalPenjualan = (float) ($totals->total_penjualan ?? 0);
        $totalTunai = (float) $totalTunai;
        $totalNontunai = $totalPenjualan - $totalTunai;

        $shift->update([
            'close_time' => now(),
            'total_penjualan' => $totalPenjualan,
            'total_tunai' => $totalTunai,
            'total_nontunai' => max(0, $totalNontunai),
            'jumlah_transaksi' => (int) ($totals->jumlah_transaksi ?? 0),
            'saldo_akhir' => (float) $request->input('saldo_akhir', $shift->saldo_awal + $totalTunai),
            'keterangan' => $request->input('keterangan', ''),
            'is_closed' => true,
        ]);

        return response()->json([
            'status' => 'ok',
            'shift' => $shift->fresh(['kasir']),
            'message' => 'Shift ditutup',
        ]);
    }

    /**
     * Get shift summary for close-shift preview (before confirming close).
     */
    public function summary(): JsonResponse
    {
        $shift = Shift::where('kasir_id', Auth::id())
            ->where('is_closed', false)
            ->latest('open_time')
            ->first();

        if (! $shift) {
            return response()->json(['status' => 'error', 'message' => 'Tidak ada shift aktif'], 404);
        }

        // Transactions during this shift
        $transaksis = Transaksi::with(['payments', 'payments.type'])
            ->where('user_kasir_id', Auth::id())
            ->where('is_cancel', 0)
            ->where('status', '!=', 0)
            ->where('jam_selesai', '>=', $shift->open_time)
            ->get();

        $totalPenjualan = $transaksis->sum('bayar');

        // Group by payment type
        $byType = [];
        foreach ($transaksis as $trx) {
            foreach ($trx->payments as $payment) {
                $typeName = $payment->type->ket ?? 'Lainnya';
                if (! isset($byType[$typeName])) {
                    $byType[$typeName] = 0;
                }
                $byType[$typeName] += $payment->nominal;
            }
        }

        return response()->json([
            'status' => 'ok',
            'shift' => $shift,
            'summary' => [
                'jumlah_transaksi' => $transaksis->count(),
                'total_penjualan' => $totalPenjualan,
                'by_payment_type' => $byType,
            ],
        ]);
    }

    /**
     * Render print view for a closed shift.
     */
    public function print(string $shiftId): Response
    {
        $shift = Shift::with(['kasir'])->findOrFail($shiftId);

        $setup = Helpers::getSetup('perusahaan');
        if (! $setup) {
            $setup = (object) [
                'nama' => 'TOKO',
                'alamat1' => '',
                'alamat2' => '',
            ];
        }

        // Transactions during this shift
        $transaksis = Transaksi::with(['payments', 'payments.type'])
            ->where('user_kasir_id', $shift->kasir_id)
            ->where('is_cancel', 0)
            ->where('status', '!=', 0)
            ->where('jam_selesai', '>=', $shift->open_time)
            ->when($shift->close_time, fn ($q) => $q->where('jam_selesai', '<=', $shift->close_time))
            ->orderBy('jam_selesai')
            ->get();

        $byType = [];
        foreach ($transaksis as $trx) {
            foreach ($trx->payments as $payment) {
                $typeName = $payment->type->ket ?? 'Lainnya';
                if (! isset($byType[$typeName])) {
                    $byType[$typeName] = 0;
                }
                $byType[$typeName] += $payment->nominal;
            }
        }

        return Inertia::render('Kasir/PrintShift', [
            'shift' => $shift,
            'setup' => $setup,
            'summary' => [
                'jumlah_transaksi' => $transaksis->count(),
                'total_penjualan' => $shift->total_penjualan,
                'by_payment_type' => $byType,
            ],
        ]);
    }
}
