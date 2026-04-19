<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserModulePermission extends Model
{
    use HasFactory, HasUuids;

    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $table = 'user_module_permissions';

    protected $fillable = [
        'user_id',
        'module_code',
        'module_name',
        'can_view',
        'can_create',
        'can_edit',
        'can_delete',
        'can_export',
        'can_approve',
        'can_manage_users',
        'access_until',
        'is_active',
    ];

    protected $casts = [
        'can_view' => 'boolean',
        'can_create' => 'boolean',
        'can_edit' => 'boolean',
        'can_delete' => 'boolean',
        'can_export' => 'boolean',
        'can_approve' => 'boolean',
        'can_manage_users' => 'boolean',
        'is_active' => 'boolean',
        'access_until' => 'datetime',
    ];

    /**
     * Relationship with User
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if permission is currently active (not expired)
     */
    public function isCurrentlyActive(): bool
    {
        if (!$this->is_active) {
            return false;
        }

        if ($this->access_until && now()->isAfter($this->access_until)) {
            return false;
        }

        return true;
    }

    /**
     * Check specific action permission
     */
    public function can(string $action): bool
    {
        if (!$this->isCurrentlyActive()) {
            return false;
        }

        return match ($action) {
            'view' => $this->can_view,
            'create' => $this->can_create,
            'edit' => $this->can_edit,
            'delete' => $this->can_delete,
            'export' => $this->can_export,
            'approve' => $this->can_approve,
            'manage_users' => $this->can_manage_users,
            default => false,
        };
    }

    /**
     * Scope: Get active permissions only
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('access_until')
                    ->orWhere('access_until', '>', now());
            });
    }

    /**
     * Scope: Get permissions for a specific module
     */
    public function scopeForModule($query, string $moduleCode)
    {
        return $query->where('module_code', $moduleCode);
    }
}
