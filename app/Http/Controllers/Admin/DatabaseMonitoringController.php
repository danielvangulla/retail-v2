<?php

namespace App\Http\Controllers\Admin;

use App\Events\DatabaseConnectionUpdated;
use App\Services\DatabaseConnectionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class DatabaseMonitoringController
{
    /**
     * Show database monitoring dashboard
     */
    public function index(): Response
    {
        return Inertia::render('admin/DatabaseMonitoring/Index', [
            'config' => DatabaseConnectionService::getConfig(),
        ]);
    }

    /**
     * Get current connection stats (for polling)
     */
    public function getStats(): JsonResponse
    {
        try {
            $stats = DatabaseConnectionService::getConnectionStats();

            // Broadcast to WebSocket
            broadcast(new DatabaseConnectionUpdated($stats))->toOthers();

            return response()->json([
                'status' => 'ok',
                'data' => $stats,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Toggle connection pooling
     */
    public function togglePooling(Request $request): JsonResponse
    {
        $enabled = $request->boolean('enabled');

        DatabaseConnectionService::togglePooling($enabled);

        // Broadcast event
        broadcast(new DatabaseConnectionUpdated([
            'pooling_enabled' => $enabled,
            'timestamp' => now(),
        ]))->toOthers();

        return response()->json([
            'status' => 'ok',
            'enabled' => $enabled,
            'message' => 'Connection pooling ' . ($enabled ? 'enabled' : 'disabled'),
        ]);
    }

    /**
     * Get configuration
     */
    public function getConfig(): JsonResponse
    {
        return response()->json([
            'status' => 'ok',
            'data' => DatabaseConnectionService::getConfig(),
        ]);
    }

    /**
     * Update configuration (with password verification)
     */
    public function updateConfig(Request $request): JsonResponse
    {
        $request->validate([
            'max_retries' => 'required|integer|min:1|max:20',
            'retry_delay_ms' => 'required|integer|min:500|max:10000',
            'enabled' => 'required|boolean',
            'password' => 'required|string',
        ]);

        // Verify password
        $user = Auth::user();
        if (!Hash::check($request->password, $user->password)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Password salah',
            ], 401);
        }

        // Update pooling status
        if ($request->boolean('enabled') !== DatabaseConnectionService::isPoolingEnabled()) {
            DatabaseConnectionService::togglePooling($request->boolean('enabled'));
        }

        // Update config
        $newConfig = DatabaseConnectionService::updateConfig([
            'max_retries' => $request->max_retries,
            'retry_delay_ms' => $request->retry_delay_ms,
        ]);

        // Broadcast event
        broadcast(new DatabaseConnectionUpdated([
            'config' => $newConfig,
            'timestamp' => now(),
        ]))->toOthers();

        return response()->json([
            'status' => 'ok',
            'message' => 'Configuration updated successfully',
            'data' => $newConfig,
        ]);
    }
}
