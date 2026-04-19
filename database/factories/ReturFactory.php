<?php

namespace Database\Factories;

use App\Models\BarangRetur;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ReturFactory extends Factory
{
    protected $model = BarangRetur::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'no_retur' => $this->faker->unique()->numerify('RT-####'),
            'tgl' => now(),
            'jenis_retur' => 'Tolak',
            'total_qty' => 0,
            'total_harga' => 0,
            'keterangan' => $this->faker->sentence(),
        ];
    }
}
