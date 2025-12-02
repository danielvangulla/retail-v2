# Role-Based Access Control (RBAC) - Module Permission System

## Overview

**NEW FEATURE:** Granular, per-module permission system that allows admins to dynamically open/close access to any module for any user, including time-based access control.

---

## Architecture

### Database Schema

#### `user_module_permissions` Table

```sql
CREATE TABLE user_module_permissions (
  id UUID PRIMARY KEY,
  user_id UUID,
  module_code VARCHAR(50),           -- 'barang', 'pembelian', 'piutang', 'reports', 'settings'
  module_name VARCHAR(100),          -- 'Inventory Management', etc.
  
  -- Fine-grained permissions
  can_view BOOLEAN DEFAULT false,    -- View/list module
  can_create BOOLEAN DEFAULT false,  -- Create new items
  can_edit BOOLEAN DEFAULT false,    -- Edit items
  can_delete BOOLEAN DEFAULT false,  -- Delete items
  can_export BOOLEAN DEFAULT false,  -- Export data
  can_approve BOOLEAN DEFAULT false, -- Approve workflows
  can_manage_users BOOLEAN DEFAULT false, -- Manage users/permissions
  
  -- Time-based access
  access_until TIMESTAMP NULL,       -- Grant access UNTIL this date
  is_active BOOLEAN DEFAULT true,    -- Soft enable/disable
  
  timestamps
);
```

**Indexes:**
- `UNIQUE(user_id, module_code)` - One permission per module per user
- `INDEX(module_code)` - Fast module lookups
- `INDEX(is_active)` - Filter active permissions

---

## Available Modules

```javascript
[
  { code: 'barang', name: 'Inventory Management', description: 'Manage products and stock' },
  { code: 'pembelian', name: 'Purchasing', description: 'Purchase orders and incoming stock' },
  { code: 'piutang', name: 'Receivables', description: 'Credit system and member accounts' },
  { code: 'kasir', name: 'Point of Sale', description: 'Cashier and transactions' },
  { code: 'reports', name: 'Reports', description: 'Sales, revenue, and analytics' },
  { code: 'settings', name: 'Settings', description: 'System configuration and users' },
]
```

---

## Permission System

### Actions

Each module can have these permission levels:

| Action | Meaning | Use Case |
|--------|---------|----------|
| `can_view` | Can view/list items | Dashboard access |
| `can_create` | Can create new items | Add new product |
| `can_edit` | Can modify items | Update product details |
| `can_delete` | Can delete items | Remove product |
| `can_export` | Can export data | Download report to Excel |
| `can_approve` | Can approve workflows | Confirm purchase order |
| `can_manage_users` | Can manage permissions | Assign roles to other users |

---

## User Model Methods

### Check Single Permission

```php
// File: app/Models/User.php

// Check if user can perform action on module
if ($user->canAccessModule('barang', 'edit')) {
    // User can edit products
}

// Supports: 'view', 'create', 'edit', 'delete', 'export', 'approve', 'manage_users'
```

### Get Active Modules

```php
// Get list of all modules user has access to
$modules = $user->getActiveModules();
// Returns: ['barang', 'piutang', 'reports']
```

### Get Permissions for UI

```php
// Get detailed permissions for frontend dashboard
$perms = $user->getModulePermissionsForUI();
// Returns:
[
    [
        'module_code' => 'barang',
        'module_name' => 'Inventory Management',
        'can_view' => true,
        'can_create' => true,
        'can_edit' => true,
        'can_delete' => false,
        'can_export' => true,
        'access_until' => '2025-12-31',
    ],
    ...
]
```

---

## API Endpoints

### 1. List All Modules & User Permissions

**Endpoint:** `GET /module-permissions`

**Middleware:** `check.module:settings,manage_users`

**Response:**
```json
{
  "users": [
    {
      "id": "uuid-user-1",
      "name": "John Cashier",
      "email": "john@store.com",
      "modulePermissions": [
        {
          "id": "uuid-perm",
          "module_code": "kasir",
          "module_name": "Point of Sale",
          "can_view": true,
          "can_create": true,
          "can_edit": true,
          "can_delete": false,
          "can_export": false,
          "access_until": null,
          "is_active": true
        }
      ]
    }
  ],
  "availableModules": [
    { "code": "barang", "name": "Inventory Management", "description": "..." },
    ...
  ]
}
```

---

### 2. Get Permissions for Single User

**Endpoint:** `GET /module-permissions/{user_id}`

**Middleware:** `check.module:settings,manage_users`

**Response:**
```json
{
  "status": "ok",
  "user": { "id": "...", "name": "John", ... },
  "permissions": [
    {
      "code": "barang",
      "name": "Inventory Management",
      "description": "...",
      "can_view": true,
      "can_create": true,
      "can_edit": true,
      "can_delete": false,
      "can_export": true,
      "can_approve": false,
      "access_until": null,
      "is_active": true
    },
    ...
  ]
}
```

---

### 3. Update Module Permissions

