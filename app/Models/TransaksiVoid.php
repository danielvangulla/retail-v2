<?php

namespace App\Models;

use App\Traits\HasQueue;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransaksiVoid extends Model
{
    use HasFactory, HasUuids, HasQueue;

    protected $primaryKey = 'id';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $table = 'transaksi_voids';

    protected $guarded = ['id'];

    protected $hidden = [];

    protected $casts = [];
}
