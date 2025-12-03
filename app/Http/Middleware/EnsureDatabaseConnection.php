<?php

namespace App\Http\Middleware;

use App\Services\DatabaseConnectionService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureDatabaseConnection
{
    /**
     * Handle an incoming request.
     *
     * @param \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response) $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        try {
            // Ensure database connection is available (with retry logic)
            DatabaseConnectionService::connectWithRetry();
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Database tidak responsif, silakan coba lagi dalam beberapa detik',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 503); // Service Unavailable
        }

        return $next($request);
    }
}
