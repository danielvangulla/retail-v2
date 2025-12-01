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
            'alias',
            'satuan',
            'isi',
            'volume',
            'harga_jual1',
            'harga_jual2',
            'multiplier',
            'st_aktif',
        )->with([
            'prices' => function ($q) {
                $q->select('id', 'barang_id', 'qty', 'harga1', 'harga2', 'multiplier')
                    ->orderBy('qty');
            },
            'promo' => function ($q) {
                $date = date('Y-m-d');
                $q->select('barang_id', 'is_aktif', 'tgl_from', 'tgl_to', 'max_qty', 'harga_promo')
                    ->where('tgl_from', '<=', $date)
                    ->where('tgl_to', '>=', $date)
                    ->where('is_aktif', 1);
            },
        ])->where('st_aktif', 1)
        ->orderBy('sku')
        ->get();
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

        // Sudah di-filter st_aktif=1 di query, langsung return
        return $barangList->values();
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
