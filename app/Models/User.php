<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasUuids;

    protected $primaryKey = 'id';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'name',
        'email',
        'password',
        'pin',
        'level'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    public function permissions()
    {
        return $this->hasMany(UserPermission::class);
    }

    public function modulePermissions()
    {
        return $this->hasMany(UserModulePermission::class);
    }

    /**
     * Check if user can access a module with specific action
     */
    public function canAccessModule(string $moduleCode, string $action = 'view'): bool
    {
        $permission = $this->modulePermissions()
            ->forModule($moduleCode)
            ->active()
            ->first();

        return $permission ? $permission->can($action) : false;
    }

    /**
     * Get all active modules for user
     */
    public function getActiveModules(): array
    {
        return $this->modulePermissions()
            ->active()
            ->pluck('module_code')
            ->toArray();
    }

    /**
     * Get detailed permissions for dashboard
     */
    public function getModulePermissionsForUI(): array
    {
        return $this->modulePermissions()
            ->active()
            ->get()
            ->map(function ($perm) {
                return [
                    'module_code' => $perm->module_code,
                    'module_name' => $perm->module_name,
                    'can_view' => $perm->can_view,
                    'can_create' => $perm->can_create,
                    'can_edit' => $perm->can_edit,
                    'can_delete' => $perm->can_delete,
                    'can_export' => $perm->can_export,
                    'can_approve' => $perm->can_approve,
                    'access_until' => $perm->access_until,
                ];
            })
            ->toArray();
    }
}

