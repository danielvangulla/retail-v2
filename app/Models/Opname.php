<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;

class Opname extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $primaryKey = 'id';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $table = 'opnames';

    protected $guarded = ['id'];

    protected $hidden = [
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    protected function casts(): array
    {
        return [
            'tgl' => 'date',
            'sistem' => 'integer',
            'fisik' => 'integer',
            'selisih' => 'integer',
        ];
    }

    /**
     * Relationship to User (yang melakukan opname)
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relationship to Barang (item yang diopname)
     */
    public function barang()
    {
        return $this->belongsTo(Barang::class);
    }

    /**
     * Calculate difference between sistem dan fisik
     */
    public function calculateSelisih(): int
    {
        return $this->fisik - $this->sistem;
    }

    /**
     * Check if opname has difference
     */
    public function hasDifference(): bool
    {
        return $this->selisih !== 0;
    }

    /**
     * Get opname summary for a date range
     */
    public static function getSummary($startDate = null, $endDate = null)
    {
        $query = self::query();

        if ($startDate) {
            $query->whereDate('tgl', '>=', $startDate);
        }

        if ($endDate) {
            $query->whereDate('tgl', '<=', $endDate);
        }

        return $query->select(
            'barang_id',
            DB::raw('SUM(sistem) as total_sistem'),
            DB::raw('SUM(fisik) as total_fisik'),
            DB::raw('SUM(selisih) as total_selisih'),
            DB::raw('COUNT(*) as opname_count')
        )->groupBy('barang_id')
            ->get();
    }
}
