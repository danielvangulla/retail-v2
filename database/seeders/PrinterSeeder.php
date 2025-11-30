<?php

namespace Database\Seeders;

use App\Models\Printer;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PrinterSeeder extends Seeder
{
    public function run(): void
    {
        $printers = [
            ['nama' => 'Bar', 'ip_address' => '192.168.20.169'],
            ['nama' => 'Dapur1', 'ip_address' => '192.168.20.169'],
            ['nama' => 'Dapur2', 'ip_address' => '192.168.20.169'],
            ['nama' => 'Dapur3', 'ip_address' => '192.168.20.169'],
            ['nama' => 'Kasir', 'ip_address' => '192.168.20.169'],
            ['nama' => 'Checklist', 'ip_address' => '192.168.20.169'],
        ];

        foreach ($printers as $k => $v) {
            Printer::create($v);
        }
    }
}
