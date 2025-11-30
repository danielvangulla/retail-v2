<?php

namespace Database\Seeders;

use App\Models\Piutang;
use Illuminate\Database\Seeder;

class PiutangSeeder extends Seeder
{
    public function run(): void
    {
        $faker = \Faker\Factory::create();

        for ($i = 0; $i < 5; $i++) {
            Piutang::create([
                'name' => $faker->firstName(),
                'is_staff' => $faker->boolean(),
            ]);
        }
    }
}
