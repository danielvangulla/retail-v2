<?php

namespace App\Http\Controllers\Back;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Helpers;
use App\Models\Barang;
use App\Models\BarangPrice;
use App\Models\Kategori;
use App\Models\Kategorisub;
use App\Models\Opname;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Inertia\Inertia;

class BarangController extends Controller
{
    public function __construct()
    {
        // $this->middleware(function ($request, $next) {

        //     if (Auth::user()->level !== 1) {
        //         return redirect()->back();
        //     }

        //     return $next($request);
        // });
    }

    public function importExcel(Request $r)
    {
        $r->validate([
            'excel' => 'required|mimes:xlsx,xls',
        ]);

        if ($r->hasFile('excel')) {
            // Remove from Kategori where ket=No Category
            // $oldKategori = Kategori::whereNot('ket', 'No Category')->get();
            // Kategori::truncate();

            // Get the uploaded file
            $file = $r->file('excel');

            // Load the Excel file
            $spreadsheet = IOFactory::load($file);

            $data = [];
            $columns = ["sku", "barcode", "deskripsi", "alias", "satuan", "isi", "volume", "min_stock", "harga_jual1", "harga_jual2", "kategori_id"];

            // Iterate through the sheets
            $totalSheets = $spreadsheet->getSheetCount();
            for ($sheet = 0; $sheet < $totalSheets; $sheet++) {

                // Select the first worksheet
                $worksheet = $spreadsheet->getSheet($sheet);

                // Iterate through the rows of the worksheet
                $rowsCount = $worksheet->getHighestDataRow();

                if ($rowsCount >= 2) {
                    $rows = $worksheet->getRowIterator(2);
                    foreach ($rows as $row) {
                        $rowData = [];

                        // Iterate through the cells of the row
                        $allCellsNull = true;

                        $cells = $row->getCellIterator();

                        $i = 0;
                        foreach ($cells as $cell) {
                            // $cellCoordinate = $cell->getCoordinate();
                            $value = $cell->getCalculatedValue();

                            if ($i <= 10) {
                                $rowData[$columns[$i]] = $value;
                                $i++;
                            }

                            if (!is_null($value) && $value !== '') {
                                $allCellsNull = false;
                            }

                            if ($allCellsNull) {
                                break;
                            }
                        }

                        if (!$allCellsNull and $i === 11) {
                            if ($rowData["alias"] === null) {
                                $rowData["alias"] = $rowData["deskripsi"];
                            }

                            if ($rowData["kategori_id"] === null) {
                                $kategori = Kategori::firstOrCreate(['ket' => 'No Category']);
                                $rowData["kategori_id"] = $kategori->id;
                            } else {
                                // $skuFrom = 0;
                                // $skuTo = 0;
                                // foreach ($oldKategori as $v) {
                                //     if ($v->ket === $rowData["kategori_id"]) {
                                //         $skuFrom = $v->sku_from;
                                //         $skuTo = $v->sku_to;
                                //     }
                                // }

                                // $kategori = Kategori::firstOrCreate([
                                //     'ket' => $rowData["kategori_id"],
                                //     'sku_from' => $skuFrom,
                                //     'sku_to' => $skuTo,
                                // ]);

                                $kategori = Kategori::firstOrCreate(['ket' => $rowData["kategori_id"]]);
                                $rowData["kategori_id"] = $kategori->id;
                            }

                            $data[] = $rowData;
                        }
                    }
                }
            }

            $saved = Barang::BulkInsert($data);

            Barang::setCache();

            if ($saved) {
                return response()->json([
                    'status' => 'ok',
                    'msg' => 'Import Data Barang Berhasil !',
                    'data' => $data,
                ], 200);
            }

            return response()->json([
                'status' => 'error',
                'msg' => 'Error on Bulk Insert !',
            ], 500);
        }
    }

