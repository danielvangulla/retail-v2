<?php

namespace App\Models;

use App\Events\BarangCreated;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
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

    protected $casts = [
        'allow_sold_zero_stock' => 'boolean',
    ];

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
            'barang.id',
            'barang.sku',
            'barang.barcode',
            'barang.deskripsi',
            'barang.alias',
            'barang.satuan',
            'barang.isi',
            'barang.volume',
            'barang.harga_jual1',
            'barang.harga_jual2',
            'barang.multiplier',
            'barang.st_aktif',
            'barang.allow_sold_zero_stock',
            DB::raw('COALESCE(barang_stock.quantity, 0) as quantity'),
            DB::raw('COALESCE(barang_stock.reserved, 0) as reserved'),
            DB::raw('GREATEST(0, COALESCE(barang_stock.quantity, 0) - COALESCE(barang_stock.reserved, 0)) as stock')
        )->leftJoin('barang_stock', 'barang.id', '=', 'barang_stock.barang_id')
        ->with([
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
        ])->where('barang.st_aktif', 1)
        ->groupBy('barang.id', 'barang.sku', 'barang.barcode', 'barang.deskripsi', 'barang.alias', 'barang.satuan', 'barang.isi', 'barang.volume', 'barang.harga_jual1', 'barang.harga_jual2', 'barang.multiplier', 'barang.st_aktif', 'barang.allow_sold_zero_stock', 'barang_stock.quantity', 'barang_stock.reserved')
        ->orderBy('barang.sku')
        ->get();
    }

    /**
     * Search barang on-demand dengan realtime stok
     * Dipanggil saat user search, limit 20 hasil
     */
    public static function searchBarang($query)
    {
        $searchTerm = '%' . $query . '%';

        return self::select(
            'barang.id',
            'barang.sku',
            'barang.barcode',
            'barang.deskripsi',
            'barang.alias',
            'barang.satuan',
            'barang.isi',
            'barang.volume',
            'barang.harga_jual1',
            'barang.harga_jual2',
            'barang.multiplier',
            'barang.st_aktif',
            'barang.allow_sold_zero_stock',
            DB::raw('COALESCE(barang_stock.quantity, 0) as quantity'),
            DB::raw('COALESCE(barang_stock.reserved, 0) as reserved'),
            DB::raw('GREATEST(0, COALESCE(barang_stock.quantity, 0) - COALESCE(barang_stock.reserved, 0)) as stock')
        )->leftJoin('barang_stock', 'barang.id', '=', 'barang_stock.barang_id')
        ->where('barang.st_aktif', 1)
        ->where(function ($q) use ($searchTerm) {
            $q->where('barang.barcode', 'LIKE', $searchTerm)
              ->orWhere('barang.deskripsi', 'LIKE', $searchTerm)
              ->orWhere('barang.sku', 'LIKE', $searchTerm)
              ->orWhere('barang.alias', 'LIKE', $searchTerm);
        })
        ->groupBy('barang.id', 'barang.sku', 'barang.barcode', 'barang.deskripsi', 'barang.alias', 'barang.satuan', 'barang.isi', 'barang.volume', 'barang.harga_jual1', 'barang.harga_jual2', 'barang.multiplier', 'barang.st_aktif', 'barang.allow_sold_zero_stock', 'barang_stock.quantity', 'barang_stock.reserved')
        ->orderBy('barang.deskripsi')
        ->limit(20)
        ->get();
    }

    /**
     * Get bulk stock status for multiple items (useful for cart verification)
     * Returns array keyed by barang_id with available stock
     */
    public static function getBulkStockStatus(array $barangIds): array
    {
        if (empty($barangIds)) {
            return [];
        }

        $barangs = self::whereIn('id', $barangIds)
            ->select('id', 'allow_sold_zero_stock')
            ->keyBy('id')
            ->get();

        $stocks = BarangStock::whereIn('barang_id', $barangIds)
            ->select('barang_id', 'quantity', 'reserved')
            ->get()
            ->keyBy('barang_id');

        $result = [];
        foreach ($barangIds as $id) {
            $stock = $stocks->get($id);
            $available = $stock ? max(0, $stock->quantity - $stock->reserved) : 0;
            $barang = $barangs->get($id);
            $result[$id] = [
                'available' => $available,
                'quantity' => $stock?->quantity ?? 0,
                'reserved' => $stock?->reserved ?? 0,
                'allow_sold_zero_stock' => $barang?->allow_sold_zero_stock ?? false,
            ];
        }

        return $result;
    }



    public static function getAllBarang($show)
    {
        // Real-time query tanpa cache untuk stok terkini
        return self::getBarangList()->values();
    }

    public static function getHargaBeli($id)
    {
        $barang = self::find($id);

        if ($barang) {
            return $barang->harga_beli ?? 0;
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

    public function stock()
    {
        return $this->hasOne(BarangStock::class, 'barang_id', 'id');
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