**Endpoint:** `POST /module-permissions/{user_id}`

**Middleware:** `check.module:settings,manage_users`

**Request:**
```json
{
  "permissions": [
    {
      "module_code": "barang",
      "can_view": true,
      "can_create": true,
      "can_edit": true,
      "can_delete": false,
      "can_export": true,
      "can_approve": false,
      "access_until": "2025-12-31"
    },
    {
      "module_code": "piutang",
      "can_view": true,
      "can_create": false,
      "can_edit": false,
      "can_delete": false,
      "can_export": true,
      "access_until": null
    }
  ]
}
```

**Response:**
```json
{
  "status": "ok",
  "message": "Permissions updated successfully"
}
```

---

### 4. Grant Quick Access (Time-Limited)

**Endpoint:** `POST /module-permissions/{user_id}/grant-quick`

**Middleware:** `check.module:settings,manage_users`

**Request:**
```json
{
  "module_code": "barang",
  "duration_days": 7
}
```

**Response:**
```json
{
  "status": "ok",
  "message": "Quick access granted for 7 days"
}
```

---

### 5. Revoke Module Access

**Endpoint:** `POST /module-permissions/{user_id}/revoke`

**Middleware:** `check.module:settings,manage_users`

**Request:**
```json
{
  "module_code": "barang"
}
```

**Response:**
```json
{
  "status": "ok",
  "message": "Access revoked"
}
```

---

## Middleware: CheckModulePermission

### Location
`app/Http/Middleware/CheckModulePermission.php`

### Usage in Routes

```php
// Single module, single action
Route::post('/barang', [BarangController::class, 'store'])
    ->middleware('check.module:barang,create');

// Single module, multiple actions (OR logic)
Route::patch('/barang/{id}', [BarangController::class, 'update'])
    ->middleware('check.module:barang,edit|delete');

// Settings (requires manage_users permission)
Route::post('/module-permissions/{user}', [ModulePermissionController::class, 'updatePermissions'])
    ->middleware('check.module:settings,manage_users');
```

### How It Works

1. Extract middleware parameters: `module_code` & `actions`
2. Get authenticated user
3. Check if user has permission for ANY of the actions
4. If yes → allow, if no → return 403 with error message
5. Log unauthorized attempts for security audit

---

## Frontend Integration

### Check Permissions Before Rendering

```typescript
// resources/js/pages/admin/Dashboard.tsx

export default function Dashboard({ userPermissions }) {
  return (
    <div>
      {/* Show menu item only if user can view barang */}
      {userPermissions.barang?.can_view && (
        <Link href="/barang">Inventory</Link>
      )}
      
      {/* Show button only if user can create */}
      {userPermissions.barang?.can_create && (
        <Button onClick={handleCreate}>+ New Product</Button>
      )}
    </div>
  );
}
```

### Populate userPermissions in Initial Page Load

```php
// app/Http/Controllers/Back/DashboardController.php

public function index()
{
    return Inertia::render('admin/Dashboard', [
        'userPermissions' => Auth::user()->getModulePermissionsForUI(),
    ]);
}
```

---

## Permission Management UI

### Admin Module Permission Page

**File:** `resources/js/pages/admin/ModulePermission/Index.tsx`

**Features:**
- Table of all users
- Select user → show their permissions
- Toggle checkboxes for each permission
- Time-based access selector
- "Grant Quick Access" button (e.g., 7 days access)
- "Revoke" button for immediate access removal
- Audit log showing who changed what when

### Mockup

```
┌─────────────────────────────────────────────────────┐
│ MODULE PERMISSION MANAGEMENT                        │
├─────────────────────────────────────────────────────┤
│ Users:                                              │
│ [v] John (Kasir)     [Select] [Show Permissions]   │
│ [ ] Mary (Inventory) [Select] [Show Permissions]   │
│ [ ] Bob (Manager)    [Select] [Show Permissions]   │
├─────────────────────────────────────────────────────┤
│ JOHN'S PERMISSIONS                                  │
├────────────────────┬──┬──┬──┬──┬──┬──┬───────────┤
│ Module             │V │C │E │D │Ex│Ap│ Until    │
├────────────────────┼──┼──┼──┼──┼──┼──┼───────────┤
│ Inventory          │✓ │✓ │✓ │  │✓ │  │ -        │
│ Purchasing         │✓ │  │  │  │  │  │ 2025-12-31
│ Receivables        │✓ │✓ │✓ │  │✓ │  │ -        │
│ Point of Sale      │✓ │✓ │✓ │✓ │  │  │ -        │
│ Reports            │✓ │  │  │  │✓ │  │ -        │
│ Settings           │  │  │  │  │  │  │ -        │
└────────────────────┴──┴──┴──┴──┴──┴──┴───────────┘
[Grant 7-day Access] [Save Changes] [Revoke All Access]
```

---

## Usage Examples

### Scenario 1: Give Kasir Access to POS Module Only

