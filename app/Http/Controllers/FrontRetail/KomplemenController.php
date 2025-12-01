<?php

namespace App\Http\Controllers\FrontRetail;

use App\Http\Controllers\Controller;
use App\Models\Komplemen;
use App\Models\Transaksi;
use App\Models\TransaksiPayment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class KomplemenController extends Controller
{
    /**
     * Get list of active komplemen
     */
    public function list()
    {
        try {
            $komplemen = Komplemen::select('id', 'name')
                ->where('is_aktif', 1)
                ->orderBy('name')
                ->get();

            if ($komplemen->isEmpty()) {
                return response()->json([
                    'status' => 'error',
                    'msg' => 'Fitur Komplemen tidak diijinkan di Outlet ini.',
                ], 404);
            }

            return response()->json([
                'status' => 'ok',
                'data' => $komplemen,
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'msg' => 'Server Error: Komplemen List',
            ], 500);
        }
    }

    /**
     * Process komplemen untuk transaksi
     */
    public function proses(Request $request)
    {
        try {
            $validated = $request->validate([
                'transaksi_id' => 'required|string|exists:transaksis,id',
                'komplemen_id' => 'required|string|exists:komplemens,id',
                'pin' => 'required|string',
            ]);

            // Cek SPV password
            $spv = User::where('level', 1)->first();

            if (!$spv || !Hash::check($validated['pin'], $spv->password)) {
                return response()->json([
                    'status' => 'error',
                    'msg' => 'Invalid Supervisor Password!',
                ], 403);
            }

            // Get transaksi
            $trx = Transaksi::findOrFail($validated['transaksi_id']);

            // Delete existing payment records
            TransaksiPayment::where('transaksi_id', $trx->id)->delete();

            // Update transaksi as komplemen
            $user = Auth::user();
            $trx->update([
                'jam_selesai' => now(),
                'kembali' => 0,
                'is_piutang' => 0,
                'piutang_id' => null,
                'is_komplemen' => 1,
                'komplemen_id' => $validated['komplemen_id'],
                'status' => 2, // PAID status
                'user_kasir_id' => $user->id,
                'user_spv_id' => $spv->id,
            ]);

            return response()->json([
                'status' => 'ok',
                'msg' => 'Komplemen berhasil diproses',
                'data' => $trx,
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'msg' => 'Validation error',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'msg' => 'Server Error: ' . $th->getMessage(),
            ], 500);
        }
    }

    /**
     * Get detail transaksi untuk komplemen modal
     */
    public function detail($id)
    {
        try {
            $trx = Transaksi::with([
                'details',
                'details.barang',
            ])->find($id);

            if (!$trx) {
                return response()->json([
                    'status' => 'error',
                    'msg' => 'Transaksi tidak ditemukan',
                ], 404);
            }

            return response()->json([
                'status' => 'ok',
                'data' => [
                    'id' => $trx->id,
                    'netto' => $trx->netto,
                    'tax' => $trx->tax,
                    'service' => $trx->service,
                    'bayar' => $trx->bayar,
                    'details' => $trx->details->map(fn ($detail) => [
                        'sku' => $detail->sku,
                        'qty' => $detail->qty,
                        'harga_dasar' => $detail->harga_dasar,
                        'disc_item' => $detail->disc_item,
                        'subtotal' => $detail->subtotal,
                        'barang' => $detail->barang ? [
                            'id' => $detail->barang->id,
                            'deskripsi' => $detail->barang->deskripsi,
                            'alias' => $detail->barang->alias,
                        ] : null,
                    ])->all(),
                ],
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'msg' => 'Server Error: ' . $th->getMessage(),
            ], 500);
        }
    }

    /**
     * Finish komplemen process - untuk print bill dan final confirm
     */
    public function finish($id)
    {
        try {
            $trx = Transaksi::find($id);

            if (!$trx) {
                return response()->json([
                    'status' => 'error',
                    'msg' => 'Transaksi tidak ditemukan',
                ], 404);
            }

            if (!$trx->is_komplemen) {
                return response()->json([
                    'status' => 'error',
                    'msg' => 'Transaksi bukan komplemen',
                ], 400);
            }

            return response()->json([
                'status' => 'ok',
                'msg' => 'Komplemen selesai',
                'data' => $trx,
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'msg' => 'Server Error: ' . $th->getMessage(),
            ], 500);
        }
    }
}
