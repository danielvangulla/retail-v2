<?php

namespace App\Models;

use App\Traits\HasQueue;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransaksiPayment extends Model
{
    use HasFactory, HasUuids, HasQueue;

    protected $primaryKey = 'id';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $table = 'transaksi_payments';

    protected $guarded = ['id'];

    protected $hidden = [];

    protected $casts = [];

    public function type()
    {
        return $this->belongsTo(TransaksiPaymentType::class, 'type_id');
    }

    public function transaksi()
    {
        return $this->belongsTo(Transaksi::class);
    }
}
