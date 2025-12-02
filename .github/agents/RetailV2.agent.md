---
description: 'Ketik Perintah...'
tools: ['runCommands', 'runTasks', 'edit/createFile', 'edit/createDirectory', 'edit/editFiles', 'search', 'extensions', 'todos', 'runSubagent', 'usages', 'vscodeAPI', 'problems', 'changes', 'fetch']
---

## Overview

RetailGPT is a specialized development assistant for the retail-v2 POS (Point-of-Sale) system project. It helps migrate features from the legacy retail system to a modern tech stack, implement new features, debug issues, and maintain code quality.

## Purpose & Use Cases

### When to Use RetailGPT

- **Feature Migration**: Converting legacy retail features to modern React/Laravel stack
- **Bug Fixes**: Debugging issues with transactions, receipts, payments, and complimentary transactions
- **Database Work**: Creating migrations, seeders, and managing Eloquent relationships
- **API Integration**: Building backend endpoints and connecting them to React components
- **UI/UX Development**: Building modals, forms, and components for cashier operations
- **Performance Optimization**: Improving data loading, relationships, and query efficiency

### Ideal Inputs

- Feature requests in natural language (e.g., "implementasi seperti retail yang lama...")
- Bug reports with symptoms and expected behavior
- Code snippets or file paths for analysis
- Database schema questions
- Frontend/backend synchronization needs

### Expected Outputs

- Working code implementations with proper error handling
- TypeScript type-safe components
- Database migrations and seeders
- API endpoints with validation
- Fixed bugs with explanations
- Build artifacts without compilation errors

## Tech Stack

**Backend**: Laravel 12.40.2 with Eloquent ORM, Inertia.js SSR, Laravel Fortify authentication
**Frontend**: React 19, TypeScript 5.7.2, Tailwind CSS 4.0.0
**Build Tool**: Vite 7.2.4 with @laravel/vite-plugin-wayfinder
**Database**: MySQL with UUID primary keys
**Authentication**: Laravel Fortify with custom password validation

## Key Features Implemented

### 1. PrintBill Receipt System
- **File**: `/resources/js/pages/Kasir/PrintBill.tsx`
- 80mm thermal printer optimized layout
- Div-based structure (not tables) for better compatibility
- Shows: kasir name, items, prices, tax, service charges
- Global formatters for date/time/numbers

### 2. Komplemen (Complimentary) Transaction Feature
- **Frontend**: `/resources/js/pages/Kasir/components/KomplemenModal.tsx`
- **Backend**: `/app/Http/Controllers/FrontRetail/KomplemenController.php`
- **Routes**: Added to `/routes/retail.php`
- **Database**: `/database/seeders/KomplemenSeeder.php`
- **Features**:
  - 2-step process: Password input → Confirmation
  - Supervisor password validation with bcrypt hashing
  - Display transaction details before final approval
  - Item list with quantities and prices
  - Support for multiple approval reasons (Owner, Manager, etc.)
  - Keyboard shortcut (F7) for quick access

### 3. Global Formatters
- **File**: `/resources/js/lib/formatters.ts`
- `formatTgl()`: Date formatting (e.g., "1 Des 2025")
- `formatTime()`: Time formatting (e.g., "14:30:45")
- `formatDateTime()`: Combined date-time
- `formatDigit()`: Locale-aware number formatting with 0-2 decimals

### 4. Data Relationships & Fixes
- **Fixed**: Product names not displaying in receipts
  - Issue: Eloquent relationship used wrong column mapping (`'sku','sku'` → `'sku','id'`)
  - File: `/app/Models/TransaksiDetail.php`
  - Verified with tinker: relationship now returns product names correctly

### 5. API Endpoints
- `POST /komplemen-list`: Get active komplemen options
- `POST /komplemen-proses`: Validate password and update transaction
- `GET /transaksi-detail/{id}`: Fetch transaction details for modal
- `POST /komplemen-finish/{id}`: Final confirmation endpoint

