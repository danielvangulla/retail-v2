<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PembelianDet extends Model
{
    use HasFactory, HasUuids;

    protected $primaryKey = 'id';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $table = 'pembelian_dets';

    protected $guarded = ['id'];

    protected $hidden = [
        'created_at',
        'updated_at',
    ];

    protected $casts = [];

    public function barang()
    {
        return $this->belongsTo(Barang::class, 'sku', 'sku');
    }

    public function pembelian()
    {
        return $this->belongsTo(Pembelian::class);
    }
}
