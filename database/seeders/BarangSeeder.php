<?php

namespace Database\Seeders;

use App\Models\Barang;
use App\Models\Kategori;
use App\Models\Kategorisub;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class BarangSeeder extends Seeder
{
    public function run(): void
    {
        $faker = \Faker\Factory::create();

        $kategori = Kategori::pluck('id')->toArray();
        $kategorisub = Kategorisub::pluck('id')->toArray();

        for ($i = 0; $i < 50; $i++) {
            $sku = fake()->numberBetween(11111111, 99999999);
            $harga1 = $faker->numberBetween(10000, 100000);
            $harga2 = $harga1 + 5000;

            Barang::updateOrCreate(
                ['sku' => $sku],
                [
                    'sku' => $sku,
                    'barcode' => fake()->numberBetween(111111111111, 999999999999),
                    'deskripsi' => $faker->words(3, true),
                    'alias' => $faker->words(2, true),
                    'satuan' => $faker->word(),
                    'volume' => $faker->word(),
                    'kategori_id' => $faker->randomElement($kategori),
                    'kategorisub_id' => $faker->randomElement($kategorisub),
                    'harga_jual1' => $harga1,
                    'harga_jual2' => $harga2,
                ]
            );
        }
    }
}
