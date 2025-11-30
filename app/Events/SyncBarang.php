<?php

namespace App\Events;

use App\Models\Barang;
use App\Models\BarangExt;
use App\Models\Job;
use App\Models\Kategori;
use App\Models\Kategorisub;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Auth;

class SyncBarang implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct()
    {
        //
    }

    public function broadcastAs()
    {
        return 'syncBarang';
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('sync-barang'),
        ];
    }

    public function broadcastWith()
    {
        $job = Job::find(1);
        $job->is_running = 1;
        $job->by = Auth::user()->name;
        $job->save();

        $kat = Kategori::import();
        $subkat = Kategorisub::import();
        $brg = Barang::import();
        $ext = BarangExt::import();
        $isOk = $brg and $ext and $kat and $subkat;

        $job->is_running = 0;
        $job->save();

        if (!$isOk) {
            return [
                "status" => "Error sync data barang",
                "isOk" => $isOk,
            ];
        }

        return [
            "status" => "sync data barang success",
            "isOk" => $isOk,
        ];
    }
}

