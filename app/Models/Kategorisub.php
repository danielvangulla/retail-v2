<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Kategorisub extends Model
{
    use HasFactory, HasUuids;

    protected $primaryKey = 'id';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $table = 'kategorisub';

    protected $guarded = ['id'];

    protected $hidden = [
        'created_at',
        'updated_at',
    ];

    protected $casts = [];

    public function kategori()
    {
        return $this->belongsTo(Kategori::class);
    }

    public function barangs()
    {
        return $this->hasMany(Barang::class, 'kategorisub_id');
    }

    public static function getUsed()
    {
        $kategorisub = Kategorisub::select(['kategorisub.id', 'kategorisub.kategori_id', 'kategorisub.ket'])
            ->join('barang', 'kategorisub.id', '=', 'barang.kategorisub_id')
            ->where('barang.st_aktif', 1)
            ->groupBy('kategorisub.id')->get();
        return $kategorisub;
    }


    public static function import()
    {
        $db = env("DB_OFFICE", "");

        $fields = ['id_subkat as id_old', 'id_kategori as kategori_id', 'ket'];
        $barang_office = DB::table("$db.subkat")->select($fields)->orderBy('id_kategori')->get();

        $kategori = Kategori::all();

        foreach ($barang_office as $v) {
            foreach ($kategori as $vv) {
                if ($v->kategori_id === $vv->id_old) {
                    $v->kategori_id = $vv->id;
                }
            }

            Kategorisub::updateOrCreate(["id_old" => $v->id_old], ["kategori_id" => $v->kategori_id, "ket" => $v->ket]);
        }

        return true;
    }
}
