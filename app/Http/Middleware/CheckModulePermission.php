<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class CheckModulePermission
{
    /**
     * Handle an incoming request.
     *
     * Usage in routes:
     * Route::post('/barang', [BarangController::class, 'store'])
     *     ->middleware('check.module:barang,create');
     *
     * Or with multiple actions:
     * ->middleware('check.module:barang,edit|delete');
     */
    public function handle(Request $request, Closure $next, string $moduleCode, string $actions = 'view'): Response
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized: Please login'
            ], 401);
        }

        // Parse multiple actions (e.g., "edit|delete")
        $actionList = explode('|', $actions);

        // Check if user has permission for ANY of the actions
        // (for flexibility in route definitions)
        foreach ($actionList as $action) {
            if ($user->canAccessModule($moduleCode, trim($action))) {
                return $next($request);
            }
        }

        // Log unauthorized attempt
        Log::warning("Unauthorized module access attempt", [
            'user_id' => $user->id,
            'module' => $moduleCode,
            'actions' => $actions,
            'ip' => $request->ip(),
        ]);

        return response()->json([
            'status' => 'error',
            'message' => "Anda tidak memiliki akses ke modul '{$moduleCode}' untuk action '{$actions}'"
        ], 403);
    }
}
