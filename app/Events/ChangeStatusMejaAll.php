<?php

namespace App\Events;

use App\Http\Controllers\Helpers;
use App\Models\LogLogin;
use App\Models\Meja;
use App\Models\Transaksi;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ChangeStatusMejaAll implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function broadcastOn()
    {
        return new Channel('status-meja-all');
    }

    public function broadcastAs()
    {
        return 'statusMejaAll';
    }
    public function broadcastWith()
    {
        $data = $this->broadcastStatusMejaAll();
        return ['msg' => $data];
    }

    private function broadcastStatusMejaAll()
    {
        try {
            $data = [
                'tables' => [],
                'shift' => LogLogin::currentShift(),
            ];

            $colors = Helpers::colors();
            $trx = Transaksi::getActives();
            $meja = Meja::select(['is_used', 'no'])->where('st_aktif', 1)->orderBy('no')->get();

            foreach ($meja as $v) {
                $trxId = 0;
                $status = 0;
                $color = $colors[Meja::$EMPTY];

                foreach ($trx as $vv) {
                    if ($vv->meja === $v->no) {
                        $trxId = $vv->id;
                        $status = $vv->status;
                    }
                }

                if ($v->is_used) {
                    $color = $colors[Meja::$USED];
                } else {
                    $color = $colors[$status];
                }

                $data['tables'][] = [
                    'nomor' => $v->no,
                    'trxId' => $trxId,
                    'status' => $status,
                    'color' => $color,
                ];
            }

            return $data;
        } catch (\Throwable $th) {
            throw new \Exception("Error Broadcast Status Meja All", 1);
        }
    }
}
