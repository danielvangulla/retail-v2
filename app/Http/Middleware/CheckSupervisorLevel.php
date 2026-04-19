<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class CheckSupervisorLevel
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Ensure user is authenticated
        if (! Auth::check()) {
            return redirect('/login');
        }

        // Ensure user is admin (level 1) or supervisor/SPV (level 2)
        // Level 3 = Kasir, tidak boleh akses admin panel
        if (Auth::user()->level > 2) {
            return Inertia::render('errors/Unauthorized', [
                'message' => 'Hanya admin dan supervisor yang dapat mengakses halaman ini.',
            ])->toResponse($request)->setStatusCode(403);
        }

        return $next($request);
    }
}
