<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Piutang extends Model
{
    use HasFactory, HasUuids;

    protected $primaryKey = 'id';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $table = 'piutangs';

    protected $guarded = ['id'];

    protected $hidden = [];

    public function transaksis()
    {
        return $this->hasMany(Transaksi::class);
    }

    public function bayar()
    {
        return $this->hasOne(PiutangBayar::class);
    }

    // public function bayars()
    // {
    //     return $this->hasMany(PiutangBayar::class);
    // }
}
