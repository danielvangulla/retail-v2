<?php

namespace Database\Factories;

use App\Models\Opname;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class OpnameFactory extends Factory
{
    protected $model = Opname::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'no_opname' => $this->faker->unique()->numerify('OP-####'),
            'tgl' => now(),
            'keterangan' => $this->faker->sentence(),
        ];
    }
}
