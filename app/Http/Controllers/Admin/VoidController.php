<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Barang;
use App\Models\BarangStock;
use App\Models\Transaksi;
use App\Models\TransaksiDetail;
use App\Models\TransaksiVoid;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class VoidController extends Controller
{
    /**
     * Halaman utama void transaksi (SPV + Admin).
     * Menampilkan form cari transaksi + daftar transaksi hari ini yang bisa di-void.
     */
    public function index(): Response
    {
        return Inertia::render('admin/Void/Index');
    }

    /**
     * API: Ambil daftar transaksi yang belum di-void (untuk pencarian SPV).
     */
    public function transactions(Request $request): JsonResponse
    {
        $query = Transaksi::query()
            ->with(['kasir:id,name', 'details.barang:id,deskripsi,sku'])
            ->where('is_cancel', 0)
            ->where('status', '!=', 0);

        if ($request->date) {
            $query->whereDate('tgl', $request->date);
        } else {
            // Default: transaksi hari ini
            $query->whereDate('tgl', Carbon::today());
        }

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('meja', 'LIKE', "%{$request->search}%")
                  ->orWhereHas('kasir', function ($q2) use ($request) {
                      $q2->where('name', 'LIKE', "%{$request->search}%");
                  });
            });
        }

        $transaksis = $query->orderByDesc('created_at')->paginate(20);

        return response()->json([
            'status' => 'ok',
            'data' => $transaksis,
        ]);
    }

    /**
     * Proses void transaksi oleh SPV.
     * Menandai transaksi sebagai dibatalkan dan mengembalikan stok.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'transaksi_id' => 'required|exists:transaksis,id',
            'alasan' => 'required|string|max:250',
        ]);

        $transaksi = Transaksi::with('details')->find($validated['transaksi_id']);

        if (!$transaksi) {
            return response()->json(['status' => 'error', 'msg' => 'Transaksi tidak ditemukan'], 404);
        }

        if ($transaksi->is_cancel) {
            return response()->json(['status' => 'error', 'msg' => 'Transaksi sudah di-void sebelumnya'], 422);
        }

        try {
            DB::transaction(function () use ($transaksi, $validated) {
                $spvId = Auth::id();
                $now = now();

                // Tandai transaksi sebagai di-cancel (void)
                $transaksi->update([
                    'is_cancel' => 1,
                    'cancel_note' => $validated['alasan'],
                    'user_spv_id' => $spvId,
                ]);

                // Buat record void per detail item & kembalikan stok
                foreach ($transaksi->details as $detail) {
                    TransaksiVoid::create([
                        'transaksi_id' => $transaksi->id,
                        'tgl' => $transaksi->tgl,
                        'jam' => $now,
                        'no_co' => $transaksi->meja ?? '',
                        'sku' => $detail->sku,
                        'qty' => $detail->qty,
                        'harga' => $detail->harga,
                        'brutto' => $detail->brutto,
                        'disc_spv' => $detail->disc_spv,
                        'disc_promo' => $detail->disc_promo,
                        'netto' => $detail->netto,
                        'service' => $detail->service,
                        'tax' => $detail->tax,
                        'bayar' => $detail->bayar,
                        'user_order_id' => $detail->user_order_id,
                        'user_void_id' => $spvId,
                        'user_spv_id' => $spvId,
                        'alasan' => $validated['alasan'],
                    ]);

                    // Kembalikan stok barang
                    if ($detail->sku && $detail->qty > 0) {
                        try {
                            BarangStock::addStok(
                                $detail->sku,
                                (int) $detail->qty,
                                'in',
                                'void_transaksi',
                                $transaksi->id,
                                "Restore stok akibat void transaksi oleh SPV",
                                $spvId
                            );
                        } catch (\Exception $e) {
                            Log::warning("Restore stock gagal saat void transaksi {$transaksi->id} barang {$detail->sku}: " . $e->getMessage());
                        }
                    }
                }
            });

            return response()->json([
                'status' => 'ok',
                'msg' => 'Transaksi berhasil di-void dan stok telah dikembalikan',
            ]);
        } catch (\Exception $e) {
            Log::error("Void transaksi gagal: " . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'msg' => 'Gagal memvoid transaksi: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Halaman laporan void (SPV + Admin).
     */
    public function report(): Response
    {
        return Inertia::render('admin/Report/Void');
    }

    /**
     * API: Data laporan void dengan filter tanggal.
     */
    public function reportData(Request $request): JsonResponse
    {
        $query = Transaksi::query()
            ->with(['kasir:id,name', 'spv:id,name', 'details.barang:id,deskripsi'])
            ->where('is_cancel', 1);

        if ($request->date_from && $request->date_to) {
            $from = Carbon::parse($request->date_from)->startOfDay();
            $to = Carbon::parse($request->date_to)->endOfDay();
            $query->whereBetween('created_at', [$from, $to]);
        } elseif ($request->date_from) {
            $query->whereDate('tgl', '>=', $request->date_from);
        } else {
            // Default: bulan ini
            $query->whereMonth('tgl', Carbon::now()->month)
                  ->whereYear('tgl', Carbon::now()->year);
        }

        if ($request->user_id) {
            $query->where('user_kasir_id', $request->user_id);
        }

        $data = $query->orderByDesc('created_at')->paginate(20);

        $summary = Transaksi::query()
            ->where('is_cancel', 1)
            ->when($request->date_from, fn ($q) => $q->whereDate('tgl', '>=', $request->date_from))
            ->when($request->date_to, fn ($q) => $q->whereDate('tgl', '<=', $request->date_to))
            ->selectRaw('COUNT(*) as total_void, SUM(bayar) as total_nilai')
            ->first();

        return response()->json([
            'status' => 'ok',
            'data' => $data,
            'summary' => $summary,
        ]);
    }
}
