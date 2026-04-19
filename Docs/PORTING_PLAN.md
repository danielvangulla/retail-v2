# Porting Plan: retail -> retail-v2

Tujuan: rewrite aplikasi `retail` ke stack baru di `retail-v2`.
Semua perubahan kode akan dilakukan hanya di direktori `retail-v2/`.

## Ringkasan
- Source app: root (`/home/apps/retail`) — Laravel 10 + Blade/jQuery + laravel-echo-server + sanctum.
- Target app: `retail-v2/` — Laravel (Fortify + Inertia) + Inertia/React + Vite + TypeScript.

## Scope porting (prioritas)
1. Backend domain (Models, Migrations) — menjaga struktur DB dan relasi.
2. Backend services (Printer, Helpers, Events, Listeners, Sync) — business logic tetap di PHP.
3. Routes & Controllers (API + Inertia endpoints).
4. Auth & Permissions (sesuaikan Fortify + spatie/permission middleware).
5. Broadcasting & Queue (config broadcast/echo, queue drivers).
6. Frontend: Migrasi Blade views ke Inertia/React pages (prioritaskan kasir `home-space`).

## Inventaris file (utama)

### Models (copy ke `retail-v2/app/Models/`)
- app/Models/Barang.php
- app/Models/BarangPrice.php
- app/Models/BarangExpire.php
- app/Models/BarangExpireDetail.php
- app/Models/BarangExt.php
- app/Models/BarangRetur.php
- app/Models/BarangReturDetail.php
- app/Models/Cashflow.php
- app/Models/Discount.php
- app/Models/Job.php
- app/Models/Kategori.php
- app/Models/Kategorisub.php
- app/Models/Komplemen.php
- app/Models/Meja.php
- app/Models/Opname.php
- app/Models/Pembelian.php
- app/Models/PembelianDet.php
- app/Models/Piutang.php
- app/Models/PiutangBayar.php
- app/Models/Promo.php
- app/Models/Printer.php
- app/Models/Setup.php
- app/Models/Transaksi.php
- app/Models/TransaksiDetail.php
- app/Models/TransaksiPayment.php
- app/Models/TransaksiPaymentType.php
- app/Models/TransaksiVoid.php
- app/Models/User.php
- app/Models/UserPermission.php
- app/Models/Log* (LogLogin, LogMenu, LogTable)

### Controllers (prioritas backend services & API)
- app/Http/Controllers/Back/* (BarangController, CashflowController, PromoController, KategoriController, KategorisubController, OpnameController, PembelianController, PiutangController, PiutangBayarController, ReturController, UserPermissionController)
- app/Http/Controllers/FrontRetail/* (KasirController, ReportRetailController)
- app/Http/Controllers/Front/* (HomeSpaceController, OrderController, BillController, TableController, ShiftController, PaymentController, PaymentKomplemenController, PaymentPiutangController, DiscountController, ReportController)
- app/Http/Controllers/Services/* (Printer services: PrinterBillServices, PrinterCOServices, PrinterPiutangServices, PrinterShiftServices, PrinterKomplemenServices)
- app/Http/Controllers/Ai/OpenAiController.php
- app/Http/Controllers/AuthCustom/CustomLoginController.php

### Events & Listeners
- app/Events/* (BarangCreated, ChangeStatusMeja, ChangeStatusMejaAll, OmsetCode, ShowNotification, SyncBarang, UpdateTime)
- app/Listeners/* (BarangCacheListener.php and others)

### Routes
- routes/retail.php (mapping route -> controller)
- routes/resto.php
- routes/web.php (profile/settings)
- routes/api.php (sync)

### Config & env variables (harus ditetapkan di `retail-v2/.env`)
- BROADCAST_DRIVER, ECHO server config (laravel-echo-server/socket.io)
- QUEUE_CONNECTION
- PRINTER_* (jika ada path atau port)
- OPENAI_API_KEY
- DB_* (database)

## Mapping teknis & catatan
- Auth: lama pakai custom controllers + `sanctum`; `retail-v2` pakai Fortify.
  - Strategy: keep `CustomLoginController` logic but wire into Fortify's redirect/guard OR expose legacy login route that uses existing controller.
- Views: Blade -> Inertia/React. Mulai dari `home-space` (Kasir) sebagai MVP.
- Broadcasting: server-side event broadcasting tetap, client-side adapt ke `laravel-echo` di React.
- Printing: services remain on server; pastikan dependency `mike42/escpos-php` dan `charlieuki/receiptprinter` di `retail-v2/composer.json` (if desired) — otherwise add them.

## Rencana kerja (implementasi bertahap)
1. Copy Models + Migrations. Run `composer dump-autoload` & migrate on dev env.
2. Copy Services (Printer, Helpers) and test via small controller route.
3. Copy Events/Listeners and wire providers (`EventServiceProvider`) in `retail-v2`.
4. Copy backend controllers for API and admin pages; expose routes in `retail-v2/routes/` (feature-flag by APP_TYPE if wanted).
5. Configure Fortify + spatie/permission to match middleware used in original app.
6. Implement client-side Echo initialization in `retail-v2/resources/js` and replicate simple real-time flows (status-meja).
7. Port the `home-space` page to Inertia/React and run smoke test of checkout -> print flow.

## Checklist for developer (this document)
- [ ] Copy Models
- [ ] Copy Services
- [ ] Copy Events & Listeners
- [ ] Copy Controllers (backend)
- [ ] Add/adjust `retail-v2/config/broadcasting.php` and `queue.php`
- [ ] Wire Fortify + spatie/permission
- [ ] Port `home-space` to Inertia/React
- [ ] Test printing & broadcasting flows
- [ ] Update `retail-v2/README.md` with run instructions and env notes

## Estimasi waktu & prioritas
- Backend core (models+services+controllers minimal): 1-2 days
- Frontend port `home-space` (kasir): 2-4 days (bergantung interaksi UX complexity)

---
Generated by automated analysis script. Lanjutkan langkah porting berikutnya: copy Models dan Services ke `retail-v2/app/`.
