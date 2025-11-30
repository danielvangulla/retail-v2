<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Kategori extends Model
{
    use HasFactory, HasUuids;

    protected $primaryKey = 'id';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $table = 'kategori';

    protected $guarded = ['id'];

    protected $hidden = [
        'created_at',
        'updated_at',
    ];

    protected $casts = [];

    public static function getUsed()
    {
        $kategori = Kategori::select(['kategori.id', 'kategori.ket'])
            ->join('barang', 'kategori.id', '=', 'barang.kategori_id')
            ->where('barang.st_aktif', 1)
            ->groupBy('kategori.id')->get();
        return $kategori;
    }


    public static function import()
    {
        $db = env("DB_OFFICE", "");

        $fields = ['id_kategori as id_old', 'kategori as ket'];
        $barang_office = DB::table("$db.kategori")->select($fields)->orderBy('id_kategori')->get();

        foreach ($barang_office as $v) {
            Kategori::updateOrCreate(["id_old" => $v->id_old], ["ket" => $v->ket]);
        }

        // return true;
    }
}
