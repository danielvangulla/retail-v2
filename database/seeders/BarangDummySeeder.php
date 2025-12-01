<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BarangDummySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Kategori
        $kategoriMinuman = DB::table('kategori')->insertGetId([
            'id' => Str::uuid(),
            'ket' => 'Minuman',
            'sku_from' => '1000',
            'sku_to' => '1999',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $kategoriMakanan = DB::table('kategori')->insertGetId([
            'id' => Str::uuid(),
            'ket' => 'Makanan',
            'sku_from' => '2000',
            'sku_to' => '2999',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $kategoriSnack = DB::table('kategori')->insertGetId([
            'id' => Str::uuid(),
            'ket' => 'Snack',
            'sku_from' => '3000',
            'sku_to' => '3999',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $kategoriRokok = DB::table('kategori')->insertGetId([
            'id' => Str::uuid(),
            'ket' => 'Rokok',
            'sku_from' => '4000',
            'sku_to' => '4999',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Get kategori IDs
        $minumanId = DB::table('kategori')->where('ket', 'Minuman')->value('id');
        $makananId = DB::table('kategori')->where('ket', 'Makanan')->value('id');
        $snackId = DB::table('kategori')->where('ket', 'Snack')->value('id');
        $rokokId = DB::table('kategori')->where('ket', 'Rokok')->value('id');

        // Create Kategorisub
        $subMinumanDingin = DB::table('kategorisub')->insertGetId([
            'id' => Str::uuid(),
            'kategori_id' => $minumanId,
            'ket' => 'Minuman Dingin',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $subMakananBerat = DB::table('kategorisub')->insertGetId([
            'id' => Str::uuid(),
            'kategori_id' => $makananId,
            'ket' => 'Makanan Berat',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $subSnackRingan = DB::table('kategorisub')->insertGetId([
            'id' => Str::uuid(),
            'kategori_id' => $snackId,
            'ket' => 'Snack Ringan',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Get kategorisub IDs
        $minumanDinginId = DB::table('kategorisub')->where('ket', 'Minuman Dingin')->value('id');
        $makananBeratId = DB::table('kategorisub')->where('ket', 'Makanan Berat')->value('id');
        $snackRinganId = DB::table('kategorisub')->where('ket', 'Snack Ringan')->value('id');

        // Create 10 Barang Dummy
        $barangData = [
            [
                'id' => Str::uuid(),
                'sku' => '1001',
                'barcode' => '8992761110017',
                'deskripsi' => 'Aqua Botol 600ml',
                'alias' => 'Aqua',
                'st_aktif' => 1,
                'satuan' => 'Botol',
                'isi' => 1,
                'volume' => '600ml',
                'min_stock' => 50,
                'harga_beli' => 3000,
                'harga_jual1' => 4000,
                'harga_jual2' => 4500,
                'multiplier' => false,
                'printer_id' => 0,
                'checker_id' => 0,
                'block_disc' => 0,
                'kategori_id' => $minumanId,
                'kategorisub_id' => $minumanDinginId,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid(),
                'sku' => '1002',
                'barcode' => '8992761106017',
                'deskripsi' => 'Teh Botol Sosro 450ml',
                'alias' => 'Teh Botol',
                'st_aktif' => 1,
                'satuan' => 'Botol',
                'isi' => 1,
                'volume' => '450ml',
                'min_stock' => 40,
                'harga_beli' => 4000,
                'harga_jual1' => 5500,
                'harga_jual2' => 6000,
                'multiplier' => false,
                'printer_id' => 0,
                'checker_id' => 0,
                'block_disc' => 0,
                'kategori_id' => $minumanId,
                'kategorisub_id' => $minumanDinginId,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid(),
                'sku' => '1003',
                'barcode' => '8996001600184',
                'deskripsi' => 'Coca Cola 330ml',
                'alias' => 'Coca Cola',
                'st_aktif' => 1,
                'satuan' => 'Kaleng',
                'isi' => 1,
                'volume' => '330ml',
                'min_stock' => 30,
                'harga_beli' => 5000,
                'harga_jual1' => 7000,
                'harga_jual2' => 7500,
                'multiplier' => false,
                'printer_id' => 0,
                'checker_id' => 0,
                'block_disc' => 0,
                'kategori_id' => $minumanId,
                'kategorisub_id' => $minumanDinginId,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid(),
                'sku' => '2001',
                'barcode' => '8992696211018',
                'deskripsi' => 'Indomie Goreng',
                'alias' => 'Mie Goreng',
                'st_aktif' => 1,
                'satuan' => 'Bungkus',
                'isi' => 1,
                'volume' => '85g',
                'min_stock' => 100,
                'harga_beli' => 2500,
                'harga_jual1' => 3500,
                'harga_jual2' => 4000,
                'multiplier' => false,
                'printer_id' => 0,
                'checker_id' => 0,
                'block_disc' => 0,
                'kategori_id' => $makananId,
                'kategorisub_id' => $makananBeratId,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid(),
                'sku' => '2002',
                'barcode' => '8992696212015',
                'deskripsi' => 'Indomie Soto',
                'alias' => 'Mie Soto',
                'st_aktif' => 1,
                'satuan' => 'Bungkus',
                'isi' => 1,
                'volume' => '70g',
                'min_stock' => 80,
                'harga_beli' => 2500,
                'harga_jual1' => 3500,
                'harga_jual2' => 4000,
                'multiplier' => false,
                'printer_id' => 0,
                'checker_id' => 0,
                'block_disc' => 0,
                'kategori_id' => $makananId,
                'kategorisub_id' => $makananBeratId,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid(),
                'sku' => '3001',
                'barcode' => '8992741601016',
                'deskripsi' => 'Chitato Rasa Sapi Panggang 68g',
                'alias' => 'Chitato',
                'st_aktif' => 1,
                'satuan' => 'Bungkus',
                'isi' => 1,
                'volume' => '68g',
                'min_stock' => 50,
                'harga_beli' => 8000,
                'harga_jual1' => 11000,
                'harga_jual2' => 12000,
                'multiplier' => false,
                'printer_id' => 0,
                'checker_id' => 0,
                'block_disc' => 0,
                'kategori_id' => $snackId,
                'kategorisub_id' => $snackRinganId,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid(),
                'sku' => '3002',
                'barcode' => '8992741501013',
                'deskripsi' => 'Cheetos Jagung Bakar 35g',
                'alias' => 'Cheetos',
                'st_aktif' => 1,
                'satuan' => 'Bungkus',
                'isi' => 1,
                'volume' => '35g',
                'min_stock' => 40,
                'harga_beli' => 5000,
                'harga_jual1' => 7000,
                'harga_jual2' => 7500,
                'multiplier' => false,
                'printer_id' => 0,
                'checker_id' => 0,
                'block_disc' => 0,
                'kategori_id' => $snackId,
                'kategorisub_id' => $snackRinganId,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid(),
                'sku' => '4001',
                'barcode' => '8992222230018',
                'deskripsi' => 'Gudang Garam Filter',
                'alias' => 'GG Filter',
                'st_aktif' => 1,
                'satuan' => 'Bungkus',
                'isi' => 12,
                'volume' => '12 Batang',
                'min_stock' => 20,
                'harga_beli' => 18000,
                'harga_jual1' => 22000,
                'harga_jual2' => 23000,
                'multiplier' => false,
                'printer_id' => 0,
                'checker_id' => 0,
                'block_disc' => 1,
                'kategori_id' => $rokokId,
                'kategorisub_id' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid(),
                'sku' => '4002',
                'barcode' => '8992222231015',
                'deskripsi' => 'Sampoerna Mild 16',
                'alias' => 'A Mild',
                'st_aktif' => 1,
                'satuan' => 'Bungkus',
                'isi' => 16,
                'volume' => '16 Batang',
                'min_stock' => 20,
                'harga_beli' => 25000,
                'harga_jual1' => 30000,
                'harga_jual2' => 31000,
                'multiplier' => false,
                'printer_id' => 0,
                'checker_id' => 0,
                'block_disc' => 1,
                'kategori_id' => $rokokId,
                'kategorisub_id' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid(),
                'sku' => '1004',
                'barcode' => '8993560025014',
                'deskripsi' => 'Ultra Milk Coklat 250ml',
                'alias' => 'Ultra Coklat',
                'st_aktif' => 1,
                'satuan' => 'Kotak',
                'isi' => 1,
                'volume' => '250ml',
                'min_stock' => 30,
                'harga_beli' => 6000,
                'harga_jual1' => 8500,
                'harga_jual2' => 9000,
                'multiplier' => false,
                'printer_id' => 0,
                'checker_id' => 0,
                'block_disc' => 0,
                'kategori_id' => $minumanId,
                'kategorisub_id' => $minumanDinginId,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('barang')->insert($barangData);

        // Create Barang Prices (harga bertingkat) untuk beberapa barang
        $barangAqua = DB::table('barang')->where('sku', '1001')->value('id');
        $barangIndomie = DB::table('barang')->where('sku', '2001')->value('id');

        $pricesData = [
            // Aqua - beli 10 lebih murah
            [
                'id' => Str::uuid(),
                'barang_id' => $barangAqua,
                'qty' => 10,
                'harga1' => 3800,
                'harga2' => 4300,
                'multiplier' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Aqua - beli 20 lebih murah lagi
            [
                'id' => Str::uuid(),
                'barang_id' => $barangAqua,
                'qty' => 20,
                'harga1' => 3500,
                'harga2' => 4000,
                'multiplier' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Indomie - beli 5 lebih murah
            [
                'id' => Str::uuid(),
                'barang_id' => $barangIndomie,
                'qty' => 5,
                'harga1' => 3200,
                'harga2' => 3700,
                'multiplier' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('barang_prices')->insert($pricesData);

        $this->command->info('10 Barang dummy dengan relasi berhasil dibuat!');
        $this->command->info('- 4 Kategori');
        $this->command->info('- 3 Kategorisub');
        $this->command->info('- 10 Barang');
        $this->command->info('- 3 Barang Prices (harga bertingkat)');
    }
}

