<?php

namespace App\Models;

use App\Traits\HasQueue;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransaksiDetail extends Model
{
    use HasFactory, HasUuids, HasQueue;

    protected $primaryKey = 'id';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $table = 'transaksi_dets';

    protected $guarded = ['id'];

    protected $hidden = [
        'created_at',
        'updated_at',
        'printed_at',
    ];

    protected $casts = [];

    public function barang()
    {
        return $this->belongsTo(Barang::class, 'sku', 'sku');
    }

    public function transaksi()
    {
        return $this->belongsTo(Transaksi::class, 'transaksi_id');
    }

    public function captain()
    {
        return $this->belongsTo(User::class, 'user_order_id');
    }

    public static function getBillOrders($transaksi_id)
    {
        $orders = self::selectRaw('sku, harga, user_order_id, sum(qty) as qty, sum(brutto) as brutto')
            ->where('transaksi_id', $transaksi_id)
            ->where('qty', '>', 0)
            ->with(['barang' => function ($query) {
                $query->select('sku', 'deskripsi');
            }, 'captain' => function ($query) {
                $query->select('id', 'name');
            }])
            ->groupBy('sku', 'harga', 'user_order_id')
            ->get();
        return $orders;
    }
}
