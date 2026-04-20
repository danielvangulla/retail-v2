<?php

namespace Database\Seeders;

use App\Models\Barang;
use App\Models\BarangStock;
use App\Models\Kategori;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BarangImportSeeder extends Seeder
{
    public function run(): void
    {
        $path = base_path('Files/parsed_barang.json');

        if (! file_exists($path)) {
            $this->command->error("File tidak ditemukan: {$path}");

            return;
        }

        $data = json_decode(file_get_contents($path), true);
        $barangs = $data['barang'] ?? [];

        if (empty($barangs)) {
            $this->command->error('Tidak ada data barang di file JSON.');

            return;
        }

        $this->command->info('Memulai import '.count($barangs).' barang...');

        // 1. Kumpulkan nama kategori unik dari data barang
        $kelompokList = collect($barangs)
            ->pluck('kelompok')
            ->map(fn ($k) => strtoupper(trim($k ?? '')))
            ->filter()
            ->unique()
            ->values();

        // 2. Buat atau temukan kategori
        $kategoriMap = [];
        foreach ($kelompokList as $ket) {
            $existing = Kategori::where('ket', $ket)->first();
            if ($existing) {
                $kategoriMap[$ket] = $existing->id;
            } else {
                $kategori = Kategori::create(['ket' => $ket, 'sku_from' => 0, 'sku_to' => 0]);
                $kategoriMap[$ket] = $kategori->id;
            }
        }

        // 3. Kategori default untuk kelompok kosong
        $ketDefault = 'LAIN-LAIN';
        if (! isset($kategoriMap[$ketDefault])) {
            $def = Kategori::where('ket', $ketDefault)->first()
                ?? Kategori::create(['ket' => $ketDefault, 'sku_from' => 0, 'sku_to' => 0]);
            $kategoriMap[$ketDefault] = $def->id;
        }
        $defaultKategoriId = $kategoriMap[$ketDefault];

        // 4. Import barang satu per satu
        $imported = 0;
        $updated = 0;
        $skipped = 0;
        $bar = $this->command->getOutput()->createProgressBar(count($barangs));
        $bar->start();

        foreach ($barangs as $item) {
            $sku = trim($item['sku'] ?? '');
            if (empty($sku)) {
                $skipped++;
                $bar->advance();
                continue;
            }

            $kelompokRaw = strtoupper(trim($item['kelompok'] ?? ''));
            $kategoriId = $kategoriMap[$kelompokRaw] ?? $defaultKategoriId;

            $barangData = [
                'barcode'              => trim($item['barcode'] ?? '') ?: null,
                'deskripsi'            => trim($item['deskripsi'] ?? $sku),
                'alias'                => trim($item['alias'] ?? $item['deskripsi'] ?? $sku),
                'satuan'               => trim($item['satuan'] ?? 'PCS'),
                'isi'                  => (int) ($item['isi'] ?? 1),
                'volume'               => '',
                'min_stock'            => (int) ($item['min_stock'] ?? 0),
                'harga_beli'           => (float) ($item['harga_beli'] ?? 0),
                'harga_jual1'          => (float) ($item['harga_jual1'] ?? 0),
                'harga_jual2'          => (float) ($item['harga_jual2'] ?? 0),
                'kategori_id'          => $kategoriId,
                'st_aktif'             => 1,
                'allow_sold_zero_stock' => 1,
                'printer_id'           => 0,
                'checker_id'           => 0,
                'block_disc'           => 0,
            ];

            $existing = Barang::where('sku', $sku)->first();

            if ($existing) {
                $existing->update($barangData);
                $barangId = $existing->id;
                $updated++;
            } else {
                $barang = Barang::create(array_merge(['sku' => $sku], $barangData));
                $barangId = $barang->id;
                $imported++;
            }

            // Buat barang_stock jika belum ada
            $stockExists = BarangStock::where('barang_id', $barangId)->exists();
            if (! $stockExists) {
                BarangStock::create([
                    'barang_id' => $barangId,
                    'quantity'  => 0,
                    'reserved'  => 0,
                    'available' => 0,
                ]);
            }

            // Buat barang_ext jika belum ada
            $extExists = DB::table('barang_ext')->where('sku', $sku)->exists();
            if (! $extExists) {
                DB::table('barang_ext')->insert([
                    'id'         => Str::uuid()->toString(),
                    'sku'        => $sku,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            $bar->advance();
        }

        $bar->finish();
        $this->command->newLine();
        $this->command->info("Import selesai: {$imported} baru, {$updated} diperbarui, {$skipped} dilewati.");
        $this->command->info('Total kategori: '.count($kategoriMap));
    }
}