    public function importCsv(Request $r)
    {
        $r->validate([
            'csv' => 'required|file|mimes:csv,txt',
        ]);

        $file = $r->file('csv');
        $csv = array_map('str_getcsv', file($file));

        $dataRows = [];

        if (is_array($csv[0])) {
            $columns = $csv[0];
            array_pop($columns);
            $columns[] = 'kategori_id';

            foreach ($csv as $k => $v) {
                if ($k >= 1) {
                    $kategoriVal = array_pop($v);
                    $kategori = Kategori::firstOrCreate(['ket' => $kategoriVal]);
                    $v[] = $kategori->id;

                    foreach ($v as $kk => $vv) {
                        $v[$kk] = mb_convert_encoding($vv, 'UTF-8', 'auto');
                    }

                    $dataRow = array_combine($columns, $v);

                    if ($dataRow['harga_jual2'] === '') {
                        $dataRow['harga_jual2'] = 0;
                    }

                    $dataRows[] = $dataRow;
                }
            }
        } else {
            return response()->json([
                'status' => 'error',
                'msg' => 'Error on Invalid CSV !',
            ], 500);
        }

        $saved = Barang::BulkInsert($dataRows);

        Barang::setCache();

        if ($saved) {
            return response()->json([
                'status' => 'ok',
                'msg' => 'Import Data Barang Berhasil !',
                // 'data' => $dataRows,
            ], 200);
        }

        return response()->json([
            'status' => 'error',
            'msg' => 'Error on Bulk Insert !',
        ], 500);
    }

    public function barangGetPrices(Request $r)
    {
        $data = BarangPrice::where('barang_id', $r->id)
            ->with(['barang' => function ($q) {
                $q->select('id', 'volume');
            }])
            ->orderBy('qty')
            ->get();

        return response()->json([
            'status' => 'ok',
            'msg' => '-',
            'data' => $data,
        ], 200);
    }

    public function barangSetPrices(Request $r)
    {
        $data = [
            'barang_id' => $r->barang_id,
            'qty' => $r->qty,
            'harga1' => $r->harga1,
            'harga2' => $r->harga2,
            'multiplier' => $r->multiplier,
        ];
        BarangPrice::create($data);

        Barang::setCache();

        return response()->json([
            'status' => 'ok',
            'msg' => 'Harga berhasil ditambah !',
        ], 200);
    }

    public function barangRemovePrice(Request $r)
    {
        BarangPrice::where('id', $r->id)->delete();

        Barang::setCache();

        return response()->json([
            'status' => 'ok',
            'msg' => 'Harga berhasil dihapus !',
        ], 200);
    }

    public function resetStok()
    {
        $barang = Barang::getAllBarang(1);

        $listReset = [];
        foreach ($barang as $v) {
            if ($v->stock != 0) {
                $listReset[] = $v;
                Opname::create([
                    "user_id" => Auth::user()->id,
                    "barang_id" => $v->id,
                    "tgl" => Date("Y-m-d"),
                    "sistem" => $v->stock,
                    "fisik" => 0,
                    "selisih" => $v->stock * -1,
                    "is_sistem" => 1,
                ]);
            }
        }

        Barang::setCache();

        return response()->json([
            'status' => 'ok',
            'msg' => 'Data Berhasil di Reset !',
            'data' => $listReset,
            'barang' => $barang,
        ], 200);
    }

    public function barangLowStock()
    {
        $barang = Barang::getAllBarang(true);

        $barang->map(function ($v) {
            return $v->stock <= $v->min_stock;
        });

        return Inertia::render('back/Barang/LowStock', compact('barang'));
    }

    public function cekLowStock()
    {
        Barang::setCache();
        $barang = Barang::getAllBarang(true);

        $barangIds = $barang->map(function ($v) {
            if ($v->stock <= $v->min_stock)
                return $v->id;
        })->filter();

        if (!$barangIds) {
            return response()->json([
                'status' => 'ok',
                'msg' => 'Tidak ada barang dengan stok minimum.',
                'data' => $barangIds,
            ], 200);
        }

        return response()->json([
            'status' => 'ok',
            'msg' => '-',
            'data' => $barangIds,
        ], 200);
    }

