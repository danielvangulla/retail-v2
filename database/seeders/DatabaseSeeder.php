<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Admin',
                'password' => bcrypt('admin123'),
                'email_verified_at' => now(),
            ]
        );

        // Call application seeders ported from the original project
        $this->call([
            UserSeeder::class,
            TransaksiTypeSeeder::class,
            JobSeeder::class,
            SetupSeeder::class,
            PiutangSeeder::class,
            DiscountSeeder::class,
            // Optional: BarangSeeder, KategoriSeeder, KategorisubSeeder, PrinterSeeder, MejaSeeder
        ]);
    }
}
