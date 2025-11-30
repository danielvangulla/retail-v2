<?php

namespace Database\Seeders;

use App\Models\Meja;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class MejaSeeder extends Seeder
{
    public function run(): void
    {
        $meja = [
            ["no" => "A01", "floor" => 1, "st_aktif" => 1, "top" => 106, "left" => 686, "height" => 40, "width" => 40, "is_used" => 0, "used_by" => "-"],
            ["no" => "A02", "floor" => 1, "st_aktif" => 1, "top" => 106, "left" => 756, "height" => 40, "width" => 40, "is_used" => 0, "used_by" => "-"],
            ["no" => "A03", "floor" => 1, "st_aktif" => 1, "top" => 106, "left" => 824, "height" => 40, "width" => 40, "is_used" => 0, "used_by" => "-"],
            ["no" => "A04", "floor" => 1, "st_aktif" => 1, "top" => 106, "left" => 892, "height" => 40, "width" => 40, "is_used" => 0, "used_by" => "-"],
            ["no" => "B01", "floor" => 1, "st_aktif" => 1, "top" => 35, "left" => 325, "height" => 40, "width" => 40, "is_used" => 0, "used_by" => "-"],
            ["no" => "B02", "floor" => 1, "st_aktif" => 1, "top" => 35, "left" => 507, "height" => 40, "width" => 40, "is_used" => 0, "used_by" => "-"],
            ["no" => "BR1", "floor" => 1, "st_aktif" => 1, "top" => 500, "left" => 395, "height" => 40, "width" => 40, "is_used" => 0, "used_by" => "-"],
            ["no" => "BR2", "floor" => 1, "st_aktif" => 1, "top" => 500, "left" => 460, "height" => 40, "width" => 40, "is_used" => 0, "used_by" => "-"],
            ["no" => "BR3", "floor" => 1, "st_aktif" => 1, "top" => 500, "left" => 525, "height" => 40, "width" => 40, "is_used" => 0, "used_by" => "-"],
            ["no" => "BR4", "floor" => 1, "st_aktif" => 1, "top" => 500, "left" => 590, "height" => 40, "width" => 40, "is_used" => 0, "used_by" => "-"],
            ["no" => "BR5", "floor" => 1, "st_aktif" => 1, "top" => 200, "left" => 671, "height" => 40, "width" => 40, "is_used" => 0, "used_by" => "-"],
            ["no" => "EX1", "floor" => 1, "st_aktif" => 1, "top" => 570, "left" => 395, "height" => 40, "width" => 40, "is_used" => 0, "used_by" => "-"],
            ["no" => "EX2", "floor" => 1, "st_aktif" => 1, "top" => 570, "left" => 460, "height" => 40, "width" => 40, "is_used" => 0, "used_by" => "-"],
            ["no" => "EX3", "floor" => 1, "st_aktif" => 1, "top" => 570, "left" => 525, "height" => 40, "width" => 40, "is_used" => 0, "used_by" => "-"],
            ["no" => "EX4", "floor" => 1, "st_aktif" => 1, "top" => 570, "left" => 590, "height" => 40, "width" => 40, "is_used" => 0, "used_by" => "-"],
            ["no" => "K01", "floor" => 1, "st_aktif" => 1, "top" => 200, "left" => 870, "height" => 40, "width" => 40, "is_used" => 0, "used_by" => "-"],
            ["no" => "K02", "floor" => 1, "st_aktif" => 1, "top" => 260, "left" => 870, "height" => 40, "width" => 40, "is_used" => 0, "used_by" => "-"],
            ["no" => "K03", "floor" => 1, "st_aktif" => 1, "top" => 320, "left" => 870, "height" => 40, "width" => 40, "is_used" => 0, "used_by" => "-"],
            ["no" => "K04", "floor" => 1, "st_aktif" => 1, "top" => 200, "left" => 940, "height" => 40, "width" => 40, "is_used" => 0, "used_by" => "-"],
            ["no" => "K05", "floor" => 1, "st_aktif" => 1, "top" => 260, "left" => 940, "height" => 40, "width" => 40, "is_used" => 0, "used_by" => "-"],
            ["no" => "K06", "floor" => 1, "st_aktif" => 1, "top" => 320, "left" => 940, "height" => 40, "width" => 40, "is_used" => 0, "used_by" => "-"],
            ["no" => "L01", "floor" => 1, "st_aktif" => 1, "top" => 452, "left" => 154, "height" => 40, "width" => 40, "is_used" => 0, "used_by" => "-"],
            ["no" => "L02", "floor" => 1, "st_aktif" => 1, "top" => 209, "left" => 153, "height" => 40, "width" => 40, "is_used" => 0, "used_by" => "-"],
            ["no" => "S01", "floor" => 1, "st_aktif" => 1, "top" => 199, "left" => 753, "height" => 40, "width" => 40, "is_used" => 0, "used_by" => "-"],
            ["no" => "S02", "floor" => 1, "st_aktif" => 1, "top" => 290, "left" => 753, "height" => 40, "width" => 40, "is_used" => 0, "used_by" => "-"],
            ["no" => "S03", "floor" => 1, "st_aktif" => 1, "top" => 376, "left" => 753, "height" => 40, "width" => 40, "is_used" => 0, "used_by" => "-"],
            ["no" => "T01", "floor" => 1, "st_aktif" => 1, "top" => 500, "left" => 325, "height" => 40, "width" => 40, "is_used" => 0, "used_by" => "-"],
            ["no" => "T02", "floor" => 1, "st_aktif" => 1, "top" => 411, "left" => 320, "height" => 40, "width" => 40, "is_used" => 0, "used_by" => "-"],
            ["no" => "T03", "floor" => 1, "st_aktif" => 1, "top" => 320, "left" => 325, "height" => 40, "width" => 40, "is_used" => 0, "used_by" => "-"],
            ["no" => "T04", "floor" => 1, "st_aktif" => 1, "top" => 230, "left" => 325, "height" => 40, "width" => 40, "is_used" => 0, "used_by" => "-"],
            ["no" => "T05", "floor" => 1, "st_aktif" => 1, "top" => 125, "left" => 325, "height" => 40, "width" => 40, "is_used" => 0, "used_by" => "-"],
            ["no" => "T06", "floor" => 1, "st_aktif" => 1, "top" => 320, "left" => 395, "height" => 40, "width" => 40, "is_used" => 0, "used_by" => "-"],
            ["no" => "T07", "floor" => 1, "st_aktif" => 1, "top" => 234, "left" => 395, "height" => 40, "width" => 40, "is_used" => 0, "used_by" => "-"],
            ["no" => "T08", "floor" => 1, "st_aktif" => 1, "top" => 125, "left" => 507, "height" => 40, "width" => 40, "is_used" => 0, "used_by" => "-"],
            ["no" => "T09", "floor" => 1, "st_aktif" => 1, "top" => 320, "left" => 466, "height" => 40, "width" => 40, "is_used" => 0, "used_by" => "-"],
            ["no" => "T10", "floor" => 1, "st_aktif" => 1, "top" => 230, "left" => 466, "height" => 40, "width" => 40, "is_used" => 0, "used_by" => "-"],
            ["no" => "T11", "floor" => 1, "st_aktif" => 1, "top" => 320, "left" => 577, "height" => 40, "width" => 40, "is_used" => 0, "used_by" => "-"],
            ["no" => "T12", "floor" => 1, "st_aktif" => 1, "top" => 230, "left" => 537, "height" => 40, "width" => 40, "is_used" => 0, "used_by" => "-"],
            ["no" => "T13", "floor" => 1, "st_aktif" => 1, "top" => 400, "left" => 671, "height" => 40, "width" => 40, "is_used" => 0, "used_by" => "-"],
            ["no" => "T14", "floor" => 1, "st_aktif" => 1, "top" => 340, "left" => 671, "height" => 40, "width" => 40, "is_used" => 0, "used_by" => "-"],
            ["no" => "T15", "floor" => 1, "st_aktif" => 1, "top" => 271, "left" => 671, "height" => 40, "width" => 40, "is_used" => 0, "used_by" => "-"],
            ["no" => "X01", "floor" => 1, "st_aktif" => 1, "top" => 50, "left" => 686, "height" => 40, "width" => 40, "is_used" => 0, "used_by" => "-"],
            ["no" => "X02", "floor" => 1, "st_aktif" => 1, "top" => 50, "left" => 756, "height" => 40, "width" => 40, "is_used" => 0, "used_by" => "-"],
            ["no" => "X03", "floor" => 1, "st_aktif" => 1, "top" => 50, "left" => 824, "height" => 40, "width" => 40, "is_used" => 0, "used_by" => "-"],
            ["no" => "X04", "floor" => 1, "st_aktif" => 1, "top" => 50, "left" => 892, "height" => 40, "width" => 40, "is_used" => 0, "used_by" => "-"]
        ];

        foreach ($meja as $k => $v) {
            Meja::create($v);
        }
    }
}
