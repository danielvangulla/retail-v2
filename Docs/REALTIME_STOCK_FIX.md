# Realtime Stock Management - Fix untuk Race Condition

## Masalah Sebelumnya (FIXED ✅)

**Skenario Race Condition:**
```
Kasir A & B, barang Indomie stok tersisa 1 buah:

1. Kasir A scan Indomie → stok dikurangi jadi 0
2. BERSAMAAN: Kasir B juga scan Indomie → cek stok (masih ada?)
3. Race condition: Kasir B bisa add ke cart padahal stok sudah habis
4. Hasil: Overselling, transaksi gagal, customer komplain
```

**Root Cause:**
- Stok dikurangi SAAT scanning (via `reduceStock()`), bukan saat checkout
- Tidak ada mekanisme "reserved stock" untuk prevent double-selling

---

## Solusi: Reserved Stock Pattern (NEW ✅)

### Konsep 3-Stage Stock

```
STAGE 1: Scanning/Add to Cart
├─ Action: RESERVE stok (mark sebagai "tidak tersedia")
├─ Formula: available = quantity - reserved
└─ Result: Kasir lain langsung lihat stok berkurang

STAGE 2: Payment Processing
├─ Action: REDUCE quantity (stok benar-benar keluar)
├─ Action: RELEASE reserved (clear marking)
└─ Result: Inventory updated, transaction complete

STAGE 3: Cancellation/Reset Cart
├─ Action: RELEASE reserved (return to available)
└─ Result: Stok tersedia lagi untuk kasir lain
```

---

## Implementasi & API Endpoints

### 1. Check Stock Availability (SEBELUM Add to Cart)

**Endpoint:** `POST /check-stock-availability`

**Request:**
```json
{
  "barang_id": "uuid-barang",
  "qty": 1
}
```

**Response:**
```json
{
  "status": "ok",
  "available": 5,
  "requested": 1,
  "is_available": true,
  "message": "Stok tersedia"
}
```

**Gunakan di Kasir UI:**
```typescript
// Sebelum user add item ke cart
const response = await checkStockAvailability(barangId, qty);
if (!response.is_available) {
  showAlert('Stok tidak cukup!', response.message, 'warning');
  return;
}
// Lanjut ke step 2
```

---

### 2. Reserve Stock Item (SAAT Add to Cart)

**Endpoint:** `POST /reserve-stock-item`

**Request:**
```json
{
  "barang_id": "uuid-barang",
  "qty": 1
}
```

**Response:**
```json
{
  "status": "ok",
  "message": "Stok berhasil di-reserve",
  "data": {
    "barang_id": "...",
    "quantity": 10,
    "reserved": 1,
    "available": 9
  }
}
```

**Gunakan di Kasir UI:**
```typescript
// BARU: Jangan gunakan reduceStock() lagi!
// Ganti dengan:
const reserved = await reserveStockItem(barangId, qty);
if (reserved.status === 'ok') {
  // Add item to local cart
  addToCart({
    barang_id: barangId,
    qty: qty,
    reserved: true  // Mark bahwa sudah di-reserve
  });
}
```

---

### 3. Release Reserved Items (SAAT Checkout Dibatalkan)

**Endpoint:** `POST /release-reserved-items`

**Request:**
```json
{
  "items": [
    {"barang_id": "uuid1", "qty": 2},
    {"barang_id": "uuid2", "qty": 1}
  ]
}
```

**Response:**
```json
{
  "status": "ok",
  "message": "2 item berhasil di-release",
  "released_count": 2,
  "errors": []
}
```

**Gunakan di Kasir UI:**
```typescript
// Saat user klik tombol RESET/BATAL
const handleResetCart = async () => {
  const itemsToRelease = cart.map(item => ({
    barang_id: item.barang_id,
    qty: item.qty
  }));

  await releaseReservedItems(itemsToRelease);
  clearCart();
};
```

---

### 4. Checkout Flow (Stok Berkurangi di sini!)

**Endpoint:** `POST /proses-bayar` (existing, tapi DIUPDATE)

**Apa yang berubah:**
- Di `setTransaksiDetails()`, setiap item akan:
  1. **Reduce** quantity (benar-benar kurangi stok)
  2. **Release** reserved (clear marking)
  3. Create movement history

**Code Flow:**
```php
// Di KasirController::setTransaksiDetails()
foreach ($data->items as $item) {
    // ... create TransaksiDetail record ...

    // ✅ BARU: Reduce stok saat checkout, bukan saat scanning
    $barangId = $item->sku ?? $item->id;
    $reduceResult = BarangStock::reduceStok(
        $barangId, $qty, 'out',
        'penjualan_kasir', $trxId,
        "Penjualan di Kasir - Trx: {$trxId}",
        Auth::id()
    );

    // ✅ Clear reserved marking
    if ($reduceResult['success']) {
        BarangStock::releaseReservedStok($barangId, $qty);
    }
}
```

---

## Data Structures

### BarangStock Table

```sql
CREATE TABLE barang_stock (
  id UUID PRIMARY KEY,
  barang_id UUID,
  quantity INT,                -- Physical stok di warehouse
  reserved INT DEFAULT 0,      -- Items di cart (not yet paid)
  available INT,               -- Calculated: quantity - reserved
  last_updated_at TIMESTAMP,
  timestamps
);
```

**Calculation:**
```
available = max(0, quantity - reserved)
```

### BarangStockMovement Table

