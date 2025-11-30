<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ShowNotification implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    private $message;
    private $type;

    public function __construct($message, $type)
    {
        $this->message = $message;
        $this->type = $type;
    }

    public function broadcastAs()
    {
        return 'showNotification';
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('show-notification'),
        ];
    }

    public function broadcastWith()
    {
        return [
            'message' => $this->message,
            'type' => $this->color(),
        ];
    }

    private function color()
    {
        $colors = [
            'success' => 'bg-green-600',
            'primary' => 'bg-blue-600',
            'danger' => 'bg-red-600',
        ];

        return $colors[$this->type];
    }
}