```php
// Admin command/controller
$kasir = User::where('name', 'John')->first();

UserModulePermission::create([
    'user_id' => $kasir->id,
    'module_code' => 'kasir',
    'module_name' => 'Point of Sale',
    'can_view' => true,
    'can_create' => true,
    'can_edit' => true,
    'can_delete' => false,
    'is_active' => true,
]);

// Check permission
if ($kasir->canAccessModule('kasir', 'view')) {
    // Allow access to POS
}
```

### Scenario 2: Grant Temporary Purchasing Access (7 days)

```php
$staff = User::where('name', 'Mary')->first();

UserModulePermission::create([
    'user_id' => $staff->id,
    'module_code' => 'pembelian',
    'module_name' => 'Purchasing',
    'can_view' => true,
    'can_create' => true,
    'can_edit' => true,
    'can_delete' => false,
    'access_until' => now()->addDays(7),
    'is_active' => true,
]);

// After 7 days, access automatically expires
// (checked via isCurrentlyActive() method)
```

### Scenario 3: Prevent Access Immediately

```php
$user = User::find($userId);

// Soft disable (keep permission record for history)
$user->modulePermissions()
    ->forModule('barang')
    ->update(['is_active' => false]);

// Or hard delete
$user->modulePermissions()
    ->forModule('barang')
    ->delete();
```

---

## Security Considerations

### ✅ Best Practices

1. **Never modify your own permissions** - Admin interface prevents self-modification
2. **Audit logging** - All permission changes logged with admin ID & timestamp
3. **Middleware validation** - Every protected route checks permission at request level
4. **Role separation** - Only users with `can_manage_users` can modify permissions
5. **Time-based expiration** - Access can auto-expire

### ⚠️ Important Notes

- Permissions checked at **request level** (via middleware)
- Frontend checks are for UX only, backend validates always
- Expired permissions automatically become inactive
- No cascading deletes (user deletion doesn't cascade to permissions)

---

## Testing

### Unit Test: Check Permission Method

```php
// tests/Unit/UserModulePermissionTest.php

it('allows user with permission', function () {
    $user = User::factory()->create();
    UserModulePermission::create([
        'user_id' => $user->id,
        'module_code' => 'barang',
        'module_name' => 'Inventory',
        'can_create' => true,
        'is_active' => true,
    ]);

    expect($user->canAccessModule('barang', 'create'))->toBeTrue();
});

it('denies expired permission', function () {
    $user = User::factory()->create();
    UserModulePermission::create([
        'user_id' => $user->id,
        'module_code' => 'barang',
        'module_name' => 'Inventory',
        'can_create' => true,
        'access_until' => now()->subDay(),
        'is_active' => true,
    ]);

    expect($user->canAccessModule('barang', 'create'))->toBeFalse();
});
```

### Feature Test: Middleware Validation

```php
// tests/Feature/ModulePermissionMiddlewareTest.php

it('allows request with valid permission', function () {
    $user = User::factory()->create();
    UserModulePermission::factory()->for($user)->create([
        'module_code' => 'barang',
        'can_create' => true,
    ]);

    $response = $this->actingAs($user)
        ->post('/barang', ['name' => 'Test']);

    expect($response->status())->toBe(200);
});

it('rejects request without permission', function () {
    $user = User::factory()->create();
    
    $response = $this->actingAs($user)
        ->post('/barang', ['name' => 'Test']);

    expect($response->status())->toBe(403);
    expect($response->json('status'))->toBe('error');
});
```

---

## Migration & Deployment

### 1. Run Migration

```bash
php artisan migrate
```

This creates `user_module_permissions` table.

### 2. Seed Initial Permissions (Optional)

```php
// database/seeders/ModulePermissionSeeder.php
// Grant all permissions to admin users (level = 1)

php artisan db:seed --class=ModulePermissionSeeder
```

### 3. Update Routes with Middleware

Add `->middleware('check.module:module_code,action')` to protected routes.

### 4. Update Frontend

Import user permissions in Inertia pages:

```php
return Inertia::render('PageName', [
    'userPermissions' => Auth::user()->getModulePermissionsForUI(),
]);
```

### 5. Test & Deploy

- Test permission checks via curl/Postman
- Test expired permissions
- Verify audit logging
- Deploy to production

---

## Troubleshooting

### Q: User still has access after revoking?
**A:** Check if `is_active` field was updated, or cache not cleared.

### Q: Middleware returns 403 incorrectly?
**A:** Verify permission record exists and `is_active=true` & `access_until` is in future.

### Q: Multiple permissions per module?
**A:** Database constraint prevents duplicates. Check UNIQUE(user_id, module_code).

### Q: How to grant ALL permissions?
**A:** Create permission record with all `can_*` flags set to true.

---

## References

- Model: `app/Models/UserModulePermission.php`
- Middleware: `app/Http/Middleware/CheckModulePermission.php`
- Controller: `app/Http/Controllers/Back/ModulePermissionController.php`
- Migration: `database/migrations/2025_12_02_create_user_module_permissions_table.php`
