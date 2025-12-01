<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class LoginChoiceController extends Controller
{
    public function show(): Response
    {
        // Middleware akan ensure user adalah supervisor
        return Inertia::render('auth/LoginChoice', [
            'userName' => Auth::user()->name,
        ]);
    }

    public function redirect(Request $request): JsonResponse
    {
        // Middleware akan ensure user adalah supervisor
        $request->validate([
            'destination' => 'required|in:kasir,admin',
        ]);

        $destination = $request->destination === 'kasir' ? '/kasir' : '/back';
        
        return response()->json([
            'status' => 'ok',
            'redirect' => $destination,
        ]);
    }
}
