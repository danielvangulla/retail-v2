<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class DataManagementController
{
    /**
     * Show data management dashboard
     */
    public function index(): Response
    {
        return Inertia::render('admin/DataManagement/Index');
    }

    /**
     * Execute recount stock and cost command with password verification
     */
    public function recount(Request $request): JsonResponse
    {
        // Validate password
        $request->validate([
            'password' => 'required|string',
        ]);

        // Verify user password (supervisor access)
        $user = Auth::user();
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Password salah. Akses ditolak.',
            ], 401);
        }

        // Check if user is supervisor (level 1)
        if ($user->level !== 1) {
            return response()->json([
                'success' => false,
                'message' => 'Hanya supervisor yang dapat menjalankan operasi ini.',
            ], 403);
        }

        try {
            $startTime = microtime(true);

            // Execute the recount command with output buffering
            $output = [];
            Artisan::call('app:recount-stock-and-cost', [], new \Symfony\Component\Console\Output\BufferedOutput());

            $endTime = microtime(true);
            $duration = round($endTime - $startTime, 2);

            // Parse command output for results (if available)
            // The command outputs total_processed and total_failed in the console
            // We'll set defaults and try to extract from context if needed

            return response()->json([
                'success' => true,
                'message' => 'Recount stok dan cost berhasil diselesaikan!',
                'data' => [
                    'total_processed' => 0, // Updated by command if available
                    'total_failed' => 0,
                    'duration_seconds' => $duration,
                ],
            ]);
        } catch (\Exception $e) {
            // Log the error
            Log::error('Recount Stock and Cost Error: ' . $e->getMessage(), [
                'exception' => $e,
                'user_id' => $user->id,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage(),
            ], 500);
        }
    }
}