    public function barangList(Request $r)
    {
        $barang = Barang::getAllBarang($r->show);

        if (!$barang) {
            return response()->json([
                'status' => 'error',
                'msg' => 'Data barang jual belum ada !',
            ], 404);
        }

        return response()->json([
            'status' => 'ok',
            'msg' => '-',
            'data' => $barang,
        ], 200);
    }

    public function index()
    {
        $show = 1;
        return Inertia::render('back/Barang/Index', compact('show'));
    }

    public function indexDeleted()
    {
        $show = 0;
        return Inertia::render('back/Barang/Index', compact('show'));
    }

    public function create()
    {
        $kategori = Kategori::whereNot('ket', 'No Category')->get();
        $kategorisub = Kategorisub::all();

        foreach ($kategori as $v) {
            $v->auto_sku = Barang::where('sku', '>=', $v->sku_from)->where('sku', '<=', $v->sku_to)->max('sku');
        }

        $var = (object) [
            'page' => 'barang-create',
            'title' => 'Create Barang',
            'btnTitle' => 'Create',
        ];

        return Inertia::render('back/Barang/Create', compact('var', 'kategori', 'kategorisub'));
    }

    public function edit($id)
    {
        $barang = Barang::find($id);
        $kategori = Kategori::all();
        $kategorisub = Kategorisub::all();

        $var = (object) [
            'page' => 'barang-edit',
            'title' => 'Edit Barang',
            'btnTitle' => 'Update',
        ];

        return Inertia::render('back/Barang/Create', compact('var', 'barang', 'kategori', 'kategorisub'));
    }

    public function store(Request $r)
    {
        if (!$r->state) {
            return response()->json([
                'status' => 'error',
                'msg' => 'Akses ditolak !'
            ], 403);
        }

        if ($r->state === 'barang-delete') {
            Barang::where('id', $r->id)->update(['st_aktif' => 0]);

            Barang::setCache();

            return response()->json([
                'status' => 'ok',
                'msg' => 'Barang berhasil dihapus !'
            ], 200);
        }

        if ($r->state === 'barang-restore') {
            Barang::where('id', $r->id)->update(['st_aktif' => 1]);

            Barang::setCache();

            return response()->json([
                'status' => 'ok',
                'msg' => 'Penghapusan berhasil dibatalkan !'
            ], 200);
        }

        $data = $this->validateBarang($r);

        if ($r->state === 'barang-create') {
            Barang::create($data);

            Barang::setCache();

            return response()->json([
                'status' => 'ok',
                'msg' => 'Barang berhasil disimpan !'
            ], 200);
        }

        if ($r->state === 'barang-edit') {
            Barang::where('id', $r->id)->update($data);

            Barang::setCache();

            return response()->json([
                'status' => 'ok',
                'msg' => 'Barang berhasil dirubah !'
            ], 200);
        }

        return response()->json([
            'status' => 'error',
            'msg' => 'Terjadi kesalahan Request !'
        ], 400);
    }

    private function validateBarang($r)
    {
        return $r->validate([
            'sku' => 'min:4 | max:8 | alpha_num',
            'barcode' => 'required | numeric | min:4',
            // 'deskripsi' => 'required | regex:/^[a-zA-Z0-9\s]+$/',
            // 'alias' => 'required | regex:/^[a-zA-Z0-9\s]+$/',
            'deskripsi' => 'required',
            'alias' => 'required',
            'kategori_id' => 'required',
            'satuan' => 'required | alpha',
            'isi' => 'required | numeric',
            'volume' => 'required | alpha',
            'harga_jual1' => 'required | numeric',
            'harga_jual2' => 'required | numeric',
            'multiplier' => 'required',
            'min_stock' => 'required | numeric',
        ], Helpers::customErrorMsg());
    }
}
