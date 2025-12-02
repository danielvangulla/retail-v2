<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class StockUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public string $barangId;
    public int $quantity;
    public string $type; // 'in', 'out'

    public function __construct(string $barangId, int $quantity, string $type = 'in')
    {
        $this->barangId = $barangId;
        $this->quantity = $quantity;
        $this->type = $type;
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('stock'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'StockUpdated';
    }

    public function broadcastWith(): array
    {
        return [
            'barang_id' => $this->barangId,
            'quantity' => $this->quantity,
            'type' => $this->type,
            'timestamp' => now()->toIso8601String(),
        ];
    }
}
