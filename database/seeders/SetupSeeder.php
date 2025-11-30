<?php

namespace Database\Seeders;

use App\Models\Setup;
use Illuminate\Database\Seeder;

class SetupSeeder extends Seeder
{
    public function run(): void
    {
        $job = [
            [
                'config_name' => 'kode_omset',
                'config_json' => '{
                    "code": "LIVERPOOL",
                    "multiplier": "10000000"
                }'
            ],
            [
                'config_name' => 'perusahaan',
                'config_json' => '{
                    "nama": "Retails POS",
                    "alamat1": "Jl. Balai Kota No.1",
                    "alamat2": "Manado, Telp. 0431-123456",
                    "operasional": "00:00:00",
                    "tax": "0",
                    "service": "0"
                }'
            ],
        ];

        foreach ($job as $v) {
            Setup::create($v);
        }
    }
}
