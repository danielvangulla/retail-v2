# Retail-FKJ Architecture (Updated: April 2026)

## Overview

**retail-v2** adalah rewrite modern dari sistem retail management berbasis:
- **Backend**: Laravel 12 + PHP 8.4
- **Frontend**: React 19 + Inertia.js v2 + TypeScript 5.7
- **Styling**: Tailwind CSS v4 (CSS-first, tidak pakai `tailwind.config.js`)
- **Auth**: Laravel Fortify v1.32
- **Build**: Vite + Yarn
- **Queue/Cache**: Redis + predis
- **WebSocket**: laravel-echo-server (Socket.io)
- **Print**: ESC/POS via mike42/escpos-php + charlieuki/receiptprinter
- **Type-safe Routes**: laravel/wayfinder (generate TS dari Laravel routes)

---

## Entry Points & User Flows

### 1. Kasir (Point of Sale)
- **Route**: `/home-space` → `FrontRetail\KasirController::index()`
- **Alias**: `/kasir` → same controller
- **Page**: `resources/js/pages/Kasir/Index.tsx`
- **Auth**: `auth` middleware + session-based

### 2. Admin Panel
- **Route**: `/admin/*` → `Admin\*Controller`
- **Auth**: `auth` + `admin` middleware (level ≤ 1)
- **SPV access**: `auth` + `supervisor` middleware (level ≤ 2)

### 3. Auth
- **Login**: `/login` → Fortify + `AuthCustom\CustomLoginController`
- **Page**: `resources/js/pages/auth/login.tsx`

---

## Directory Structure

```
app/
├── Events/                    # Broadcasting events
│   ├── ChangeStatusMeja       # Table status updates
│   ├── DashboardUpdated       # Dashboard realtime data
│   ├── SyncBarang             # Stock sync
│   ├── StockUpdated           # Stock change notifications
│   └── ...
├── Http/
│   ├── Controllers/
│   │   ├── Admin/             # Admin-only controllers (level 1)
│   │   │   ├── BarangController
│   │   │   ├── CostHistoryController
│   │   │   ├── DashboardController
│   │   │   ├── DataManagementController
│   │   │   ├── DatabaseMonitoringController
│   │   │   ├── KartuStokController
│   │   │   ├── KategoriController
│   │   │   ├── KategorisubController
│   │   │   ├── ModulePermissionController
│   │   │   ├── OpnameController
│   │   │   ├── PembelianController
│   │   │   ├── ProfitAnalysisController
│   │   │   ├── ReportController
│   │   │   ├── ReturController
│   │   │   ├── SetupController
│   │   │   ├── UserController
│   │   │   └── VoidController
│   │   ├── FrontRetail/       # Kasir / POS controllers
│   │   │   ├── BarangController  (search endpoint)
│   │   │   ├── KasirController   (main POS logic)
│   │   │   ├── KomplemenController
│   │   │   ├── ReportRetailController
│   │   │   └── ShiftController   (buka/tutup shift)
│   │   ├── Services/          # Queued printer jobs
│   │   │   ├── BasePrinter
│   │   │   ├── PrinterBillServices
│   │   │   ├── PrinterCOServices
│   │   │   ├── PrinterKomplemenServices
│   │   │   ├── PrinterPiutangServices
│   │   │   ├── PrinterSalesReportServices
│   │   │   └── PrinterShiftServices
│   │   └── AuthCustom/        # Custom login redirect logic
│   ├── Middleware/
│   │   ├── CheckAdminLevel    # Hanya level 1 (admin)
│   │   ├── CheckSupervisorLevel  # Level 1-2 (admin + spv)
│   │   ├── CheckModulePermission # Per-modul permissions
│   │   ├── EnsureDatabaseConnection
│   │   ├── HandleAppearance
│   │   └── HandleInertiaRequests
│   └── Requests/              # Form Request validation classes
├── Models/                    # 37+ Eloquent models
├── Services/
│   ├── DatabaseConnectionService
│   ├── ProfitAnalysisService
│   └── StokProcessingService
└── Traits/
    └── ManageStok             # Shared stock management logic
```

---

## Models Reference

