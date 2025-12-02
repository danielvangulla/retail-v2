<?php

namespace App\Models;

use App\Traits\ManageStok;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BarangStock extends Model
{
    use HasFactory, HasUuids, ManageStok;

    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $table = 'barang_stock';

    protected $fillable = [
        'barang_id',
        'quantity',
        'reserved',
        'available',
        'last_updated_at',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'reserved' => 'integer',
        'available' => 'integer',
        'last_updated_at' => 'datetime',
    ];

    public function barang()
    {
        return $this->belongsTo(Barang::class);
    }

    public function movements()
    {
        return $this->hasMany(BarangStockMovement::class, 'barang_id', 'barang_id');
    }

    /**
     * Hitung available stock secara dinamis
     */
    public function getAvailableAttribute()
    {
        return max(0, $this->quantity - $this->reserved);
    }

    /**
     * Check apakah stok mencukupi
     */
    public function isAvailable(int $qty): bool
    {
        return $this->getAvailableAttribute() >= $qty;
    }
}
