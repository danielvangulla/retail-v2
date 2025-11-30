<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Queue extends Model
{
    use HasFactory, HasUuids;

    protected $primaryKey = 'id';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $table = 'queues';

    protected $guarded = ['id'];

    protected $hidden = [
        'created_at',
        'updated_at',
    ];

    protected $casts = [];

    public static function getData()
    {
        try {
            $data = self::select('id', 'command', 'table_name', 'data')
                ->where('sent', 0)->orderBy('updated_at')->get();

            $data->transform(function ($v, $k) {
                $v->data = json_decode($v->data);
                return $v;
            });

            return $data;
        } catch (\Throwable $th) {
            return "$th";
        }
    }

    public static function setData($id)
    {
        try {
            self::find($id)->update([
                'sent' => 1
            ]);

            return "ok";
        } catch (\Throwable $th) {
            return "$th";
        }
    }
}