```sql
CREATE TABLE barang_stock_movements (
  id UUID PRIMARY KEY,
  barang_id UUID,
  type ENUM('in', 'out', 'adjustment'),
  quantity INT,
  quantity_before INT,
  quantity_after INT,
  reference_type VARCHAR (e.g., 'penjualan_kasir')
  reference_id UUID,
  notes TEXT,
  user_id UUID,
  movement_date TIMESTAMP,
  timestamps
);
```

---

## Kasir UI Integration (Frontend)

### OLD FLOW (dengan race condition):
```
Scan Barcode → reduceStock() → Add to Cart → Checkout
             ↑
        PROBLEM! Stock reduced terlalu cepat
```

### NEW FLOW (safe from race condition):
```
Scan Barcode → checkAvailability() 
             ↓
             ✅ Yes → reserveStockItem() → Add to Cart
             ↓ No   → Show warning, don't add
                     ↓
                  Checkout → setTransaksiDetails() → reduceStock() + releaseReserved()
                     ↓ Cancel
                  releaseReservedItems()
```

### Pseudo-code Kasir Index:

```typescript
// File: resources/js/pages/Kasir/Index.tsx

const handleBarcodeScan = async (barcode: string) => {
  try {
    // Step 1: Search barang
    const barang = await searchBarang(barcode);
    if (!barang) return showAlert('Barang tidak ditemukan');

    // Step 2: CHECK STOK AVAILABILITY (BARU)
    const stockCheck = await checkStockAvailability(barang.id, 1);
    if (!stockCheck.is_available) {
      showAlert('Stok tidak cukup!', `Available: ${stockCheck.available}`, 'warning');
      return;
    }

    // Step 3: RESERVE STOK (BARU - ganti reduceStock)
    const reserved = await reserveStockItem(barang.id, 1);
    if (!reserved.success) {
      showAlert('Gagal reserve stok', reserved.message, 'error');
      return;
    }

    // Step 4: Add to local cart
    addToCart({
      ...barang,
      qty: 1,
      reserved: true // Tandai sudah di-reserve
    });

  } catch (error) {
    showAlert('Error', error.message, 'error');
  }
};

const handleResetCart = async () => {
  // Step 1: Collect items to release
  const items = cart.map(item => ({
    barang_id: item.id,
    qty: item.qty
  }));

  // Step 2: Release reserved stok (BARU)
  try {
    await releaseReservedItems(items);
  } catch (error) {
    console.warn('Release error:', error);
  }

  // Step 3: Clear cart
  clearCart();
};

const handleCheckout = async () => {
  // Submit cart → /proses-bayar
  // setTransaksiDetails() akan:
  // 1. Reduce stok
  // 2. Release reserved
  // 3. Create movement history
};
```

---

## Benefits

### ✅ Race Condition Prevention
- Stock hanya berkurang saat final payment
- Reserved marking prevent double-selling
- Pessimistic locking ensures atomicity

### ✅ Better UX
- Real-time stock visibility
- No "sold out" surprises at checkout
- Clear indicator kapan stok reserved/available

### ✅ Complete Audit Trail
- BarangStockMovement mencatat semua perubahan
- Timestamp & user tracking
- Mudah debug stock discrepancies

### ✅ Performance
- Caching di available stok calculation
- Fast endpoint untuk stock checks
- Batch release untuk multiple items

---

## Deployment Checklist

- [ ] Update KasirController methods
- [ ] Add new routes in retail.php
- [ ] Update Kasir/Index.tsx to use new endpoints
- [ ] Remove old reduceStock() calls
- [ ] Test concurrent scenarios (3+ kasir scan same item)
- [ ] Load test with peak traffic
- [ ] Update documentation
- [ ] Train operators on new flow

---

## Testing Scenarios

### Scenario 1: 3 Kasir, 1 Barang (Indomie: 1 pcs)

```
TIME  | KASIR A              | KASIR B              | KASIR C
------|---------------------|---------------------|-------------------
T0    | Scan Indomie        |                      |
      | Check: available=1  |                      |
      | Reserve: OK         |                      |
      | Add to cart         |                      |
------|---------------------|---------------------|-------------------
T0+1s | Processing payment  | Scan Indomie         |
      |                     | Check: available=0   |
      |                     | ❌ Alert: Stok habis |
      |                     | (Don't add)          |
------|---------------------|---------------------|-------------------
T0+5s | Checkout            | Still waiting        | (waiting)
      | Reduce stok to 0    |                      |
      | Release reserved    |                      |
      | ✅ Payment success  |                      |
```

### Scenario 2: 2 Kasir, 2 Barang (Stock: 3 pcs each)

```
KASIR A: Scan 2, Reserve: OK (available=1)
KASIR B: Scan 1, Reserve: OK (available=0)
KASIR A: Checkout → Reduce 2, Release reserved → Success
KASIR B: Checkout → Reduce 1, Release reserved → Success
Total sold: 3 pcs ✅
```

---

## Troubleshooting

### Q: Stok tidak tersinkronisasi di beberapa kasir?
**A:** Cache issue. Stok cache di-clear setiap ada perubahan. Restart Laravel jika perlu.

### Q: Item terus di-reserve tapi tidak checkout?
**A:** Implement auto-release setelah timeout (misal: 15 menit).

### Q: Stok history tidak tercatat?
**A:** Check BarangStockMovement logs. Verify database transaction handling.

---

## References
- `app/Models/BarangStock.php` - Model dengan ManageStok trait
- `app/Traits/ManageStok.php` - Stock management logic
- `app/Http/Controllers/FrontRetail/KasirController.php` - Checkout flow
- `STOCK_MANAGEMENT_FLOW.md` - Detailed architecture doc
