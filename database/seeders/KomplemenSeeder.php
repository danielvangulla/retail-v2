<?php

namespace Database\Seeders;

use App\Models\Komplemen;
use Illuminate\Database\Seeder;

class KomplemenSeeder extends Seeder
{
    public function run(): void
    {
        $komplemen = [
            ['name' => 'Owner', 'is_aktif' => 1, 'limit' => 0],
            ['name' => 'Manager', 'is_aktif' => 1, 'limit' => 0],
        ];

        foreach ($komplemen as $v) {
            Komplemen::updateOrCreate(
                ['name' => $v['name']],
                $v
            );
        }
    }
}
