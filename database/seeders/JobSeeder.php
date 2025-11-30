<?php

namespace Database\Seeders;

use App\Models\Job;
use Illuminate\Database\Seeder;

class JobSeeder extends Seeder
{
    public function run(): void
    {
        $job = [
            ['process_name' => 'sync_barang'],
        ];

        foreach ($job as $v) {
            Job::create($v);
        }
    }
}
