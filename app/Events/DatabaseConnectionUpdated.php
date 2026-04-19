<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DatabaseConnectionUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public array $connectionStats;

    public function __construct(array $connectionStats)
    {
        $this->connectionStats = $connectionStats;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('database-monitoring'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'connection.updated';
    }
}
