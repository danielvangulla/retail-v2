<?php

namespace Database\Seeders;

use App\Models\Komplemen;
use Illuminate\Database\Seeder;

class KomplemenSeeder extends Seeder
{
    public function run(): void
    {
        $komplemen = [
            ['name' => 'Owner'],
            ['name' => 'Manager'],
        ];

        foreach ($komplemen as $v) {
            Komplemen::create($v);
        }
    }
}
