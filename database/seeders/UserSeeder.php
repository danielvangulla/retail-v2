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
                'name' => 'supervisor',
                'email' => 'supervisor@mail.com',
                'password' => bcrypt('password123'),
            ],
            [
                'level' => 2,
                'name' => 'kasir',
                'email' => 'kasir@mail.com',
                'password' => bcrypt('password123'),
            ],
        ];

        foreach ($users as $user) {
            User::factory()->create($user);
        }
    }
}
