<?php

namespace App\Http\Controllers;

use App\Models\Setup;
use App\Models\TransaksiDetail;
use illuminate\Support\Str;

class Helpers extends Controller
{
    public static function levelToStr($level)
    {
        $arr = [
            1 => 'Supervisor',
            2 => 'Kasir',
            3 => 'Admin',
        ];
        return $arr[$level];
    }

    public static function customErrorMsg()
    {
        return [
            'required' => ':attribute harus diisi.',
            'numeric' => ':attribute hanya boleh diisi dengan angka.',
            'alpha' => ':attribute hanya boleh diisi dengan huruf.',
            'alpha_num' => ':attribute hanya boleh diisi dengan angka dan huruf.',
            'regex' => ':attribute hanya boleh diisi dengan angka, huruf dan spasi.',
            'min' => ':attribute harus minimal :min.',
            'max' => ':attribute harus maksimal :max.',
            'ket.min' => 'Keterangan minimal :min. karakter',
            'ket.max' => 'Keterangan maksimal :max. karakter',
        ];
    }

    public static function generateNoCO()
    {
        $date = Date("dHis");
        $str = Str::random(5);
        return $date . $str;
    }

    public static function getSetup($config_name)
    {
        $setups = Setup::where('config_name', $config_name)->first();

        if (!$setups) {
            return null;
        }

        $json = json_decode($setups->config_json);

        return $json;
    }

    public static function omsetCode()
    {
        $tgl = Helpers::transactionDate();

        $co = TransaksiDetail::selectRaw('sum(bayar) as bayar')->where('tgl', $tgl)->where('qty', '>', 0)->first();
        $omset = $co->bayar;

        $configCode = self::getSetup('kode_omset');
        $code = $configCode->code;
        $multiplier = $configCode->multiplier;

        $arrCode = str_split($code);
        $kodeOmset = "-";

        foreach ($arrCode as $k => $v) {
            $limitOmset = ($k + 1) * $multiplier;

            if ($omset >= $limitOmset) {
                $kodeOmset = $v;
            }
        }

        return $kodeOmset;
    }

    public static function colors()
    {
        $arr = [
            0 => "bg-green-600",
            1 => "bg-yellow-500",
            3 => "bg-red-500",
            4 => "bg-gray-600",
            9 => "bg-blue-500",
        ];

        return $arr;
    }

    public static function transactionDate()
    {
        $oprStart = trim(env("OPERATIONAL_START", "00:00:01"));
        $tgl = date("Y-m-d");

        $currentTime = strtotime(date("H:i:s")); // Get the current time as a timestamp
        $oprStartTime = strtotime($oprStart); // Convert the oprStart time to a timestamp

        if ($currentTime < $oprStartTime) {
            $tgl = date("Y-m-d", strtotime("-1 day", strtotime($tgl))); // Decrease $tgl by 1 day
        }

        // Perform any other actions you want based on the comparison

        return $tgl; // Return the modified $tgl value
    }

    public static function macId()
    {
        // Skip check if in development mode
        // if (config('app.env') === 'local' || config('app.debug') === true) {
        //     return [
        //         'os' => strtoupper(PHP_OS),
        //         'status' => 'registered (development mode)',
        //     ];
        // }

        $os = strtoupper(PHP_OS);
        $machineId = '';

        if ($os === 'WINNT') {
            $os = 'Windows';
            $command = 'powershell.exe (Get-WmiObject Win32_ComputerSystemProduct).UUID';
            $machineId = trim(shell_exec($command));

            if ($machineId !== config("auth.mac_id")) {
                return self::unregisteredInfo($os);
            }
        }

        if ($os === 'LINUX') {
            $machineId = trim(file_get_contents('/var/lib/dbus/machine-id'));

            if ($machineId !== config("auth.mac_id")) {
                return self::unregisteredInfo($os);
            }
        }

        if ($os === 'DARWIN') {
            $os = 'macOS';
            $command = 'ioreg -rd1 -c IOPlatformExpertDevice | grep IOPlatformUUID | awk \'{print $3}\' | tr -d \'"\'';
            $machineId = trim(shell_exec($command));

            if ($machineId !== config("auth.mac_id")) {
                return self::unregisteredInfo($os);
            }
        }

        return [
            'os' => $os,
            'status' => 'registered.',
        ];
    }

    private static function unregisteredInfo($os)
    {
        return [
            'os' => $os,
            'status' => 'Unregistered.',
            'message' => 'Contact developer to Register the App to this Machine.'
        ];
    }
}
