<?php

namespace App\Http\Controllers\FrontRetail;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Helpers;
use App\Models\Barang;
use App\Models\Meja;
use App\Models\PiutangBayar;
use App\Models\Transaksi;
use App\Models\TransaksiDetail;
use App\Models\TransaksiPayment;
use App\Models\TransaksiPaymentType;
use App\Models\User;
use App\Events\DashboardUpdated;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class KasirController extends Controller
{
    public function printBill($trxId = '')
    {
        try {
            if ($trxId === '') {
                $trx = Transaksi::getLastTrxByKasir();
            } else {
                $trx = Transaksi::with([
                    'payments',
                    'payments.type',
                    'details',
                    'details.barang',
                    'piutang',
                    'komplemen',
                    'kasir'
                ])->find($trxId);
            }

            if ($trx && isset($trx->piutang) && $trx->piutang->is_staff) {
                $terpakai = 0;

                foreach ($trx->piutang->transaksis as $v) {
                    $terpakai += $v->bayar;
                }

                $trx->piutang->deposit_sisa = $v->piutang->deposit - $terpakai;
            }

            $setup = Helpers::getSetup('perusahaan');

            // Provide fallback setup if null
            if (!$setup) {
                $setup = (object) [
                    'nama' => 'TOKO',
                    'alamat1' => 'Alamat Toko',
                    'alamat2' => 'Kota'
                ];
            }

            return Inertia::render('Kasir/PrintBill', [
                'trx' => $trx,
                'setup' => $setup,
            ]);
        } catch (\Throwable $th) {
            $fallbackSetup = (object) [
                'nama' => 'TOKO',
                'alamat1' => 'Alamat Toko',
                'alamat2' => 'Kota'
            ];

            return Inertia::render('Kasir/PrintBill', [
                'trx' => null,
                'setup' => $fallbackSetup,
            ]);
        }
    }

    public function index()
    {
        $macId = (object) Helpers::macId();
        if ($macId->status !== "registered.") {
            return response()->json($macId, 403);
        }

        $paymentTypes = TransaksiPaymentType::orderBy("urutan")->orderBy("ket")->get();

        $keysArray = [
            ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
            ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
            ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
            ["z", "x", "c", "v", "b", "n", "m", ",", ".", "-"],
        ];

        // Get last transaction ID for this kasir
        $lastTrx = Transaksi::getLastTrxByKasir();
        $lastTrxId = $lastTrx ? $lastTrx->id : '';

        return Inertia::render('Kasir/Index', [
            'paymentTypes' => $paymentTypes,
            'keysArray' => $keysArray,
            'lastTrxId' => $lastTrxId,
        ]);
    }

    public function store(Request $r)
    {
        if (!$r->state) {
            return response()->json([
                'status' => 'error',
                'msg' => 'Akses ditolak !'
            ], 403);
        }

        try {
            $data = (object) $r->validate([
                'items' => 'required',
                'discSpv' => 'numeric',
                'discPromo' => 'numeric',
                'charge' => 'numeric',
                'total' => 'required | numeric',
                'bayar' => 'required | numeric',
                'typeId' => '',
                'memberId' => '',
            ], Helpers::customErrorMsg());
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'msg' => $e->getMessage()
            ], 422);
        }

        // Full Payment
        if ($r->state === 'full') {
            $trxId = $this->setTransaksi($data);
            $this->setTransaksiPayment($data, $trxId);
            $this->setTransaksiDetails($data, $trxId);

            // Broadcast dashboard update
            event(new DashboardUpdated(['trxId' => $trxId, 'bayar' => $data->bayar], 'transaction'));

            return response()->json([
                'status' => 'ok',
                'msg' => '-',
                'trxId' => $trxId,
                'tgl' => Helpers::transactionDate(),
            ], 200);
        }

        // Pending Payment
        if ($r->state === 'piutang') {
            // $spv = User::where('pin', $r->pin)->where('level', 1)->first();
            // if (!$spv) {
            //     return response()->json([
            //         "status" => "error",
            //         "msg" => "Invalid PIN Supervisor..!",
            //     ], 403);
            // }

            $trxId = $this->setPiutang($data);
            $this->setTransaksiDetails($data, $trxId);

            // Broadcast dashboard update
            event(new DashboardUpdated(['trxId' => $trxId, 'bayar' => $data->bayar], 'transaction'));

            return response()->json([
                'status' => 'ok',
                'msg' => '-',
                'trxId' => $trxId,
            ], 200);
        }

        // Free or Komplemen
        if ($r->state === 'komplemen') {
            $trxId = $this->setKomplemen($data);
            $this->setTransaksiDetails($data, $trxId);

            // Broadcast dashboard update
            event(new DashboardUpdated(['trxId' => $trxId], 'transaction'));

            return response()->json([
                'status' => 'ok',
                'msg' => '-',
                'trxId' => $trxId,
            ], 200);
        }

        return response()->json([
            'status' => 'error',
            'msg' => 'Request Not Found !'
        ], 404);
    }

    private function setPiutang($data)
    {
        $rateTax = env("RATE_TAX");
        $rateService = env("RATE_SERVICE");

        $charge = $data->charge;
        $discSpv = $data->discSpv;
        $discPromo = $data->discPromo;

        $brutto = $data->total + $discSpv + $discPromo - $charge;
        $netto = $data->total - $charge;

        $tax = $netto * $rateTax / 100;
        $service = $netto * $rateService / 100;
        $bayar = $netto + $tax + $service + $charge;

        $user = Auth::user();

        $trxArr = [
            'tgl' => Helpers::transactionDate(),
            'jam_selesai' => DB::raw('CURRENT_TIMESTAMP'),
            'meja' => '-',
            'brutto' => $brutto,
            'disc_spv' => $discSpv,
            'disc_promo' => $discPromo,
            'netto' => $netto,
            'charge' => $charge,
            'tax' => $tax,
            'service' => $service,
            'bayar' => $bayar,
            'status' => Meja::$EMPTY,
            'user_kasir_id' => $user->id,
            'user_spv_id' => Auth::user()->id,
            'is_piutang' => 1,
            'piutang_id' => $data->memberId,
        ];

        $trx = Transaksi::create($trxArr);

        if ($trx->piutang->is_staff) {
            PiutangBayar::create([
                'piutang_id' => $data->memberId,
                'transaksi_id' => $trx->id,
                'bayar' => $bayar,
                'user_id' => $user->id,
            ]);
        }

        return $trx->id;
    }

    private function setKomplemen($data)
    {
        $rateTax = env("RATE_TAX");
        $rateService = env("RATE_SERVICE");

        $netto = $data->total;
        $discSpv = $data->discSpv;
        $discPromo = $data->discPromo;
        $brutto = $netto + $discSpv + $discPromo;
        $tax = $netto * $rateTax / 100;
        $service = $netto * $rateService / 100;
        $bayar = $netto + $tax + $service;

        $trxArr = [
            'tgl' => Helpers::transactionDate(),
            'jam_selesai' => DB::raw('CURRENT_TIMESTAMP'),
            'meja' => '-',
            'brutto' => $brutto,
            'disc_spv' => $discSpv,
            'disc_promo' => $discPromo,
            'netto' => $netto,
            'tax' => $tax,
            'service' => $service,
            'bayar' => $bayar,
            'status' => Meja::$EMPTY,
            'user_kasir_id' => Auth::user()->id,
            'user_spv_id' => Auth::user()->id,
            'is_komplemen' => 1,
            'komplemen_id' => Auth::user()->id,
        ];

        $trx = Transaksi::create($trxArr);
        return $trx->id;
    }

    private function setTransaksi($data)
    {
        $rateTax = env("RATE_TAX");
        $rateService = env("RATE_SERVICE");

        $netto = $data->total;
        $discSpv = $data->discSpv;
        $discPromo = $data->discPromo;

        $brutto = $netto + $discSpv + $discPromo;
        $tax = $netto * $rateTax / 100;
        $service = $netto * $rateService / 100;
        $bayar = $netto + $tax + $service;

        $trxArr = [
            'tgl' => Helpers::transactionDate(),
            'jam_selesai' => DB::raw('CURRENT_TIMESTAMP'),
            'meja' => '-',
            'brutto' => $brutto,
            'disc_spv' => $discSpv,
            'disc_promo' => $discPromo,
            'netto' => $netto,
            'tax' => $tax,
            'service' => $service,
            'bayar' => $bayar,
            'payment' => $data->bayar,
            'kembali' => $data->bayar - $bayar,
            'status' => Meja::$EMPTY,
            'user_kasir_id' => Auth::user()->id,
        ];

        $trx = Transaksi::create($trxArr);
        return $trx->id;
    }

    private function setTransaksiDetails($data, $trxId)
    {
        $rateTax = env("RATE_TAX", 0);
        $rateService = env("RATE_SERVICE", 0);

        $user = Auth::user();
        $tgl = Helpers::transactionDate();
        $jam = DB::raw('CURRENT_TIMESTAMP');
        $noCo = Helpers::generateNoCO();

        foreach ($data->items as $v) {
            $v = (object) $v;

            $discPromo = $v->disc_promo ?? 0;
            $namaPromo = $v->namaPromo ?? null;

            $qty = $v->qty;
            $harga = $v->harga ?? $v->hargaJual ?? 0;
            $brutto = $qty * $harga;
            $discSpv = $v->disc_spv ?? 0;
            $netto = $brutto - $discSpv - $discPromo;
            $charge = $v->charge ?? 0;
            $tax = $netto * $rateTax / 100;
            $service = $netto * $rateService / 100;
            $bayar = $netto + $tax + $service + $charge;

            $trxArr = [
                'transaksi_id' => $trxId,
                'tgl' => $tgl,
                'jam' => $jam,
                'no_co' => $noCo,
                'sku' => $v->sku ?? $v->id ?? null,
                'qty' => $qty,
                'harga' => $harga,
                'brutto' => $brutto,
                'disc_spv' => $discSpv,
                'disc_promo' => $discPromo,
                'nama_promo' => $namaPromo,
                'netto' => $netto,
                'charge' => $charge,
                'tax' => $tax,
                'service' => $service,
                'bayar' => $bayar,
                'user_order_id' => $user->id,
            ];

            TransaksiDetail::create($trxArr);

            // === PENTING: Kurangi stok SAAT checkout (bukan saat scanning) ===
            // Ini memastikan stok hanya berkurang ketika transaksi sudah final
            $barangId = $v->sku ?? $v->id ?? null;
            if ($barangId && $qty > 0) {
                try {
                    // Reduce stok dan clear reserved (karena sudah checkout)
                    $reduceResult = \App\Models\BarangStock::reduceStok(
                        $barangId,
                        $qty,
                        'out',
                        'penjualan_kasir',
                        $trxId,
                        "Penjualan di Kasir - Trx: {$trxId}",
                        $user->id
                    );

                    // Release reserved stok untuk item ini
                    // (jika ada reserved dari scanning sebelumnya)
                    if ($reduceResult['success']) {
                        \App\Models\BarangStock::releaseReservedStok($barangId, $qty);
                    }
                } catch (\Exception $e) {
                    Log::warning("Stock reduction failed for barang {$barangId}: " . $e->getMessage());
                }
            }
        }
    }

    private function setTransaksiPayment($data, $trxId)
    {
        $trxTypeArr = [
            'transaksi_id' => $trxId,
            'type_id' => $data->typeId,
            'nominal' => $data->total,
        ];

        TransaksiPayment::create($trxTypeArr);
    }

    public function validateSpv(Request $r)
    {
        $spv = User::where('level', 1)->first();

        if (!$spv || !Hash::check($r->pin, $spv->password)) {
            return response()->json([
                "status" => "error",
                "msg" => "Invalid PIN Supervisor !",
            ], 401);
        }

        return response()->json([
            "status" => "ok",
            "msg" => "-",
        ], 200);
    }

    public function trxEdit($id)
    {
        $paymentTypes = TransaksiPaymentType::orderBy("urutan")->orderBy("ket")->get();

        return Inertia::render('Kasir/Edit', [
            'transactionId' => $id,
            'paymentTypes' => $paymentTypes,
        ]);
    }

    public function trxEditJson(Request $r)
    {
        $trx = Transaksi::with(['details' => function ($q) {
            $q->select('transaksi_id', 'sku', 'qty', 'disc_spv');
        }])->find($r->id);

        if (!$trx) {
            return response()->json([
                "status" => "error",
                "msg" => "Data not found !",
            ], 404);
        }

        return response()->json([
            "status" => "ok",
            "msg" => "-",
            "data" => $trx,
        ], 200);
    }

    public function update(Request $r)
    {
        if (!$r->state) {
            return response()->json([
                'status' => 'error',
                'msg' => 'Akses ditolak !'
            ], 403);
        }

        $data = (object) $r->validate([
            'id' => 'required',
            'items' => 'required',
            'charge' => 'numeric',
            'total' => 'required | numeric',
            'bayar' => 'required | numeric',
            'typeId' => '',
            'memberId' => '',
        ], Helpers::customErrorMsg());

        if ($r->state === 'full') {
            $trxId = $data->id;

            TransaksiDetail::where('transaksi_id', $trxId)->delete();
            TransaksiPayment::where('transaksi_id', $trxId)->delete();

            $this->updateTransaksi($data);
            $this->setTransaksiPayment($data, $trxId);
            $this->setTransaksiDetails($data, $trxId);

            return response()->json([
                'status' => 'ok',
                'msg' => '-',
                'trxId' => $trxId,
            ], 200);
        }

        if ($r->state === 'piutang') {
            $trxId = $data->id;
            TransaksiDetail::where('transaksi_id', $trxId)->delete();
            TransaksiPayment::where('transaksi_id', $trxId)->delete();

            $this->updatePiutang($data);
            $this->setTransaksiDetails($data, $trxId);

            return response()->json([
                'status' => 'ok',
                'msg' => '-',
                'trxId' => $trxId,
            ], 200);
        }

        if ($r->state === 'komplemen') {
            $spv = User::where('pin', $r->pin)->where('level', 1)->first();
            if (!$spv) {
                return response()->json([
                    "status" => "error",
                    "msg" => "Invalid PIN Supervisor..!",
                ], 403);
            }

            $trxId = $data->id;
            TransaksiDetail::where('transaksi_id', $trxId)->delete();
            TransaksiPayment::where('transaksi_id', $trxId)->delete();

            $this->updateKomplemen($data, $spv);
            $this->setTransaksiDetails($data, $trxId);

            return response()->json([
                'status' => 'ok',
                'msg' => '-',
                'trxId' => $trxId,
            ], 200);
        }

        return response()->json([
            'status' => 'error',
            'msg' => 'Request Not Found !'
        ], 404);
    }

    private function updateTransaksi($data)
    {
        $rateTax = env("RATE_TAX");
        $rateService = env("RATE_SERVICE");

        $netto = $data->total;
        $tax = $netto * $rateTax / 100;
        $service = $netto * $rateService / 100;
        $bayar = $netto + $tax + $service;

        $trxArr = [
            'brutto' => $data->total,
            'netto' => $netto,
            'tax' => $tax,
            'service' => $service,
            'bayar' => $bayar,
            'payment' => $data->bayar,
            'kembali' => $data->bayar - $bayar,
            'user_spv_id' => Auth::user()->id,
        ];

        Transaksi::where('id', $data->id)->update($trxArr);
    }

    private function updatePiutang($data)
    {
        $rateTax = env("RATE_TAX");
        $rateService = env("RATE_SERVICE");

        $netto = $data->total;
        $tax = $netto * $rateTax / 100;
        $service = $netto * $rateService / 100;
        $bayar = $netto + $tax + $service;

        $trxArr = [
            'brutto' => $data->total,
            'netto' => $netto,
            'tax' => $tax,
            'service' => $service,
            'bayar' => $bayar,
            'user_spv_id' => Auth::user()->id,
            'is_piutang' => 1,
            'piutang_id' => $data->memberId,
        ];

        Transaksi::where('id', $data->id)->update($trxArr);
    }

    private function updateKomplemen($data, $spv)
    {
        $rateTax = env("RATE_TAX");
        $rateService = env("RATE_SERVICE");

        $netto = $data->total;
        $tax = $netto * $rateTax / 100;
        $service = $netto * $rateService / 100;
        $bayar = $netto + $tax + $service;

        $trxArr = [
            'brutto' => $data->total,
            'netto' => $netto,
            'tax' => $tax,
            'service' => $service,
            'bayar' => $bayar,
            'user_spv_id' => Auth::user()->id,
            'is_komplemen' => 1,
            'komplemen_id' => $spv->id,
        ];

        Transaksi::where('id', $data->id)->update($trxArr);
    }

    public function trxDelete(Request $r)
    {
        $trx = Transaksi::find($r->id);
        $trx->is_cancel = 1;
        $trx->save();

        return response()->json([
            'status' => 'ok',
            'msg' => '-',
        ], 200);
    }

    /**
     * Reduce stock saat barang di-scan di kasir
     */
    public function reduceStock(Request $r)
    {
        try {
            $barangId = $r->barang_id;
            $qty = $r->qty ?? 1;

            if (!$barangId || $qty <= 0) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Parameter tidak valid'
                ], 400);
            }

            // Get barang
            $barang = Barang::find($barangId);
            if (!$barang) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Barang tidak ditemukan'
                ], 404);
            }

            // Reduce stock
            $result = \App\Models\BarangStock::reduceStok(
                $barangId,
                $qty,
                'out',
                'penjualan_kasir',
                '',
                'Penjualan manual di kasir',
                Auth::id()
            );

            if (!$result['success']) {
                return response()->json([
                    'status' => 'error',
                    'message' => $result['message'] ?? 'Gagal mengurangi stok'
                ], 400);
            }

            // Get updated stock
            $stock = \App\Models\BarangStock::where('barang_id', $barangId)->first();
            $available = max(0, ($stock?->quantity ?? 0) - ($stock?->reserved ?? 0));

            return response()->json([
                'status' => 'ok',
                'message' => 'Stok berhasil dikurangi',
                'data' => [
                    'barang_id' => $barangId,
                    'quantity' => $stock?->quantity ?? 0,
                    'reserved' => $stock?->reserved ?? 0,
                    'stock' => $available
                ]
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => $th->getMessage()
            ], 500);
        }
    }

    /**
     * Restore stock saat item dihapus dari cart
     * Mengembalikan stok yang sudah dikurangi saat reduce-stock
     */
    public function restoreStock(Request $r)
    {
        try {
            $barangId = $r->barang_id;
            $qty = $r->qty ?? 1;

            if (!$barangId || $qty <= 0) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Parameter tidak valid'
                ], 400);
            }

            // Get barang
            $barang = Barang::find($barangId);
            if (!$barang) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Barang tidak ditemukan'
                ], 404);
            }

            // Add stock back (restore)
            $result = \App\Models\BarangStock::addStok(
                $barangId,
                $qty,
                'in',
                'cancellation_kasir',
                '',
                'Pembatalan item dari kasir',
                Auth::id()
            );

            if (!$result) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Gagal mengembalikan stok'
                ], 400);
            }

            // Get updated stock
            $stock = \App\Models\BarangStock::where('barang_id', $barangId)->first();
            $available = max(0, ($stock?->quantity ?? 0) - ($stock?->reserved ?? 0));

            return response()->json([
                'status' => 'ok',
                'message' => 'Stok berhasil dikembalikan',
                'data' => [
                    'barang_id' => $barangId,
                    'quantity' => $stock?->quantity ?? 0,
                    'reserved' => $stock?->reserved ?? 0,
                    'stock' => $available,
                ]
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error restoring stock: ' . $th->getMessage()
            ], 500);
        }
    }

    /**
     * Check stock availability (fast endpoint untuk real-time validation)
     * Digunakan saat user akan add item ke cart
     */
    /**
     * Check stock availability - FAST version with 60-second cache
     * For barcode scanning and quick checks during transaction
     */
    public function checkStockAvailability(Request $r)
    {
        try {
            $barangId = $r->input('barang_id');
            $qty = $r->input('qty', 1);

            if (!$barangId || $qty <= 0) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Parameter tidak valid'
                ], 400);
            }

            // Use cache for fast lookup (60 second TTL for performance)
            $cacheKey = "stock_check_{$barangId}";

            $stockData = cache()->remember($cacheKey, 60, function () use ($barangId) {
                $barang = Barang::with('stock')->find($barangId);
                if (!$barang) {
                    return null;
                }

                $stock = $barang->stock;
                $available = $stock ? max(0, $stock->quantity - $stock->reserved) : 0;

                return [
                    'available' => $available,
                    'quantity' => $stock?->quantity ?? 0,
                    'reserved' => $stock?->reserved ?? 0,
                ];
            });

            if (!$stockData) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Barang tidak ditemukan'
                ], 404);
            }

            $isAvailable = $stockData['available'] >= $qty;

            return response()->json([
                'status' => 'ok',
                'available' => $stockData['available'],
                'requested' => $qty,
                'is_available' => $isAvailable,
                'message' => $isAvailable ? 'Stok tersedia' : "Stok tidak cukup. Available: {$stockData['available']}",
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => $th->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk stock check for multiple items at once
     * Returns stock availability for all items in array
     * Useful for cart verification before checkout
     */
    public function checkBulkStockAvailability(Request $r)
    {
        try {
            $items = $r->input('items', []);

            if (!is_array($items) || count($items) === 0) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Items array required'
                ], 400);
            }

            // Extract barang IDs
            $barangIds = array_map(function ($item) {
                return $item['id'] ?? $item['barang_id'] ?? null;
            }, $items);
            $barangIds = array_filter($barangIds);

            if (empty($barangIds)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'No valid barang IDs'
                ], 400);
            }

            // Get bulk stock status
            $stockData = Barang::getBulkStockStatus($barangIds);

            // Check availability for each item
            $results = [];
            $allAvailable = true;

            foreach ($items as $item) {
                $id = $item['id'] ?? $item['barang_id'];
                $qty = $item['qty'] ?? $item['quantity'] ?? 1;
                $stock = $stockData[$id] ?? ['available' => 0, 'quantity' => 0, 'reserved' => 0];
                $isAvailable = $stock['available'] >= $qty;

                $results[] = [
                    'barang_id' => $id,
                    'requested' => $qty,
                    'available' => $stock['available'],
                    'is_available' => $isAvailable,
                ];

                if (!$isAvailable) {
                    $allAvailable = false;
                }
            }

            return response()->json([
                'status' => 'ok',
                'all_available' => $allAvailable,
                'items' => $results,
                'message' => $allAvailable ? 'Semua stok tersedia' : 'Ada item yang stok tidak cukup',
            ], 200);

        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => $th->getMessage()
            ], 500);
        }
    }    /**
     * Reserve stock item saat ditambah ke cart
     * Ini BUKAN reduce stok, hanya tandai sebagai "reserved"
     * Stok akan benar-benar berkurang saat checkout
     */
    public function reserveStockItem(Request $r)
    {
        try {
            $barangId = $r->input('barang_id');
            $qty = $r->input('qty', 1);

            if (!$barangId || $qty <= 0) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Parameter tidak valid'
                ], 400);
            }

            // Get barang
            $barang = Barang::find($barangId);
            if (!$barang) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Barang tidak ditemukan'
                ], 404);
            }

            // Reserve stock menggunakan ManageStok trait
            $result = \App\Models\BarangStock::reserveStok(
                $barangId,
                $qty,
                Auth::id()
            );

            if (!$result['success']) {
                return response()->json([
                    'status' => 'error',
                    'message' => $result['message'] ?? 'Gagal reserve stok'
                ], 400);
            }

            // Get updated stock
            $stock = \App\Models\BarangStock::where('barang_id', $barangId)->first();
            $available = max(0, ($stock?->quantity ?? 0) - ($stock?->reserved ?? 0));

            return response()->json([
                'status' => 'ok',
                'message' => 'Stok berhasil di-reserve',
                'data' => [
                    'barang_id' => $barangId,
                    'quantity' => $stock?->quantity ?? 0,
                    'reserved' => $stock?->reserved ?? 0,
                    'available' => $available,
                ]
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error reserving stock: ' . $th->getMessage()
            ], 500);
        }
    }

    /**
     * Release all reserved items saat cart di-reset atau checkout dibatalkan
     */
    public function releaseReservedItems(Request $r)
    {
        try {
            $items = $r->input('items', []);

            if (!is_array($items) || count($items) === 0) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Items tidak valid'
                ], 400);
            }

            $releasedCount = 0;
            $errors = [];

            foreach ($items as $item) {
                $item = (object) $item;
                $barangId = $item->barang_id ?? $item->id ?? null;
                $qty = $item->qty ?? $item->quantity ?? 0;

                if (!$barangId || $qty <= 0) {
                    $errors[] = "Item {$barangId} invalid";
                    continue;
                }

                try {
                    $result = \App\Models\BarangStock::releaseReservedStok($barangId, $qty);
                    if ($result['success']) {
                        $releasedCount++;
                    } else {
                        $errors[] = $result['message'] ?? "Gagal release {$barangId}";
                    }
                } catch (\Exception $e) {
                    $errors[] = $e->getMessage();
                }
            }

            return response()->json([
                'status' => 'ok',
                'message' => "{$releasedCount} item berhasil di-release",
                'released_count' => $releasedCount,
                'errors' => $errors,
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error releasing reserved items: ' . $th->getMessage()
            ], 500);
        }
    }
}

