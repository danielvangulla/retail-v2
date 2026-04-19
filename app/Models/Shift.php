<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Shift extends Model
{
    use HasFactory, HasUuids;

    protected $primaryKey = 'id';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'kasir_id',
        'open_time',
        'close_time',
        'saldo_awal',
        'saldo_akhir',
        'total_penjualan',
        'total_tunai',
        'total_nontunai',
        'jumlah_transaksi',
        'keterangan',
        'is_closed',
    ];

    protected function casts(): array
    {
        return [
            'open_time' => 'datetime',
            'close_time' => 'datetime',
            'saldo_awal' => 'decimal:2',
            'saldo_akhir' => 'decimal:2',
            'total_penjualan' => 'decimal:2',
            'total_tunai' => 'decimal:2',
            'total_nontunai' => 'decimal:2',
            'is_closed' => 'boolean',
        ];
    }

    public function kasir(): BelongsTo
    {
        return $this->belongsTo(User::class, 'kasir_id');
    }
}
