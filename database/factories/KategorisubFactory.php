<?php

namespace Database\Factories;

use App\Models\Kategorisub;
use App\Models\Kategori;
use Illuminate\Database\Eloquent\Factories\Factory;

class KategorisubFactory extends Factory
{
    protected $model = Kategorisub::class;

    public function definition(): array
    {
        return [
            'kategori_id' => Kategori::factory(),
            'ket' => $this->faker->unique()->word(),
        ];
    }
}
