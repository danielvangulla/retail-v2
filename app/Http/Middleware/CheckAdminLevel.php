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

        // Level 1 = Supervisor (can access admin)
        if (Auth::user()->level != 1) {
            // Return Inertia error page instead of plain response
            return Inertia::render('errors/Unauthorized', [
                'message' => 'Halaman ini hanya untuk level Supervisor/Admin',
                'userLevel' => Auth::user()->level,
            ])->toResponse($request)->setStatusCode(403);
        }

        return $next($request);
    }
}
