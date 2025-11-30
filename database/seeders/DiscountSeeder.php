<?php

namespace Database\Seeders;

use App\Models\Discount;
use Illuminate\Database\Seeder;

class DiscountSeeder extends Seeder
{
    public function run(): void
    {
        $komplemen = [
            ['name' => 'No Discount', 'persen' => 0],
            ['name' => 'Disc SPV', 'persen' => 10],
            ['name' => 'Disc Manager', 'persen' => 20],
        ];

        foreach ($komplemen as $v) {
            Discount::create($v);
        }
    }
}
