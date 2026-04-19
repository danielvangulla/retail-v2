<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserModulePermission;
use Illuminate\Database\Seeder;

class ModulePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Define permission templates for different roles
        $templates = [
            'admin' => [
                'barang' => ['view' => true, 'create' => true, 'edit' => true, 'delete' => true, 'export' => true, 'approve' => true, 'manage_users' => true],
                'pembelian' => ['view' => true, 'create' => true, 'edit' => true, 'delete' => true, 'export' => true, 'approve' => true],
                'piutang' => ['view' => true, 'create' => true, 'edit' => true, 'delete' => true, 'export' => true, 'approve' => true],
                'kasir' => ['view' => true, 'create' => true, 'edit' => true, 'delete' => true, 'export' => false],
                'reports' => ['view' => true, 'create' => false, 'edit' => false, 'delete' => false, 'export' => true],
                'settings' => ['view' => true, 'create' => true, 'edit' => true, 'delete' => true, 'export' => false, 'manage_users' => true],
            ],
            'kasir' => [
                'kasir' => ['view' => true, 'create' => true, 'edit' => true, 'delete' => false, 'export' => false],
                'barang' => ['view' => true, 'create' => false, 'edit' => false, 'delete' => false, 'export' => false],
                'piutang' => ['view' => true, 'create' => true, 'edit' => false, 'delete' => false, 'export' => false],
                'reports' => ['view' => true, 'create' => false, 'edit' => false, 'delete' => false, 'export' => false],
            ],
            'supervisor' => [
                'barang' => ['view' => true, 'create' => true, 'edit' => true, 'delete' => false, 'export' => true],
                'pembelian' => ['view' => true, 'create' => true, 'edit' => true, 'delete' => false, 'export' => true, 'approve' => true],
                'piutang' => ['view' => true, 'create' => true, 'edit' => true, 'delete' => false, 'export' => true],
                'kasir' => ['view' => true, 'create' => true, 'edit' => true, 'delete' => true, 'export' => true],
                'reports' => ['view' => true, 'create' => false, 'edit' => false, 'delete' => false, 'export' => true],
                'settings' => ['view' => true, 'create' => false, 'edit' => false, 'delete' => false, 'manage_users' => true],
            ],
            'staff' => [
                'barang' => ['view' => true, 'create' => false, 'edit' => false, 'delete' => false, 'export' => false],
                'reports' => ['view' => true, 'create' => false, 'edit' => false, 'delete' => false, 'export' => false],
            ],
        ];

        $availableModules = [
            'barang' => 'Inventory Management',
            'pembelian' => 'Purchasing',
            'piutang' => 'Receivables',
            'kasir' => 'Point of Sale',
            'reports' => 'Reports',
            'settings' => 'Settings',
        ];

        // Get all users and assign permissions based on level
        $users = User::all();

        foreach ($users as $user) {
            // Determine role based on level
            $roleTemplate = match($user->level) {
                0, null => 'staff',      // Default to staff
                1 => 'admin',            // level 1 = Admin
                2 => 'supervisor',       // level 2 = Supervisor
                3 => 'kasir',            // level 3 = Kasir
                default => 'staff',
            };

            $permissionTemplate = $templates[$roleTemplate];

            // Create permission records
            foreach ($permissionTemplate as $moduleCode => $actions) {
                $existing = UserModulePermission::where('user_id', $user->id)
                    ->where('module_code', $moduleCode)
                    ->first();

                if (!$existing) {
                    UserModulePermission::create([
                        'user_id' => $user->id,
                        'module_code' => $moduleCode,
                        'module_name' => $availableModules[$moduleCode] ?? ucfirst($moduleCode),
                        'can_view' => $actions['view'] ?? false,
                        'can_create' => $actions['create'] ?? false,
                        'can_edit' => $actions['edit'] ?? false,
                        'can_delete' => $actions['delete'] ?? false,
                        'can_export' => $actions['export'] ?? false,
                        'can_approve' => $actions['approve'] ?? false,
                        'can_manage_users' => $actions['manage_users'] ?? false,
                        'is_active' => true,
                    ]);

                    $this->command->info("✓ Permissions created for {$user->name} ({$roleTemplate}): {$moduleCode}");
                }
            }
        }

        $this->command->info("\n✅ Module permissions seeded successfully!");
    }
}