| Model | Table | Deskripsi |
|-------|-------|-----------|
| Barang | barang | Produk/item inventory |
| BarangStock | barang_stock | Stok actual (qty, reserved) |
| BarangStockMovement | barang_stock_movements | History pergerakan stok |
| BarangCostHistory | barang_cost_history | History harga beli rata-rata |
| BarangPrice | barang_prices | Harga bertingkat per qty |
| BarangExpire | barang_expires | Tracking kadaluarsa |
| BarangRetur | barang_returs | Purchase returns header |
| BarangReturDetail | barang_retur_details | Purchase returns detail |
| Kategori | kategori | Kategori produk (field: `ket`) |
| Kategorisub | kategorisub | Sub-kategori produk (field: `ket`) |
| Transaksi | transaksis | Transaksi penjualan |
| TransaksiDetail | transaksi_dets | Detail line item transaksi |
| TransaksiPayment | transaksi_payments | Data pembayaran |
| TransaksiPaymentType | transaksi_payment_types | Tipe pembayaran |
| TransaksiVoid | transaksi_voids | Void transaction records |
| Pembelian | pembelians | Purchase order header |
| PembelianDet | pembelian_dets | Purchase order detail |
| Piutang | piutangs | Customer receivables |
| PiutangBayar | piutang_bayars | Receivable payments |
| Shift | shifts | Kasir shift records |
| Opname | opnames | Stock opname/audit |
| Meja | mejas | Table management (restoran) |
| Komplemen | komplementarys | Complementary items |
| Promo | promos | Promotional discounts |
| Discount | discounts | Discount rules |
| Setup | setups | System configuration |
| Printer | printers | Printer config |
| User | users | User accounts |
| UserPermission | user_permissions | Legacy per-modul permissions |
| UserModulePermission | user_module_permissions | Granular module permissions |

---

## Frontend Pages

### Kasir (POS)
- `pages/Kasir/Index.tsx` — Main kasir UI
- `pages/Kasir/PrintBill.tsx` — Bill cetak
- `pages/Kasir/PrintShift.tsx` — Shift report cetak

#### Kasir Components
- `components/CartTable.tsx` — Tabel cart
- `components/CartSummary.tsx` — Summary total
- `components/PaymentModal.tsx` — Modal pembayaran
- `components/PendingPaymentModal.tsx` — Transaksi pending
- `components/DiskonModal.tsx` — Input diskon
- `components/QtyEditModal.tsx` — Edit jumlah item
- `components/KomplemenModal.tsx` — Komplemen
- `components/CustomerSelect.tsx` — Pilih customer (piutang)
- `components/OpenShiftModal.tsx` — Buka shift
- `components/CloseShiftModal.tsx` — Tutup shift
- `components/ActionButtons.tsx` — Tombol aksi kasir
- `components/KasirMenuBar.tsx` — Menu bar kasir
- `components/AlertModal.tsx` — Custom alert dialog
- `components/ConfirmModal.tsx` — Konfirmasi dialog
- `components/LoadingModal.tsx` — Loading overlay
- `components/SessionExpiredModal.tsx` — Session expire alert

#### Kasir Hooks
- `hooks/useKasirKeyboard.ts` — Keyboard shortcut handler
- `hooks/useKasirCalculations.ts` — Kalkulasi total, diskon, dll

### Admin Panel
- `pages/admin/Dashboard.tsx` — Dashboard dengan realtime stats
- `pages/admin/Layout.tsx` — Admin layout dengan sidebar
- `pages/admin/ProfitDashboard.tsx` — Profit analysis dashboard
- `pages/admin/Barang/` — CRUD produk
- `pages/admin/Kategori/` — CRUD kategori
- `pages/admin/Kategorisub/` — CRUD sub-kategori
- `pages/admin/Pembelian/` — Purchase orders
- `pages/admin/Retur/` — Purchase returns
- `pages/admin/Opname/` — Stock audit
- `pages/admin/KartuStok/` — Stock card / riwayat stok
- `pages/admin/CostHistory/` — COGS average cost history
- `pages/admin/User/` — User management
- `pages/admin/Setup/` — System setup
- `pages/admin/Report/Sales.tsx` — Sales report
- `pages/admin/Report/Inventory.tsx` — Inventory report
- `pages/admin/Report/Pending.tsx` — Pending transactions report
- `pages/admin/Report/Void.tsx` — Void transactions report
- `pages/admin/DataManagement/` — Data recalculation tools
- `pages/admin/DatabaseMonitoring/` — DB connection monitoring

---

## Route Structure

| File | Prefix | Middleware | Description |
|------|--------|-----------|-------------|
| `routes/web.php` | `/` | - | Root, profile, settings |
| `routes/auth.php` | `/login`, `/register` | guest/auth | Fortify auth |
| `routes/retail.php` | `/home-space`, `/kasir`, etc. | `auth` | POS endpoints |
| `routes/admin.php` | `/admin/*` | `auth` + `admin`/`supervisor` | Admin panel |
| `routes/api.php` | `/api/*` | `auth` | API endpoints |
| `routes/settings.php` | `/settings/*` | `auth` | User settings |

---

## Critical Business Logic: Reserved Stock Pattern

### Konsep
- **Quantity**: Stok fisik di gudang
- **Reserved**: Barang di cart kasir (belum bayar)
- **Available** = Quantity - Reserved

