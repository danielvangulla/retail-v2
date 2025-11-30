<?php

namespace App\Http\Controllers\Back;

use App\Http\Controllers\Controller;
use App\Models\Queue;
use Illuminate\Http\Request;

class SyncController extends Controller
{
    protected $serverIp;
    protected $requestIp;

    public function __construct(Request $r)
    {
        $this->serverIp = env("SERVER_VPN_IP");
        $this->requestIp = $this->ip($r);
    }

    public function getter()
    {
        if ($this->serverIp !== $this->requestIp) {
            return response()->json([
                'status' => 'error',
                'msg' => 'Unauthorized Request. Access Denied !',
            ], 403);
        }

        return response()->json([
            'status' => 'ok',
            'msg' => 'success',
            'data' => Queue::getData(),
        ], 200);
    }

    public function setter(Request $r)
    {
        if ($this->serverIp !== $this->requestIp) {
            return response()->json([
                'status' => 'error',
                'msg' => 'access denied',
            ], 403);
        }

        return response()->json([
            'status' => 'ok',
            'msg' => 'success',
            'data' => Queue::setData($r->id),
        ], 200);
    }

    private function ip(Request $r)
    {
        $ip = $r->getClientIp();

        if (!$r->isFromTrustedProxy()) {
            return $ip;
        }

        $ips = $r->getClientIps();

        return is_array($ips) ? implode(',', $ips) : $ip;
    }
}
