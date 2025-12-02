# Feature: "Bisa Jual saat Stok Habis" (allow_sold_zero_stock)

## Deskripsi
Fitur ini memungkinkan pengaturan per-item apakah barang boleh dijual meskipun stok habis atau negatif. Setiap item barang memiliki checkbox "Bisa Jual saat Stok Habis" saat create/edit.

## Implementation Status

### ✅ Backend
1. **Migration**: `2025_12_02_150000_add_allow_sold_zero_stock_to_barang_table.php`
   - Menambah kolom `allow_sold_zero_stock` (boolean, default: false)
   - Comment: "Izinkan penjualan saat stok habis/nol"

2. **Model**: `Barang.php`
   - Field sudah di-cast ke boolean dalam `$casts`
   - Include `allow_sold_zero_stock` di select query pada:
     - `getBarangList()` - Untuk list barang di kasir
     - `searchBarang()` - Untuk search realtime di kasir

3. **Controller**: `BarangController.php`
   - `validateBarang()` method menangani field `allow_sold_zero_stock` sebagai optional boolean

### ✅ Frontend
1. **Types**: `resources/js/components/kasir/types.ts`
   - Menambah field `allow_sold_zero_stock?: boolean` pada interface `BarangItem`

2. **Kasir Component**: `resources/js/pages/Kasir/Index.tsx`
   - `handleSelectItemJual()` - Validasi stok sebelum menambah item:
     - Jika `stock <= 0` dan `allow_sold_zero_stock === false` → Show error alert
     - Jika `allow_sold_zero_stock === true` → Allow sale (tidak ada validasi)
   
   - Search Results Modal - Visual indicators:
     - Highlight items dengan stok habis yang tidak boleh dijual
     - Show badge merah "Stok Habis" untuk items yang disabled
     - Items disabled tidak clickable (opacity-50, cursor-not-allowed)
     - Stock display berwarna merah untuk items yang not allowed

## Database Schema
```sql
ALTER TABLE barang ADD COLUMN allow_sold_zero_stock BOOLEAN DEFAULT FALSE AFTER block_disc;
```

## API Response Format
Search/List endpoints sekarang return:
```json
{
  "id": "uuid",
  "sku": "string",
  "deskripsi": "string",
  "stock": number,
  "allow_sold_zero_stock": boolean,
  ...
}
```

## Kasir Workflow

### Without Stock Check
1. User scan/search barang
2. Jika `allow_sold_zero_stock === true`:
   - Item langsung bisa dijual
   - Tidak ada warning meski stok 0 atau negative
   - Backend `/reduce-stock` langsung process

### With Stock Check
1. User scan/search barang
2. Jika `stock <= 0` dan `allow_sold_zero_stock === false`:
   - Show alert: "Stok Habis - (deskripsi barang) tidak dapat dijual..."
   - Modal search: Item ditampilkan dengan badge "Stok Habis", disabled
   - User tidak bisa click item
3. Jika `stock > 0` atau `allow_sold_zero_stock === true`:
   - Item bisa dijual normal

## Admin Pages - Implementation Required
Need to add checkbox in Barang Create/Edit form:
- **Component**: `resources/js/pages/back/Barang/Create.tsx`
- **Field**: "Bisa Jual saat Stok Habis" (checkbox)
- **Property**: `allow_sold_zero_stock` (boolean)

## Testing Checklist

### Backend
- [ ] Run migration: `php artisan migrate`
- [ ] Verify column added: `DESCRIBE barang`
- [ ] Test API response includes `allow_sold_zero_stock` field
- [ ] Test create/update barang with field via controller validation

### Frontend
- [ ] Search results show stock status correctly
- [ ] Items with `allow_sold_zero_stock=false` and `stock=0` are disabled
- [ ] Items with `allow_sold_zero_stock=true` are always clickable
- [ ] Alert shown when trying to buy disabled items
- [ ] Red stock indicator for disabled items
- [ ] Badge "Stok Habis" appears only for disabled items

### Integration
- [ ] Admin form created with checkbox
- [ ] Barang created/updated with setting preserved
- [ ] Kasir respects setting on transaction
- [ ] Multiple items sold correctly with mixed settings
- [ ] Negative stock allowed when enabled

## Notes
- Default value is `false` (aman - tidak boleh dijual saat stok habis)
- Admin harus aktifkan per-item jika memerlukan penjualan saat stok habis
- Setting di-check di frontend (UX immediately) + bisa juga di backend untuk security
- Search modal shows visual feedback tanpa perlu loading/API call tambahan
- Stok realtime tetap diambil dari `barang_stock` table dengan GREATEST() function
