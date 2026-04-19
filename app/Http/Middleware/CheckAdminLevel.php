<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CheckAdminLevel
{
    public function handle(Request $request, Closure $next)
    {
        if (!Auth::check()) {
            return redirect('/login');
        }

        // Level 1 = Administrator (full access)
        if (Auth::user()->level !== 1) {
            // SPV (level 2) gets redirected to void page
            if (Auth::user()->level === 2) {
                return redirect()->route('admin.void.index');
            }

            return Inertia::render('errors/Unauthorized', [
                'message' => 'Halaman ini hanya untuk Administrator',
                'userLevel' => Auth::user()->level,
            ])->toResponse($request)->setStatusCode(403);
        }

        return $next($request);
    }
}
