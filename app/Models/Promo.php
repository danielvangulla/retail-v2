<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Promo extends Model
{
    use HasFactory, HasUuids;

    protected $primaryKey = 'id';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $table = 'promos';

    protected $guarded = ['id'];

    protected $hidden = [];

    public function barang()
    {
        return $this->belongsTo(Barang::class);
    }

    public static function setPromo(object $v): void
    {
        $arr = [
            'barang_id' => $v->id,
            'tgl_from' => $v->tglFrom,
            'tgl_to' => $v->tglTo,
            'max_qty' => $v->maxQty,
            'harga_promo' => $v->hargaPromo,
        ];

        $exists = self::where('barang_id', $v->id)->exists();
        if ($exists) {
            self::where('barang_id', $v->id)->update($arr);
        } else {
            self::create($arr);
        }
    }
}
