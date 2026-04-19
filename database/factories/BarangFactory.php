<?php

namespace Database\Factories;

use App\Models\Barang;
use App\Models\Kategori;
use App\Models\Kategorisub;
use Illuminate\Database\Eloquent\Factories\Factory;

class BarangFactory extends Factory
{
    protected $model = Barang::class;

    public function definition(): array
    {
        $kategori = Kategori::factory();
        $kategorisub = Kategorisub::factory();

        return [
            'kategori_id' => $kategori,
            'kategorisub_id' => $kategorisub,
            'sku' => $this->faker->unique()->word() . rand(1000, 9999),
            'barcode' => $this->faker->unique()->ean13(),
            'deskripsi' => $this->faker->sentence(3),
            'alias' => $this->faker->word(),
            'satuan' => 'Pcs',
            'isi' => 1,
            'volume' => '1',
            'harga_beli' => $this->faker->randomFloat(2, 1, 50),
            'harga_jual1' => $this->faker->randomFloat(2, 10, 100),
            'harga_jual2' => $this->faker->randomFloat(2, 5, 80),
            'min_stock' => 10,
            'st_aktif' => 1,
        ];
    }
}
