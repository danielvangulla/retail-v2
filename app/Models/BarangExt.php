<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class BarangExt extends Model
{
    use HasFactory, HasUuids;

    protected $primaryKey = 'id';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $table = 'barang_ext';

    protected $guarded = ['id'];

    protected $hidden = [
        'created_at',
        'updated_at',
    ];

    protected $casts = [];


    public static function import()
    {
        $db = env("DB_OFFICE", "u_oreilysmgs2");

        if ($db != "") {
            $fields = [
                'sku',
                'st_senin',
                'st_selasa',
                'st_rabu',
                'st_kamis',
                'st_jumat',
                'st_sabtu',
                'st_minggu',
                'st_seharian',
            ];
            $barang_old = DB::table("$db.barang")->select($fields)->orderBy('sku')->get();

            foreach ($barang_old as $k => $v) {
                $sku = $v->sku;
                unset($v->sku);

                BarangExt::updateOrCreate(["sku" => $sku], get_object_vars($v));
            }
        }

        return true;
    }
}
