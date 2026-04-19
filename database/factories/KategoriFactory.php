<?php

namespace Database\Factories;

use App\Models\Kategori;
use Illuminate\Database\Eloquent\Factories\Factory;

class KategoriFactory extends Factory
{
    protected $model = Kategori::class;

    public function definition(): array
    {
        return [
            'ket' => $this->faker->unique()->word(),
            'sku_from' => 0,
            'sku_to' => 0,
        ];
    }
}
