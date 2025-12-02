<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Job extends Model
{
    use HasFactory;

    protected $table = 'jobs';

    protected $guarded = [];

    // Allow all attributes to be mass-assignable
    protected $fillable = ['process_name', 'is_running', 'by', 'queue', 'payload', 'attempts', 'reserved_at', 'available_at'];
}
