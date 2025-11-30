<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'level' => 1,
                'name' => 'Supervisor',
                'email' => 'spv@mail.com',
                'password' => bcrypt('11111111'),
                'pin' => '11111111'
            ],
            [
                'level' => 2,
                'name' => 'Kasir',
                'email' => 'kasir@mail.com',
                'password' => bcrypt('22222222'),
                'pin' => '22222222'
            ],
        ];

        foreach ($users as $k => $v) {
            User::factory()->create($v);
        }
    }
}
