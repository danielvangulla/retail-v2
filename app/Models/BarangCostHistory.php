<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class BarangCostHistory extends Model
{
    use HasUuids;

    protected $table = 'barang_cost_history';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'barang_id',
        'harga_rata_rata_lama',
        'harga_rata_rata_baru',
        'trigger_type',
        'reference_id',
        'reference_type',
        'notes',
        'changed_by',
    ];

    protected $casts = [
        'harga_rata_rata_lama' => 'integer',
        'harga_rata_rata_baru' => 'integer',
    ];

    public function barang()
    {
        return $this->belongsTo(Barang::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
