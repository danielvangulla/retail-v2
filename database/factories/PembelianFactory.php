<?php

namespace Database\Factories;

use App\Models\Pembelian;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class PembelianFactory extends Factory
{
    protected $model = Pembelian::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'no_pembelian' => $this->faker->unique()->numerify('PB-####'),
            'no_po' => $this->faker->numerify('PO-####'),
            'tgl' => now(),
            'supplier' => $this->faker->company(),
            'total_qty' => 0,
            'total_harga' => 0,
            'ppn' => 0,
            'keterangan' => $this->faker->sentence(),
        ];
    }
}