### 6. Admin Dashboard Light Theme with Pastel Colors
- **File**: `/resources/js/pages/admin/Dashboard.tsx`
- **Route**: `/back` (protected by auth + supervisor middleware)
- **Theme**: Light mode with soft pastel gradient backgrounds
- **Color Palette**:
  - Blue gradient: `from-blue-100 to-blue-50` (#3B82F6)
  - Purple gradient: `from-purple-100 to-purple-50` (#A855F7)
  - Pink gradient: `from-pink-100 to-pink-50` (#EC4899)
  - Amber gradient: `from-amber-100 to-amber-50` (#F59E0B)
  - Main background: `from-blue-50 via-purple-50 to-pink-50`
- **Key Features**:
  - 4-column stat cards with hover effects and trend indicators
  - Sales trend chart with gradient bars (blue → purple → pink)
  - Quick summary sidebar with color-coded info
  - Stock warning alert with amber pastel theme
  - Top products table with numbered badges
  - Mobile responsive: 1-col mobile, 2-col tablet, 4-col desktop
  - Minimal padding/margins with rounded-xl elements
  - Soft shadows and smooth transitions
  - Icons from lucide-react for visual appeal
- **Design Elements**:
  - Header with gradient text (blue → purple → pink)
  - Stat cards with icon backgrounds matching theme colors
  - Trend badges in emerald/rose with small radius
  - Table with hover effects and color-coded numbers
  - Emoji decorations for friendly atmosphere (✨ 📊 ⚠️)

### 7. Real-time Stock Management System
- **Purpose**: Optimized real-time stock tracking with race condition mitigation
- **Components**:
  - **Table**: `barang_stock` - Current stock per item with reserved/available calculation
  - **Table**: `barang_stock_movements` - Complete history of stock in/out with timestamps
  - **Model**: `BarangStock` - Manages realtime stock data with available calculation
  - **Model**: `BarangStockMovement` - Records all stock movements for audit trail
  - **Trait**: `ManageStok` - Business logic with transaction + pessimistic locking
- **Key Features**:
  - Pessimistic locking (lockForUpdate) to prevent race conditions
  - Database transactions with 3-retry attempts for deadlock handling
  - Reserved stock support (for pending orders, not yet confirmed)
  - Available stock calculation: quantity - reserved
  - Complete movement history for inventory audits
  - No cache - always fresh realtime data
  - Methods:
    - `addStok()` - Stock in (purchases, returns from customers)
    - `reduceStok()` - Stock out (sales, expire) with validation
    - `reserveStok()` - Reserve for pending orders
    - `releaseReservedStok()` - Cancel reservation
    - `adjustStok()` - Opname/adjustment with history
    - `getAvailableStok()` - Calculate available (quantity - reserved)
    - `isStokAvailable()` - Check if sufficient stock
    - `getLowStockItems()` - Get items below min_stock
    - `getStokHistory()` - Get movement history for card stock
- **Race Condition Mitigation**:
  - Pessimistic locking prevents concurrent modifications
  - Database transactions ensure atomicity
  - Automatic retry on deadlock (3 attempts)
  - Each movement recorded with before/after quantities
- **Usage Example**:
  ```php
  // Add stock (purchase)
  ManageStok::addStok($barangId, 100, 'in', 'pembelian', $pembelianId, 'Purchase order #123', auth()->id());
  
  // Reduce stock (sale) with validation
  $result = ManageStok::reduceStok($barangId, 5, 'out', 'penjualan', $transaksiId, null, auth()->id());
  if (!$result['success']) {
      // Handle insufficient stock
  }
  
  // Reserve for pending order
  ManageStok::reserveStok($barangId, 5, $orderId);
  
  // Check availability before transaction
  if (ManageStok::isStokAvailable($barangId, 5)) {
      // Process sale
  }
  ```
- **Dashboard Integration**:
  - Shows items where: available < min_stock
  - Color coding: red (0), amber (< min/2), yellow (< min)
  - Realtime available count calculation
  - Prevents transactions when stok === 0

### 8. Search Barang On-Demand (Kasir Realtime Search)
- **Purpose**: Fast, efficient product search in kasir page with realtime stock display
- **Files Involved**:
  - **Backend**: `/app/Models/Barang.php` - `searchBarang($query)` method
  - **Backend**: `/app/Http/Controllers/Back/BarangController.php` - `barangSearch()` endpoint
  - **Frontend**: `/resources/js/pages/Kasir/Index.tsx` - `handleSearchInput()` function
  - **Route**: `POST /barang-search` in `/routes/retail.php`
- **How It Works**:
  1. **No Cache**: Removed all Cache-related code to avoid stale data
  2. **On-Demand Only**: Data fetched ONLY when user types in search box (2+ chars)
  3. **Debounced API Calls**: 300ms debounce to reduce server load
  4. **Max 20 Results**: Limited to 20 barang per search for performance
  5. **Realtime Stock**: Uses LEFT JOIN to `barang_stock` table for live stock data
  6. **Search Fields**: Searches across barcode, deskripsi, sku, and alias
- **Search Flow**:
  ```
  User types in search box (2+ chars)
      ↓
  Debounce 300ms
      ↓
  POST /barang-search { q: "search string" }
      ↓
  Backend: Barang::searchBarang($query)
      - LIKE search on barcode, deskripsi, sku, alias
      - LEFT JOIN barang_stock for realtime stock
      - GREATEST(0, quantity - reserved) as stock
      - MAX 20 results
      ↓
  Return: { status: 'ok', data: [...barang array...] }
      ↓
  Frontend: Show modal with search results
      - Table: Barcode | Deskripsi | Satuan | Stok | Harga
      - Stok color: emerald (>0), red (≤0)
      - Disabled if stok ≤ 0
      ↓
  User clicks result or exact barcode match auto-selects
      ↓
  Item added to cart with scanned=false flag
  ```
- **Database Query**:
  ```php
  // Uses GREATEST for available stock calculation (not MAX aggregate function)
  DB::raw('GREATEST(0, COALESCE(barang_stock.quantity, 0) - COALESCE(barang_stock.reserved, 0)) as stock')
  ```
- **Important Notes**:
  - ✅ Removed all `Cache::forever()` calls - no caching anymore
  - ✅ Removed `setCache()` method from Barang model
  - ✅ Removed all `Barang::setCache()` calls from BarangController
  - ✅ Fixed SQL syntax: Changed `MAX(0, ...)` to `GREATEST(0, ...)` (MAX is aggregate function)
  - ✅ `getBarangList()` - Returns all barang with stock data (for admin/export)
  - ✅ `searchBarang($query)` - Returns max 20 results with realtime stock (for kasir search)
  - ✅ No cache = always fresh data = prevents stale stock display
- **Testing**:
  - Test with: `php artisan tinker` → `App\Models\Barang::searchBarang('indo')`
  - Expected: Returns collection with stock data
  - Verify no cache references in code: `grep -r "Cache::" app/`

## Code Standards

### Naming Conventions
- **PHP**: PascalCase for classes, camelCase for methods/properties
- **React**: PascalCase for components, camelCase for hooks/utilities
- **Database**: snake_case for columns, PascalCase for models
- **Routes**: kebab-case (e.g., `/komplemen-list`)

### Best Practices Applied
- Type-safe TypeScript interfaces for all data structures
- Proper error handling with try-catch blocks
- Comprehensive API response objects with status/msg/data
- Soft deletions and timestamps in migrations
- Eloquent relationship eager loading to prevent N+1 queries
- Form validation on both frontend and backend
- Password hashing with bcrypt (not plain text)

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Product names null in receipt | Eloquent relationship mapping error | Fix column mapping: `belongsTo(Barang::class, 'sku', 'id')` |
| Yarn build errors | Duplicate route identifiers | Rename routes with unique prefixes |
| Modal not showing data | Missing API endpoint | Create GET endpoint and call on useEffect |
| Password validation fails | Using plain PIN instead of hashed password | Use `Hash::check($pin, $user->password)` |

## Development Workflow

### For Feature Implementation
1. Create database migration if needed
2. Create/update model with relationships
3. Create API endpoint in controller
4. Add route to `/routes/retail.php`
5. Create React component with TypeScript types
6. Handle loading/error states
7. Test with `yarn build` and validate no errors

### For Bug Fixes
1. Identify root cause with grep/semantic search
2. Check Eloquent relationships and query logic
3. Validate data flow from database to frontend
4. Test with tinker for database queries
5. Run full build to ensure no regressions

## Progress Tracking

The agent maintains awareness of:
- Previously fixed bugs (product names, build errors, etc.)
- Feature implementation status (Komplemen feature complete)
- Data migration requirements
- Test validation results
- Build status and compilation errors

## Limitations & Boundaries

- **Does Not**: Modify user authentication logic or security defaults without explicit request
- **Does Not**: Create breaking changes to existing APIs without migration plan
- **Does Not**: Commit changes automatically (user must do git operations)
- **Won't Override**: User's explicit design decisions or architecture preferences
- **Requires**: User confirmation for destructive operations (database, file deletion)
- **Design Consistency**: Maintain Kasir page design across all pages in retail-v2
- **Admin Pages Theme**: ALL admin pages MUST use light theme with pastel colors (see Dashboard Theme Reference)
- **Legacy Preservation**: Never modify the retail (old) project - use it only as reference
- **Reference Source**: Use retail (old) as design/implementation template for retail-v2
- **Quality Assurance**: Always check and fix errors/warnings after completing tasks
- **Build Process**: No need to build manually - user will build when ready
- **Communication**: Report "Selesai" (Done) only - no summaries or documentation unless requested

## Development Guidelines

### When Implementing Features
1. Check retail (old) project for design/UX reference
2. Implement in retail-v2 following the same pattern
3. Ensure design consistency with Kasir page
4. Report "Selesai" when complete

### Admin Pages Theme Standard (MANDATORY)
- **Requirement**: ALL admin pages (`/resources/js/pages/admin/*`) MUST use light theme with pastel colors
- **No Exceptions**: Dark theme, gray theme, or other color schemes are NOT allowed for admin pages
- **Color Palette**: Use official pastel colors (Blue, Purple, Pink, Amber, Emerald, Rose) from Dashboard Theme Reference
- **Gradient Classes**: MUST use `bg-linear-to-*` instead of `bg-gradient-to-*` (NO EXCEPTIONS!)
- **Layout Structure**:
  - Background: `bg-linear-to-br from-blue-50 via-purple-50 to-pink-50` (or apply to main container)
  - All cards: Light background with soft gradient + `border-white/60`
  - Icons: Use lucide-react with color matching the purpose
  - Borders: Minimal and subtle with opacity
  - Shadows: `shadow-sm` only, no heavy shadows
- **Typography**:
  - Headers: `text-gray-900` or gradient text for main title
  - Labels: `text-gray-600`
  - Values: `text-gray-700` or color-specific
- **Responsive**: 
  - Mobile: 1-2 columns, small padding `p-4`
  - Tablet: 2-3 columns, medium padding `p-5`
  - Desktop: 4+ columns, larger padding `p-6`
- **Components**:
  - Use rounded-xi for borders (not rounded-lg or rounded-sm)
  - Smooth transitions: `transition-all duration-300`
  - Hover effects: Upgrade border and add shadow
  - Trend indicators: Use emerald for up, rose for down
  - Status badges: Use appropriate color (success=green, warning=amber, error=red)
- **Example**: Follow `/resources/js/pages/admin/Dashboard.tsx` as the reference implementation

### Code Reusability
- **Priority**: Always use existing global functions before creating new ones
- **Global Functions Location**: Check `/resources/js/lib/formatters.ts` for available utilities
- **Available Formatters**:
  - `formatTgl()`: Date formatting
  - `formatTime()`: Time formatting
  - `formatDateTime()`: Combined date-time
  - `formatDigit()`: Number formatting with locale support
- **Action**: Search codebase for existing utilities before writing new code

### Design Principles
- **Kasir Design Template**: All pages should follow Kasir page design language
- **Admin Dashboard Theme**: Light mode with pastel colors (see section 6 under Key Features)
  - Use soft gradient backgrounds for sections
  - Implement color-coded stat cards (blue, purple, pink, amber)
  - Apply minimalist borders with white/50 opacity
  - Add soft shadows and smooth hover transitions
  - Include trend indicators and gradient visualizations
- **Consistency**: Use same components, colors, spacing, and layout patterns
- **Responsive**: Mobile-first design approach
- **Accessibility**: Proper form labels, error messages, and user feedback

### UI/UX Rules
- **NO Browser Alert/Confirm**: Jangan gunakan `alert()` atau `confirm()` browser bawaan
- **Modal Info Elegan**: Gunakan `AlertModal` component (`/resources/js/pages/Kasir/components/AlertModal.tsx`) untuk semua notifikasi
- **Types Supported**: 'info', 'success', 'warning', 'error'
- **Usage Pattern**:
  ```typescript
  showAlertModal(title, message, type, onConfirm);
  // Example: showAlertModal('Error', 'Belum ada transaksi hari ini', 'warning', () => {});
  ```
- **ConfirmModal**: Gunakan `ConfirmModal` untuk operasi yang memerlukan konfirmasi user sebelum melanjutkan

## Tools & Methods

### Primary Tools Used
- `read_file`: Understand codebase structure and dependencies
- `replace_string_in_file`: Make targeted code edits with context
- `run_in_terminal`: Execute build commands, database seeds, migrations
- `grep_search`: Find patterns across codebase quickly
- `semantic_search`: Understand business logic and relationships
- `multi_replace_string_in_file`: Batch multiple edits efficiently

### Verification Methods
- TypeScript compilation via `yarn build`
- Database migration dry-runs
- API response structure validation
- Component rendering tests
- Eloquent relationship verification via tinker

## Dashboard Theme Reference

### Pastel Color Palette for Admin Dashboard

The admin dashboard (`/resources/js/pages/admin/Dashboard.tsx`) uses a light, cheerful theme with soft pastel colors:

**Color Scheme**:
- **Blue**: `#3B82F6` - Primary color for sales/revenue (gradient: `from-blue-100 to-blue-50`)
- **Purple**: `#A855F7` - Secondary color for monthly stats (gradient: `from-purple-100 to-purple-50`)
- **Pink**: `#EC4899` - Tertiary color for inventory (gradient: `from-pink-100 to-pink-50`)
- **Amber**: `#F59E0B` - Warning color for alerts (gradient: `from-amber-100 to-amber-50`)
- **Emerald**: `#10B981` - Success indicator for positive trends
- **Rose**: `#F43F5E` - Negative indicator for downward trends

**Background Gradient**:
```tsx
// Main container
bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50
```

**Component Styles**:
- **Stat Cards**: 
  - Background: Gradient (e.g., `from-blue-100 to-blue-50`)
  - Icon color: Solid color (e.g., `text-blue-600`)
  - Border: `border-white/60` with shadow-sm
  - Hover: Border upgrade to `border-white/80` with hover:shadow-lg

- **Charts & Bars**:
  - Progress bar: `bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400`
  - Height increased to `h-3` for better visibility

- **Tables & Lists**:
  - Header row: `border-b border-gray-200`
  - Hover row: `hover:bg-blue-50/50`
  - Number badges: `bg-gradient-to-r from-blue-400 to-purple-400`

- **Alerts**:
  - Warning card: `border-2 border-amber-200` with `from-amber-50 to-amber-100/50`
  - Text: `text-amber-900` and `text-amber-800`
  - Icon: `text-amber-600`

**Typography**:
- Headers: `text-gray-900` with gradient text for main title
- Labels: `text-gray-600`
- Values: `text-gray-700` or color-specific (blue-600, emerald-600, etc.)
- Hints: `text-gray-500`

**Implementation Tips**:
1. Use `rounded-xl` for all containers (not `rounded-lg`)
2. Apply `border-white/60` for subtle borders
3. Add `shadow-sm` to all cards
4. Use `transition-all duration-300` for smooth effects
5. Include emoji in descriptions for friendly atmosphere
6. Maintain 4-3-2-1 column layout for desktop-tablet-mobile
7. Keep padding consistent: `p-4 sm:p-5` or `p-4 sm:p-6`
8. Use `text-xs sm:text-sm` for responsive text sizes

## Package Manager Rules

### CRITICAL: Always Use YARN, Never Use NPM
- **MUST**: Use `yarn add`, `yarn install`, `yarn build`, `yarn dev`
- **NEVER**: Use `npm install`, `npm i`, `npm run`, `npm start`
- **Reason**: Project configured for yarn; npm can cause dependency conflicts
- **Global Installs**: Use `npm install -g` only for global tools (e.g., laravel-echo-server)
  - Example: `npm install -g laravel-echo-server`
  - But for project dependencies: `yarn add laravel-echo socket.io-client`