### Flow Kasir
```
1. Scan/Cari Barang
   └─ POST /check-stock-availability → cek available
2. Tambah ke Cart
   └─ POST /reserve-stock-item → reserved += qty
3. Checkout (Bayar)
   └─ POST /proses-bayar → quantity -= qty, reserved -= qty
4. Cancel/Reset
   └─ POST /release-reserved-items → reserved -= qty
```

### Implementation
- Trait `ManageStok` dengan pessimistic locking (`lockForUpdate()`)
- DB transaction dengan 3-retry deadlock handling
- Cache invalidation otomatis saat stok berubah

---

## Shift Management

Fitur buka/tutup shift kasir:
- **Buka Shift**: `POST /shift/open` → `ShiftController::open()`
- **Tutup Shift**: `POST /shift/close` → `ShiftController::close()`
- **Cetak Shift**: `GET /print-shift/{shiftId}` → `ShiftController::print()`
- **DB**: Tabel `shifts` (migration: `2026_04_19_230226_create_shifts_table.php`)

---

## Void Transaction

Fitur untuk SPV/Admin membatalkan transaksi:
- **Route**: `POST /admin/void` (supervisor middleware)
- **Controller**: `Admin\VoidController::store()`
- **Laporan Void**: `GET /admin/report/void`

---

## Cost Management (COGS Perpetual)

Tracking harga beli rata-rata menggunakan metode perpetual:
- Tabel: `barang_cost_history`
- Service: `ProfitAnalysisService`
- Controller: `Admin\CostHistoryController`, `Admin\ProfitAnalysisController`
- Pages: `admin/CostHistory/`, `admin/ProfitDashboard.tsx`

---

## Role & Permission System

### User Level
- **Level 1**: Administrator — full access
- **Level 2**: Supervisor (SPV) — kasir + void + laporan void
- **Level 3**: Kasir — POS only

### Middleware
- `admin` → hanya level 1
- `supervisor` → level 1 dan 2
- `check.module` → granular per-modul permission

### Granular Permissions (UserModulePermission)
- Modul: `barang`, `pembelian`, `piutang`, `kasir`, `reports`, `settings`
- Tipe: `view`, `create`, `edit`, `delete`, `export`, `approve`, `manage_users`
- Time-based access: field `access_until`

---

## Real-Time (WebSocket)

- **Server**: laravel-echo-server (Redis-backed Socket.io)
- **Driver**: Redis broadcasting (`BROADCAST_DRIVER=redis`)
- **Frontend**: `laravel-echo` + `socket.io-client`
- **Hook**: `useDashboardRealtime.ts` — subscribe ke dashboard events
- **Events**: `DashboardUpdated`, `SyncBarang`, `StockUpdated`, `ChangeStatusMeja`

---

## Printing System

- **Library**: `mike42/escpos-php` + `charlieuki/receiptprinter`
- **Koneksi**: TCP/IP ke thermal printer (PRINTER_IP, PRINTER_PORT)
- **Queue**: Redis-backed jobs via `ShouldQueue`
- **Printer Jobs**:
  - `PrinterBillServices` — receipt kasir
  - `PrinterShiftServices` — laporan shift
  - `PrinterCOServices` — captain order
  - `PrinterKomplemenServices` — komplemen order
  - `PrinterPiutangServices` — nota piutang

---

## Key Environment Variables

```env
APP_TYPE=retail               # Wajib untuk load routes/retail.php
APP_URL=http://retail-fkj.test

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3307                  # Herd MySQL
DB_DATABASE=retail_fkj

BROADCAST_DRIVER=redis        # Untuk WebSocket
QUEUE_CONNECTION=redis        # Untuk print jobs
REDIS_HOST=127.0.0.1

PRINTER_IP=192.168.x.x
PRINTER_PORT=9100
```

---

## Development Commands

```bash
# Backend
php artisan serve
php artisan queue:work          # Jalankan print jobs
php artisan migrate

# Frontend
yarn dev                        # Vite dev server (port 5173)
yarn build                      # Production build

# Combined (Composer script)
composer run dev                # serve + queue:work + vite dev

# Testing
php artisan test
vendor/bin/pint --dirty         # Format PHP (wajib sebelum commit)
node_modules/.bin/tsc --noEmit  # TypeScript check

# Wayfinder (setelah route changes)
php artisan wayfinder:generate
```

---

## Known Limitations / TODO

1. **Inventory Report**: Field `stok` di laporan inventory tidak menampilkan stok real-time (memerlukan join dengan `barang_stock` table)
2. **Piutang management**: Controller ada tapi halaman admin belum lengkap
3. **WebSocket**: Butuh `laravel-echo-server` berjalan terpisah (`yarn ws` atau `pm2`)
