<?php

namespace App\Models;

use App\Traits\HasQueue;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PiutangBayar extends Model
{
    use HasFactory, HasUuids, HasQueue;

    protected $primaryKey = 'id';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $table = 'piutang_bayars';

    protected $guarded = ['id'];

    protected $hidden = [];

    public function piutang()
    {
        return $this->belongsTo(Piutang::class);
    }

    public function transaksi()
    {
        return $this->belongsTo(Transaksi::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
