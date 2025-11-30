<?php

namespace App\Http\Controllers\Back;

use App\Models\User;
use App\Http\Controllers\Controller;
use App\Http\Controllers\Helpers;
use Illuminate\Http\Request;

class UserPermissionController extends Controller
{
    public function index()
    {
        return View('back.users.index');
    }

    public function usersJson()
    {
        $data = User::select('id', 'name', 'level', 'created_at', 'updated_at')
            ->with('permissions')
            ->orderBy('level')
            ->get();

        $data->map(function ($v) {
            $v->levelStr = Helpers::levelToStr($v->level);
            $v->created = Date('Y-m-d', strtotime($v->created_at));
            $v->updated = Date('Y-m-d', strtotime($v->updated_at));
            return $v;
        });

        return response()->json([
            'status' => 'ok',
            'msg' => '-',
            'data' => $data,
        ], 200);
    }
}
