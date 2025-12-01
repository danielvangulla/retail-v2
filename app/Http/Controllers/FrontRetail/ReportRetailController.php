<?php

namespace App\Http\Controllers\FrontRetail;

use App\Http\Controllers\Controller;
use App\Models\Kategori;
use App\Models\Transaksi;
use App\Models\TransaksiDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ReportRetailController extends Controller
{
    public function salesByTrx()
    {
        $tgl1 = Date("Y-m-d");
        $tgl2 = Date("Y-m-d");

        return Inertia::render('Reports/SalesByTrx', ['tgl1' => $tgl1, 'tgl2' => $tgl2]);
    }

    public function salesByTrxJson(Request $r)
    {
        $tgl1 = $r->tgl1;
        $tgl2 = $r->tgl2;
        if ($tgl1 === 'today') {
            $tgl1 = Date("Y-m-d");
            $tgl2 = Date("Y-m-d");
        }

        if (!$tgl2) {
            $tgl2 = $tgl1;
        }

        $search = "%$r->trxId%";

        $trx = Transaksi::select('id', 'piutang_id', 'is_piutang', 'is_komplemen', 'created_at', 'bayar')
            ->with(['piutang' => function ($q) {
                $q->select('id', 'is_staff');
            }])
            ->withSum('details', 'qty')
            ->where('id', 'like', $search)
            ->where('tgl', '>=', $r->tgl1)
            ->where('tgl', '<=', $r->tgl2)
            ->where('is_cancel', 0)
            ->orderBy('created_at', 'desc')
            ->get();

        $trx->map(function ($v) {
            return $v->tgl = Date('d M Y - H:i:s', strtotime($v->created_at));
        });

        $trx = $trx->filter(function ($v) use ($r) {
            if ($r->memberId != 0)
                return $r->memberId == $v->piutang_id;
            return true;
        });

        return response()->json([
            'status' => 'ok',
            'msg' => '-',
            'data' => $trx,
            'tgl1' => $tgl1,
            'tgl2' => $tgl2,
            'memberId' => $r->memberId,
        ], 200);
    }


    public function omsetByTgl($tgl1 = null, $tgl2 = null)
    {
        if ($tgl1 === null) {
            $tgl1 = $tgl2 = Date("Y-m-d");
        }

        $trx = Transaksi::select(
            'tgl',
            'is_piutang',
            DB::raw('SUM(brutto) as brutto'),
            DB::raw('SUM(disc_spv) as disc_spv'),
            DB::raw('SUM(netto) as netto'),
            DB::raw('SUM(charge) as charge'),
            DB::raw('SUM(tax) as tax'),
            DB::raw('SUM(service) as service'),
            DB::raw('SUM(bayar) as bayar'),
        )
            ->where('tgl', '>=', $tgl1)
            ->where('tgl', '<=', $tgl2)
            ->where('is_cancel', 0)
            ->groupBy('tgl')
            ->groupBy('is_piutang')
            ->get();

        $data = $trx->groupBy('tgl')->map(function ($group) {
            return [
                'tgl' => $group->first()->tgl,
                'full' => $group->sum(function ($item) {
                    return $item->is_piutang === 0 ? $item->brutto : 0;
                }),
                'piutang' => $group->sum(function ($item) {
                    return $item->is_piutang === 1 ? $item->brutto : 0;
                }),
                'disc' => $group->sum('disc_spv'),
                'netto' => $group->sum('netto'),
                'tax' => $group->sum('tax') + $group->sum('service') + $group->sum('charge'),
                'total' => $group->sum('bayar'),
            ];
        })->values();

        return Inertia::render('Reports/OmsetByTgl', ['tgl1' => $tgl1, 'tgl2' => $tgl2, 'data' => $data]);
    }

    public function omsetByTglKategori($tgl1 = null, $tgl2 = null)
    {
        if ($tgl1 === null) {
            $tgl1 = $tgl2 = Date("Y-m-d");
        }

        $kategori = Kategori::whereNot('ket', 'No Category')->get();

        $trx = TransaksiDetail::select('transaksi_id', 'sku', 'netto', 'charge', 'bayar')
            ->whereHas('transaksi', function ($q) {
                $q->where('is_cancel', 0);
            })
            ->whereBetween('tgl', [$tgl1, $tgl2])
            ->with('barang.kategori')
            ->with(['transaksi' => function ($q) {
                $q->select('id', 'is_piutang', 'piutang_id');
                $q->with(['piutang' => function ($q) {
                    $q->select('id', 'is_staff');
                }]);
            }])
            ->get();

        // return response()->json($trx);

        $data = [];

        foreach ($kategori as $v) {
            $row = [
                'kategori' => $v->ket,
                'deposit' => 0,
                'payment' => 0,
                'piutang' => 0,
                'charge' => 0,
                'total' => 0,
            ];

            foreach ($trx as $vv) {
                if ($v->id === $vv->barang->kategori_id) {
                    if (!$vv->transaksi->is_piutang) {
                        $row['payment'] += $vv->netto;
                    }

                    if ($vv->transaksi->is_piutang and $vv->transaksi->piutang->is_staff) {
                        $row['deposit'] += $vv->netto;
                    }

                    if ($vv->transaksi->is_piutang and !$vv->transaksi->piutang->is_staff) {
                        $row['piutang'] += $vv->netto;
                    }

                    $row['charge'] += $vv->charge;
                    $row['total'] += $vv->bayar;
                }
            }

            $data[] = $row;
        }

        // return response()->json($data);

        return Inertia::render('Reports/OmsetByTglKategori', ['tgl1' => $tgl1, 'tgl2' => $tgl2, 'data' => $data]);
    }


    public function salesByTgl()
    {
        $tgl1 = Date("Y-m-d");
        $tgl2 = Date("Y-m-d");

        return Inertia::render('Reports/SalesByTgl', ['tgl1' => $tgl1, 'tgl2' => $tgl2]);
    }

    public function salesByTglJson(Request $r)
    {
        $tgl1 = $r->tgl1;
        $tgl2 = $r->tgl2;
        if ($tgl1 === 'today') {
            $tgl1 = Date("Y-m-d");
            $tgl2 = Date("Y-m-d");
        }

        if (!$tgl2) {
            $tgl2 = $tgl1;
        }

        $full = TransaksiDetail::selectRaw("sku, sum(qty) as qty, sum(bayar) as bayar")
            ->where('tgl', '>=', $tgl1)->where('tgl', '<=', $tgl2)
            ->whereHas("transaksi", function ($q) {
                $q->where("is_piutang", 0);
            })
            ->with(["barang" => function ($q) {
                $q->select("sku", "barcode", "deskripsi", "satuan");
            }])
            ->groupBy("sku")
            ->orderBy("qty", "desc")
            ->get();

        $piutang = TransaksiDetail::selectRaw("sku, sum(qty) as qty, sum(bayar) as bayar")
            ->where('tgl', '>=', $tgl1)->where('tgl', '<=', $tgl2)
            ->whereHas("transaksi", function ($q) {
                $q->where("is_piutang", 1);
            })
            ->with(["barang" => function ($q) {
                $q->select("sku", "barcode", "deskripsi", "satuan");
            }])
            ->groupBy("sku")
            ->orderBy("qty", "desc")
            ->get();

        return response()->json([
            'status' => 'ok',
            'msg' => '-',
            'full' => $full,
            'piutang' => $piutang,
            'tgl1' => $tgl1,
            'tgl2' => $tgl2,
        ], 200);
    }

    public function salesByUser()
    {
        $user = Auth::user();

        $title = "Kasir : $user->name";
        return Inertia::render('Reports/SalesByUser', ['title' => $title]);
    }

    public function salesByUserJson()
    {
        $user = Auth::user();

        $full = TransaksiDetail::selectRaw("sku, sum(qty) as qty, sum(bayar) as bayar")
            ->whereHas("transaksi", function ($q) use ($user) {
                $q->where("user_kasir_id", $user->id);
                $q->where("is_piutang", 0);
            })
            ->with(["barang" => function ($q) {
                $q->select("sku", "barcode", "deskripsi", "satuan");
            }])
            ->where('tgl', Date('Y-m-d'))
            ->groupBy("sku")
            ->orderBy("qty", "desc")
            ->get();

        $piutang = TransaksiDetail::selectRaw("sku, sum(qty) as qty, sum(bayar) as bayar")
            ->whereHas("transaksi", function ($q) use ($user) {
                $q->where("user_kasir_id", $user->id);
                $q->where("is_piutang", 1);
            })
            ->with(["barang" => function ($q) {
                $q->select("sku", "barcode", "deskripsi", "satuan");
            }])
            ->groupBy("sku")
            ->orderBy("qty", "desc")
            ->get();

        return response()->json([
            'status' => 'ok',
            'msg' => '-',
            'full' => $full,
            'piutang' => $piutang,
        ], 200);
    }
}
