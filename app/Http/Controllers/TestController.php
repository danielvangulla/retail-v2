<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Services\BasePrinter;
use App\Models\Barang;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class TestController extends Controller
{
    public function testPrint()
    {
        $basePrinter = new BasePrinter;
        $basePrinter->test('usb');
    }

    public function testCache()
    {
        // $barang = Barang::first();

        // will cache temporary
        // Cache::put('barang1', $barang, now()->addDay());
        // Cache::add('barang2', $barang);

        // will cache forever
        // Cache::forever('barang-forever', $barang);

        // will remove a cache
        // Cache::forget('barang-forever');

        // will remove all existing cache
        // Cache::flush();

        // will do an increment / decrement
        // if (!Cache::has('no')) {
        //     Cache::forever('no', 1);
        // }
        // Cache::increment('no', 1);
        // Cache::decrement('no', 1);


        // $cache = null;
        // if (Cache::has('barang')) {
        //     $cache = Cache::get('barang');
        // }


        // return response()->json([
        //     'cache' => $cache,
        // ], 200);
    }
}
