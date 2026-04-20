<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            TransaksiTypeSeeder::class,
            JobSeeder::class,
            SetupSeeder::class,
            PiutangSeeder::class,
            DiscountSeeder::class,
            PrinterSeeder::class,
            MejaSeeder::class,
            KomplemenSeeder::class,
            BarangDummySeeder::class,
            InitializeBarangStockSeeder::class,
        ]);
    }
}
