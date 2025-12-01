<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

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
        if (!Auth::check()) {
            return redirect('/login');
        }

        // Ensure user is supervisor (level == 1)
        if (Auth::user()->level != 1) {
            return Inertia::render('errors/Unauthorized', [
                'message' => 'Hanya supervisor yang dapat mengakses halaman ini.',
            ])->toResponse($request)->setStatusCode(403);
        }

        return $next($request);
    }
}
