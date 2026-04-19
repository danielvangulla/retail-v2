# Stock Management Flow - Retail V2

## Problem: Concurrent Stock Management

### Current Implementation (PROBLEMATIC)
```
Saat barang di-scan (selectItemJual):
1. Langsung reduce stok di database
2. Update UI dengan stok terbaru
3. Masalah: Race condition jika 3 kasir scan barang sama bersamaan
```

### Better Solution: Reserved Stock System

Stock punya 3 state:
- **Quantity**: Total stok fisik di gudang
- **Reserved**: Barang di cart kasir (belum bayar)
- **Available**: Available = Quantity - Reserved

**Formula:**
```
Available = Quantity - Reserved

Contoh:
Indomie: Quantity=10, Reserved=6 → Available=4
```

## Implementation Strategy

### 1. Scanner Behavior (selectItemJual)
```
BUKAN reduce stok langsung!

Saat Kasir scan barang:
1. Check available stok di database
2. Jika available > 0:
   - Add ke local cart (di memory kasir)
   - Tandai di server: "Reserved" untuk kasir ini
3. Jika available ≤ 0:
   - Show alert "Stok tidak tersedia"
   - Tidak add ke cart

Benefit:
- Stok tidak langsung berkurang
- Kasir lain bisa lihat stok tersedia yang real
- Bisa adjust qty di cart sebelum bayar
```

### 2. Payment Processing (proses-bayar)
```
Saat bayar:
1. Final check: available stok >= qty di cart
2. Reduce stok untuk SETIAP item:
   - quantity -= qty
   - reserved -= qty (karena sudah bayar, toh)
3. Create TransaksiDetail records
4. Clear reservation dari session/server

Benefit:
- Stok hanya berkurang saat BAYAR (confirm)
- Data akurat dan konsisten
- Bisa undo jika bayar gagal
```

### 3. Cancel/Reset Cart (resetAll)
```
Saat kasir cancel/reset:
1. Release reserved stok:
   - reserved -= qty di cart kasir ini
2. Clear cart
3. Available stok kembali normal

Benefit:
- Stok available langsung naik
- Kasir lain bisa langsung scan barang
```

### 4. Backend Architecture

**BarangStock table:**
```
id | barang_id | quantity | reserved
1  | barang-1  | 10       | 6
```

**Reserve/Release Operations:**
```
POST /reserve-stock
- kasir_id, barang_id, qty
- Add to reserved
- Create reservation record (untuk undo jika perlu)
- Return available stok

POST /release-reserved-stock
- kasir_id, barang_id
- Remove from reserved
- Delete reservation record
- Return available stok

POST /proses-bayar (existing)
- Reduce quantity untuk setiap item
- Auto-reduce reserved (atau zero out)
```

## Database Changes

### New Table: `kasir_reservations`
```sql
CREATE TABLE kasir_reservations (
    id UUID PRIMARY KEY,
    kasir_id UUID,
    barang_id UUID,
    qty INT,
    session_id VARCHAR(255),
    created_at TIMESTAMP,
    expires_at TIMESTAMP, -- auto-expire setelah 30 min
    KEY (kasir_id, barang_id),
    KEY (expires_at)
);
```

### Existing Table: `barang_stock`
```sql
-- Sudah ada:
id, barang_id, quantity, reserved, available
```

## UI/UX Changes

### Search Results Table
```
Show: [Barcode] [Deskripsi] [Satuan] [Available Stok] [Harga]

- Available = Quantity - Reserved (dari database, real-time)
- Jika available ≤ 0: Disabled, Red color, "Stok Habis"
- Jika available > 0: Enabled, Green color, "5 tersedia"
```

### Cart Items
```
Setiap item di cart punya:
- Name, Price, Qty (editable)
- Info: "5 dari 10 stok tersedia"
- Delete button
- Saat qty di-edit:
  - Validasi: qty <= available + qty di cart ini
  - Jika mau nambah qty dari 2 ke 5:
    - Need 3 lebih
    - Check: available >= 3?
    - If yes: update reservation
    - If no: show error "Hanya bisa add 3 lagi"
```

## Example Flow

### Scenario: 3 Kasir, 1 Barang (Indomie: 10)

```
T1: Kasir 1 buka kasir page
    → Download barang list
    → Lihat Indomie: Available=10

T2: Kasir 2 buka kasir page
    → Download barang list
    → Lihat Indomie: Available=10

T3: Kasir 3 buka kasir page
    → Download barang list
    → Lihat Indomie: Available=10

T4: Kasir 1 scan Indomie qty=1
    → Call POST /reserve-stock {barang_id, qty:1}
    → Backend: reserved=1, available=9
    → Return: available=9
    → Add to cart
    → UI update: Indomie show "available: 9"

T5: Kasir 2 scan Indomie qty=5 BERSAMAAN
    → Call POST /reserve-stock {barang_id, qty:5}
    → Backend: reserved=6, available=4
    → Return: available=4
    → Add to cart
    → UI update: Indomie show "available: 4"

T6: Kasir 3 scan Indomie qty=7
    → Call POST /reserve-stock {barang_id, qty:7}
    → Backend check: available=4 < requested=7
    → Return: error "Hanya 4 tersedia"
    → Show alert "Hanya 4 unit tersedia"
    → NOT add to cart

T7: Kasir 1 proses bayar qty=1
    → Call POST /proses-bayar {items: [{id, qty:1}]}
    → Backend:
      - quantity: 10 → 9
      - reserved: 6 → 5 (karena Kasir1 bayar, reserved-=1)
      - available: 9 - 5 = 4
    → Create TransaksiDetail qty=1
    → Return: success
    → Reset cart

T8: Kasir 2 dapat notif bahwa stok berkurang
    → Option A: Auto-refresh (WebSocket/polling)
    → Option B: Show banner "Stok diperbarui, refresh?"
    → After refresh: see available=4 (updated)

T9: Kasir 2 bayar qty=5
    → Check: available=4 >= qty=5? NO
    → Show error "Stok berkurang, hanya 4 tersedia"
    → Ask: "Kurangi qty menjadi 4?" or "Cancel?"

T10: Kasir 3 scan Indomie qty=4
    → Call POST /reserve-stock {qty:4}
    → Backend: available=4
    → Success
    → Add to cart
```

## Implementation Roadmap

1. **Create Migration**: `kasir_reservations` table
2. **Update Models**: Add methods `reserveStok()`, `releaseReservedStok()`
3. **Create API Endpoints**:
   - `POST /reserve-stock` (new)
   - `POST /release-reserved-stock` (new)
   - Update `POST /proses-bayar` logic
4. **Update Frontend**:
   - Change `selectItemJual` to call `/reserve-stock` instead of `/reduce-stock`
   - Add `releaseReservedStok` saat reset cart
   - Real-time stok update via WebSocket (already setup)
5. **Add Auto-expire**: Cron job untuk release reservation yg expired > 30 min

## Benefits

✅ Stok real-time dan akurat  
✅ Tidak ada over-selling (stok minus)  
✅ Kasir bisa adjust qty sebelum bayar  
✅ Support multiple concurrent users  
✅ Reservation auto-expire jika tidak bayar  
✅ Easy undo/cancel  
