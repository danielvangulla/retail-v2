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
                'name' => 'admin',
                'email' => 'admin@mail.com',
                'password' => bcrypt('password123'),
                'email_verified_at' => now(),
            ],
            [
                'level' => 2,
                'name' => 'spv',
                'email' => 'spv@mail.com',
                'password' => bcrypt('password123'),
                'email_verified_at' => now(),
            ],
            [
                'level' => 3,
                'name' => 'kasir',
                'email' => 'kasir@mail.com',
                'password' => bcrypt('password123'),
                'email_verified_at' => now(),
            ],
        ];

        foreach ($users as $userData) {
            User::updateOrCreate(
                ['email' => $userData['email']],
                $userData
            );
        }
    }
}
