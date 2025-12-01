<?php

namespace App\Models;

use App\Http\Controllers\Helpers;
use App\Traits\HasQueue;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LogLogin extends Model
{
    use HasFactory, HasUuids, HasQueue;

    protected $primaryKey = 'id';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $table = 'log_login';

    protected $guarded = ['id'];

    protected $hidden = [
        'created_at',
        'updated_at',
    ];

    protected $casts = [
        'open' => 'datetime',
        'close' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public static function shiftExistToday()
    {
        $tgl = Helpers::transactionDate();
        $isExist = self::where('tgl', $tgl)->whereNull('close_time')->exists();
        return $isExist;
    }

    public static function shiftExistAny()
    {
        $isExist = self::whereNull('close_time')->exists();
        return $isExist;
    }

    public static function currentShift()
    {
        $data = self::with('user')->whereNull('close_time')->first();

        $shift = [
            'open_time' => '-',
            'shift' => '-',
            'user' => '-',
        ];

        if ($data) {
            $shift['open_time'] = $data->open_time;
            $shift['shift'] = $data->shift;
            $shift['user'] = $data->user->name;
        }

        return $shift;
    }
}
