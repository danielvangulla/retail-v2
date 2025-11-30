<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Meja extends Model
{
    use HasFactory, HasUuids;

    protected $primaryKey = 'id';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $table = 'meja';

    protected $guarded = ['id'];

    protected $hidden = [
        'created_at',
        'updated_at',
        'floor',
        'st_aktif',
    ];

    protected $casts = [];

    public static $EMPTY = 0;
    public static $CHECK_IN = 1;
    public static $ORDER = 2;
    public static $PRINT_BILL = 3;
    public static $PAID = 4;
    public static $USED = 9;

    public static function getAllAvailable()
    {
        $meja = self::select('id', 'no')
            ->whereDoesntHave('transaksi', function ($query) {
                $query->whereBetween('status', [1, 4]);
            })->orderBy('no')->get();

        return $meja;
    }

    public static function getAllCheckedIn()
    {
        $meja = self::select('id', 'no')
            ->whereHas('transaksi', function ($query) {
                $query->where('status', 1);
            })->orderBy('no')->get();

        return $meja;
    }

    public function transaksi()
    {
        return $this->hasMany(Transaksi::class, 'meja', 'no');
    }
}
