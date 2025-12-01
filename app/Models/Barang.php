<?php

namespace App\Models;

use App\Events\BarangCreated;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class Barang extends Model
{
    use HasFactory, HasUuids;

    protected $primaryKey = 'id';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $table = 'barang';

    protected $guarded = ['id'];

    protected $hidden = [
        'created_at',
        'updated_at',
    ];

    protected $casts = [];

    protected $dispatchesEvents = [
        'created' => BarangCreated::class,
    ];

    public static function BulkInsert($data)
    {
        foreach ($data as $item) {
            $sku = $item['sku'];

            $exists = self::where('sku', $sku)->exists();
            if ($exists) {
                unset($data['sku']);
                self::where('sku', $sku)->update($item);
            } else {
                self::create($item);
            }
        }

        return true;
    }

    public static function getBarangList()
    {
        return self::select(
            'id',
            'sku',
            'barcode',
            'deskripsi',
            'satuan',
            'isi',
            'volume',
            'min_stock',
            'harga_beli',
            'harga_jual1',
            'harga_jual2',
            'multiplier',
            'st_aktif',
            'kategori_id',
        )->with([
            'kategori' => function ($q) {
                $q->select('id', 'ket');
                $q->orderBy('ket');
            },
            'beliDetails' => function ($q) {
                $q->selectRaw('sku, SUM(qty) as qty')
                    ->groupBy('sku');
            },
            'trxDetails' => function ($q) {
                $q->selectRaw('sku, nama_promo, SUM(qty) as qty')
                    ->whereHas('transaksi', function ($q) {
                        $q->where('is_cancel', 0);
                    })
                    ->groupBy('sku', 'nama_promo');
            },
            'retur' => function ($q) {
                $q->selectRaw('barang_id, SUM(qty) as qty')
                    ->groupBy('barang_id');
            },
            'expires' => function ($q) {
                $q->selectRaw('barang_id, SUM(qty) as qty')
                    ->groupBy('barang_id');
            },
            'promo' => function ($q) {
                $date = date('Y-m-d');
                $q->selectRaw("'Promo' as nama_promo, barang_id, is_aktif, tgl_from, tgl_to, max_qty, harga_promo");
                $q->where('tgl_from', '<=', $date);
                $q->where('tgl_to', '>=', $date);
                $q->where('is_aktif', 1);
            },
            'opname' => function ($q) {
                $q->selectRaw("barang_id, sum(selisih) as selisih")
                    ->groupBy('barang_id');
            },
            'prices'
        ])->orderBy('sku')->get();
    }

    public static function setCache()
    {
        // Cache::forget('barangList');
        Cache::forever('barangList', self::getBarangList(), now()->addHour());
    }

    public static function getAllBarang($show)
    {
        if (!Cache::has('barangList'))
            self::setCache();

        $barangList = Cache::get('barangList');

        $filteredBarang = $barangList->filter(function ($v) use ($show) {
            return $v->st_aktif == $show;
        });

        if ($filteredBarang) {
            foreach ($filteredBarang as $v) {
                $v->stockIn = 0;
                $v->stockOut = 0;
                $v->selisihOpname = 0;

                if (isset($v->beliDetails[0])) {
                    $v->stockIn += $v->beliDetails[0]->qty;
                }

                foreach ($v->trxDetails as $vv) {
                    $v->stockOut += $vv->qty;
                }

                if (isset($v->retur[0])) {
                    $v->stockOut += $v->retur[0]->qty;
                }

                if (isset($v->expires[0])) {
                    $v->stockOut += $v->expires[0]->qty;
                }

                if (isset($v->opname[0])) {
                    $v->selisihOpname = intval($v->opname[0]->selisih);
                }

                $v->stock = $v->stockIn - $v->stockOut + $v->selisihOpname;
            }
        }

        return $filteredBarang->values();
    }

    public static function getHargaBeli($id)
    {
        if (!Cache::has('barangList'))
            self::setCache();

        $barangList = Cache::get('barangList');

        $barang = $barangList->first(function ($v) use ($id) {
            return $v->id == $id;
        });

        if ($barang) {
            return $barang->harga_beli;
        }

        return 0;
    }

    public function opname()
    {
        return $this->hasMany(Opname::class);
    }

    public function promo()
    {
        return $this->hasOne(Promo::class);
    }

    public function kategori()
    {
        return $this->belongsTo(Kategori::class);
    }

    public function kategorisub()
    {
        return $this->belongsTo(Kategorisub::class);
    }

    public function prices()
    {
        return $this->hasMany(BarangPrice::class);
    }

    public function retur()
    {
        return $this->hasMany(BarangReturDetail::class);
    }

    public function expires()
    {
        return $this->hasMany(BarangExpireDetail::class);
    }

    public function beliDetails()
    {
        return $this->hasMany(PembelianDet::class, 'sku', 'sku');
    }

    public function trxDetails()
    {
        return $this->hasMany(TransaksiDetail::class, 'sku', 'sku');
    }

    public function printer()
    {
        return $this->belongsTo(Printer::class, 'printer_id');
    }

    public static function cetakList()
    {
        return [
            0 => "Tidak Cetak",
            1 => "Bar",
            2 => "Dapur1",
            3 => "Dapur2",
            4 => "Dapur3",
        ];
    }

    public static function cetakStr($key)
    {
        return Barang::cetakList()[$key];
    }

    public static function import()
    {
        $db = env("DB_OFFICE", "");

        if ($db != "") {
            $fields = [
                'sku',
                'deskripsi',
                'alias_name as alias',
                'satuan',
                'isi',
                'volume',
                'id_kategori as kategori_id',
                'id_subkat as kategorisub_id',
                'stat_aktif as st_aktif',
                'price_sell as harga_jual',
                'cetak as printer_id',
                'checker as checker_id',
                'b_disc as block_disc'
            ];
            $barang_old = DB::table("$db.barang")->select($fields)->orderBy('sku')->get();

            $kategori = Kategori::all();
            $kategorisub = Kategorisub::all();

            foreach ($barang_old as $v) {
                $sku = $v->sku;
                unset($v->sku);

                foreach ($kategori as $vv) {
                    if ($v->kategori_id === $vv->id_old) {
                        $v->kategori_id = $vv->id;
                    }
                }

                foreach ($kategorisub as $vv) {
                    if ($v->kategorisub_id === $vv->id_old) {
                        $v->kategorisub_id = $vv->id;
                    }
                }

                Barang::updateOrCreate(["sku" => $sku], get_object_vars($v));
            }
        }

        return true;
    }
}
