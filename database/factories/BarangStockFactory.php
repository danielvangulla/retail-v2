<?php

namespace Database\Factories;

use App\Models\BarangStock;
use App\Models\Barang;
use Illuminate\Database\Eloquent\Factories\Factory;

class BarangStockFactory extends Factory
{
    protected $model = BarangStock::class;

    public function definition(): array
    {
        return [
            'barang_id' => Barang::factory(),
            'quantity' => $this->faker->numberBetween(0, 1000),
            'reserved' => 0,
            'harga_rata_rata' => $this->faker->randomFloat(0, 1, 50),
        ];
    }
}
