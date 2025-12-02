<?php

namespace App\Http\Controllers\Back;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserModulePermission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ModulePermissionController extends Controller
{
    /**
     * Available modules with descriptions
     */
    private function getAvailableModules(): array
    {
        return [
            ['code' => 'barang', 'name' => 'Inventory Management', 'description' => 'Manage products and stock'],
            ['code' => 'pembelian', 'name' => 'Purchasing', 'description' => 'Purchase orders and incoming stock'],
            ['code' => 'piutang', 'name' => 'Receivables', 'description' => 'Credit system and member accounts'],
            ['code' => 'kasir', 'name' => 'Point of Sale', 'description' => 'Cashier and transactions'],
            ['code' => 'reports', 'name' => 'Reports', 'description' => 'Sales, revenue, and analytics'],
            ['code' => 'settings', 'name' => 'Settings', 'description' => 'System configuration and users'],
        ];
    }

    /**
     * Show module permissions list
     */
    public function index()
    {
        $users = User::with('modulePermissions')
            ->where('id', '!=', Auth::id()) // Don't allow self-modification
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/ModulePermission/Index', [
            'users' => $users,
            'availableModules' => $this->getAvailableModules(),
        ]);
    }

    /**
     * Get permissions for a specific user
     */
    public function getUserPermissions(User $user)
    {
        if ($user->id === Auth::id()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Cannot modify your own permissions'
            ], 403);
        }

        $userPermissions = $user->modulePermissions()
            ->get()
            ->keyBy('module_code')
            ->toArray();

        $modules = $this->getAvailableModules();
        $modulesWithPermissions = array_map(function ($module) use ($userPermissions) {
            return array_merge(
                $module,
                isset($userPermissions[$module['code']]) ? $userPermissions[$module['code']] : [
                    'can_view' => false,
                    'can_create' => false,
                    'can_edit' => false,
                    'can_delete' => false,
                    'can_export' => false,
                    'can_approve' => false,
                    'access_until' => null,
                    'is_active' => false,
                ]
            );
        }, $modules);

        return response()->json([
            'status' => 'ok',
            'user' => $user,
            'permissions' => $modulesWithPermissions,
        ]);
    }

    /**
     * Update module permissions for user
     */
    public function updatePermissions(Request $request, User $user)
    {
        if ($user->id === Auth::id()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Cannot modify your own permissions'
            ], 403);
        }

        try {
            $data = $request->validate([
                'permissions' => 'required|array',
                'permissions.*.module_code' => 'required|string',
                'permissions.*.can_view' => 'boolean',
                'permissions.*.can_create' => 'boolean',
                'permissions.*.can_edit' => 'boolean',
                'permissions.*.can_delete' => 'boolean',
                'permissions.*.can_export' => 'boolean',
                'permissions.*.can_approve' => 'boolean',
                'permissions.*.access_until' => 'nullable|date',
            ]);

            // Clear existing permissions
            $user->modulePermissions()->delete();

            // Create new permissions
            foreach ($data['permissions'] as $perm) {
                if ($perm['can_view'] || $perm['can_create'] || $perm['can_edit'] || $perm['can_delete']) {
                    UserModulePermission::create([
                        'user_id' => $user->id,
                        'module_code' => $perm['module_code'],
                        'module_name' => $this->getModuleName($perm['module_code']),
                        'can_view' => $perm['can_view'] ?? false,
                        'can_create' => $perm['can_create'] ?? false,
                        'can_edit' => $perm['can_edit'] ?? false,
                        'can_delete' => $perm['can_delete'] ?? false,
                        'can_export' => $perm['can_export'] ?? false,
                        'can_approve' => $perm['can_approve'] ?? false,
                        'access_until' => $perm['access_until'] ?? null,
                        'is_active' => true,
                    ]);
                }
            }

            // Log the change
            Log::info("Module permissions updated", [
                'admin_id' => Auth::id(),
                'user_id' => $user->id,
                'user_name' => $user->name,
            ]);

            return response()->json([
                'status' => 'ok',
                'message' => 'Permissions updated successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 422);
        }
    }

    /**
     * Grant quick access to a module
     */
    public function grantQuickAccess(Request $request, User $user)
    {
        $data = $request->validate([
            'module_code' => 'required|string',
            'duration_days' => 'integer|min:1|max:365',
        ]);

        try {
            $accessUntil = $data['duration_days']
                ? now()->addDays($data['duration_days'])
                : null;

            // Check if already has this module
            $existing = $user->modulePermissions()
                ->forModule($data['module_code'])
                ->first();

            if ($existing) {
                $existing->update([
                    'is_active' => true,
                    'access_until' => $accessUntil,
                ]);
            } else {
                UserModulePermission::create([
                    'user_id' => $user->id,
                    'module_code' => $data['module_code'],
                    'module_name' => $this->getModuleName($data['module_code']),
                    'can_view' => true,
                    'can_create' => true,
                    'can_edit' => true,
                    'can_delete' => false,
                    'access_until' => $accessUntil,
                    'is_active' => true,
                ]);
            }

            return response()->json([
                'status' => 'ok',
                'message' => 'Quick access granted',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 422);
        }
    }

    /**
     * Revoke access to a module
     */
    public function revokeAccess(Request $request, User $user)
    {
        $data = $request->validate([
            'module_code' => 'required|string',
        ]);

        try {
            $user->modulePermissions()
                ->forModule($data['module_code'])
                ->update(['is_active' => false]);

            Log::info("Module access revoked", [
                'admin_id' => Auth::id(),
                'user_id' => $user->id,
                'module' => $data['module_code'],
            ]);

            return response()->json([
                'status' => 'ok',
                'message' => 'Access revoked',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 422);
        }
    }

    /**
     * Helper to get module name from code
     */
    private function getModuleName(string $code): string
    {
        $modules = array_column($this->getAvailableModules(), 'name', 'code');
        return $modules[$code] ?? ucfirst($code);
    }
}
