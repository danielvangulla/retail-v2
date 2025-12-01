<?php

namespace App\Http\Controllers\FrontRetail;

use App\Http\Controllers\Controller;
use App\Models\Komplemen;
use App\Models\Transaksi;
use App\Models\TransaksiDetail;
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
                'komplemen_id' => 'required|string|exists:komplemens,id',
                'pin' => 'required|string',
                'items' => 'required|array', // Items dari frontend (selectedItems)
                'items.*.sku' => 'required|string',
                'items.*.qty' => 'required|numeric|min:1',
                'items.*.harga' => 'required|numeric',
                'items.*.brutto' => 'required|numeric',
                'netto' => 'required|numeric', // Total netto dari items
                'tax' => 'required|numeric',
                'service' => 'required|numeric',
                'bayar' => 'required|numeric',
            ]);

            // Cek SPV password
            $spv = User::where('level', 1)->first();

            if (!$spv || !Hash::check($validated['pin'], $spv->password)) {
                return response()->json([
                    'status' => 'error',
                    'msg' => 'Invalid Supervisor Password!',
                ], 403);
            }

            $user = Auth::user();

            // Create transaksi komplemen baru dengan data dari request (selectedItems)
            $komplemenTrx = Transaksi::create([
                'tgl' => now()->format('Y-m-d'),
                'jam_selesai' => now(),
                'meja' => '-',
                'brutto' => $validated['netto'], // Tidak ada disc untuk komplemen
                'disc_spv' => 0,
                'disc_promo' => 0,
                'netto' => $validated['netto'],
                'tax' => $validated['tax'],
                'service' => $validated['service'],
                'bayar' => $validated['bayar'],
                'payment' => 0, // Komplemen tidak ada pembayaran tunai
                'kembali' => 0, // Tidak ada kembalian
                'status' => 2, // PAID status
                'user_kasir_id' => $user->id,
                'user_spv_id' => $spv->id,
                'is_komplemen' => 1,
                'komplemen_id' => $validated['komplemen_id'],
            ]);

            // Create detail items dari request (bukan dari database)
            foreach ($validated['items'] as $item) {
                TransaksiDetail::create([
                    'transaksi_id' => $komplemenTrx->id,
                    'tgl' => now()->format('Y-m-d'),
                    'jam' => now(),
                    'no_co' => uniqid(),
                    'sku' => $item['sku'],
                    'qty' => $item['qty'],
                    'harga' => $item['harga'],
                    'brutto' => $item['brutto'],
                    'charge' => 0,
                    'disc_spv' => 0,
                    'disc_promo' => 0,
                    'nama_promo' => '',
                ]);
            }

            return response()->json([
                'status' => 'ok',
                'msg' => 'Komplemen berhasil diproses',
                'data' => $komplemenTrx,
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
