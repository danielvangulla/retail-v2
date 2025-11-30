<?php

namespace Database\Seeders;

use App\Models\Kategori;
use App\Models\Kategorisub;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class KategorisubSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = \Faker\Factory::create();

        $kategori = Kategori::pluck('id')->toArray();

        for ($i = 0; $i < 1; $i++) {
            Kategorisub::create([
                'kategori_id' => $faker->randomElement($kategori),
                'ket' => $faker->word(),
            ]);
        }
    }
}
