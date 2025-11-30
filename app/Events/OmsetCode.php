<?php

namespace App\Events;

use App\Http\Controllers\Helpers;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OmsetCode implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct()
    {
        //
    }

    public function broadcastAs()
    {
        return 'omsetCode';
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('omset-code'),
        ];
    }

    public function broadcastWith()
    {
        return $this->cekOmset();
    }

    private function cekOmset()
    {
        $kodeOmset = Helpers::omsetCode();

        return [
            'status' => 'Update Kode Omset.',
            'omsetCode' => $kodeOmset,
        ];
    }
}

