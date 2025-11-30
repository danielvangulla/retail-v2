<?php

namespace Database\Seeders;

use App\Models\TransaksiPaymentType;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TransaksiTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            ['urutan' => 1, 'ket' => 'Cash'],
            ['urutan' => 2, 'ket' => 'QRIS'],
            ['urutan' => 3, 'ket' => 'BCA Card'],
            ['urutan' => 4, 'ket' => 'BNI Card'],
            ['urutan' => 5, 'ket' => 'Mandiri Card'],
            ['urutan' => 6, 'ket' => 'BRI Card'],
        ];

        foreach ($types as $k => $v) {
            TransaksiPaymentType::create($v);
        }
    }
}
