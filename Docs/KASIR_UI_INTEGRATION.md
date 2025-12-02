# Kasir UI Integration Guide - New Stock & Permission System

**This guide shows how to update the React Kasir component to use the new stock management endpoints.**

---

## Overview

The Kasir page needs to be updated to:
1. Check stock BEFORE adding item to cart
2. Reserve stock (not reduce) when item added
3. Release reserved items if cart is cancelled
4. Reduce stock only at final checkout

---

## File to Update

**`resources/js/pages/Kasir/Index.tsx`**

---

## Changes Required

### 1. Import New API Calls

Add these to your imports:

```typescript
// At top of file, with other imports
import axios from '@/lib/axios';

// New helper functions for stock management
const checkStockAvailability = async (barangId: string, qty: number) => {
  try {
    const response = await axios.post('/check-stock-availability', {
      barang_id: barangId,
      qty: qty,
    });
    return response.data;
  } catch (error) {
    console.error('Stock check failed:', error);
    throw error;
  }
};

const reserveStockItem = async (barangId: string, qty: number) => {
  try {
    const response = await axios.post('/reserve-stock-item', {
      barang_id: barangId,
      qty: qty,
    });
    return response.data;
  } catch (error) {
    console.error('Stock reserve failed:', error);
    throw error;
  }
};

const releaseReservedItems = async (items: any[]) => {
  try {
    const response = await axios.post('/release-reserved-items', {
      items: items,
    });
    return response.data;
  } catch (error) {
    console.error('Release reserved failed:', error);
    throw error;
  }
};
```

### 2. Update handleBarcodeScan Function

**OLD CODE (with race condition):**
```typescript
const handleBarcodeScan = async (barcode: string) => {
  try {
    const barang = await searchBarang(barcode);
    if (!barang) return showAlert('Barang tidak ditemukan');

    // ❌ OLD: Reduce stok immediately (WRONG!)
    const result = await axios.post('/reduce-stock', {
      barang_id: barang.id,
      qty: 1,
    });

    addToCart(barang);
  } catch (error) {
    showAlert('Error', error.message, 'error');
  }
};
```

**NEW CODE (safe with reserved stock):**
```typescript
const handleBarcodeScan = async (barcode: string) => {
  try {
    // Step 1: Find barang
    const barang = await searchBarang(barcode);
    if (!barang) {
      showAlert('Barang tidak ditemukan', '', 'warning');
      return;
    }

    // Step 2: CHECK stock availability BEFORE adding
    const stockCheck = await checkStockAvailability(barang.id, 1);
    
    if (!stockCheck.is_available) {
      showAlert(
        'Stok Tidak Cukup',
        `Available: ${stockCheck.available} pcs`,
        'warning'
      );
      return;
    }

    // Step 3: RESERVE stok (NOT reduce yet!)
    const reserved = await reserveStockItem(barang.id, 1);
    
    if (reserved.status !== 'ok') {
      showAlert('Error', 'Gagal reserve stok', 'error');
      return;
    }

    // Step 4: Add to local cart with reserved flag
    addToCart({
      ...barang,
      qty: 1,
      reserved: true,  // Mark as reserved
      available: reserved.data.available, // Show current available
    });

    // Optional: Show real-time stock indicator
    console.log(`✓ Reserved ${barang.deskripsi}`);
    console.log(`  Available now: ${reserved.data.available}`);

  } catch (error) {
    console.error('Error:', error);
    showAlert('Error', error.message, 'error');
  }
};
```

### 3. Update handleResetCart Function

**OLD CODE:**
```typescript
const handleResetCart = () => {
  // ❌ OLD: No release of reserved stock
  clearCart();
};
```

**NEW CODE (release reserved stock):**
```typescript
const handleResetCart = async () => {
  try {
    // Step 1: Collect items to release
    const itemsToRelease = items.map(item => ({
      barang_id: item.id,
      qty: item.qty,
    }));

    if (itemsToRelease.length > 0) {
      // Step 2: Release reserved stok
      const result = await releaseReservedItems(itemsToRelease);
      console.log(`✓ Released ${result.released_count} items`);
      
      if (result.errors.length > 0) {
        console.warn('Some items had errors:', result.errors);
      }
    }

    // Step 3: Clear local cart
    clearCart();
    
    showAlert('Cart reset', `${itemsToRelease.length} items released`, 'success');

  } catch (error) {
    console.error('Error resetting cart:', error);
    showAlert('Error', 'Gagal reset cart', 'error');
  }
};
```

### 4. Update Quantity Adjustment

When user changes qty in cart:

```typescript
const handleQtyChange = async (itemId: string, newQty: number) => {
  const item = items.find(i => i.id === itemId);
  if (!item) return;

  const oldQty = item.qty;
  const qtyDiff = newQty - oldQty;

  try {
    if (qtyDiff > 0) {
      // User increased qty - need to reserve MORE
      const check = await checkStockAvailability(itemId, qtyDiff);
      if (!check.is_available) {
        showAlert('Stok tidak cukup', 
          `Hanya tersedia: ${check.available} pcs`, 
          'warning');
        return;
      }

      // Reserve additional qty
      await reserveStockItem(itemId, qtyDiff);
      
    } else if (qtyDiff < 0) {
      // User decreased qty - release some
      await releaseReservedItems([{
        barang_id: itemId,
        qty: Math.abs(qtyDiff),
      }]);
    }

    // Update local cart
    updateCartItemQty(itemId, newQty);

  } catch (error) {
    showAlert('Error', error.message, 'error');
  }
};
```

### 5. Update Remove Item from Cart

```typescript
const handleRemoveItem = async (itemId: string) => {
  const item = items.find(i => i.id === itemId);
  if (!item) return;

  try {
    // Release the reserved stok for this item
    await releaseReservedItems([{
      barang_id: itemId,
      qty: item.qty,
    }]);

    // Remove from local cart
    removeFromCart(itemId);

  } catch (error) {
    console.warn('Error releasing stok:', error);
    // Still remove from cart even if release fails
    removeFromCart(itemId);
  }
};
```

### 6. Update Checkout/Payment

**Important:** The checkout flow now:
1. Send cart items to `/proses-bayar`
2. Backend automatically reduces stok & releases reserved
3. Frontend clears cart after success

**Code stays mostly the same, but add logging:**

```typescript
const handleCheckout = async () => {
  try {
    setIsLoading(true);
    setLoadingMessage('Processing payment...');

    // Prepare items for checkout
    const checkoutData = {
      items: items.map(item => ({
        id: item.id,
        sku: item.sku,
        qty: item.qty,
        harga: item.hargaJual,
        disc_spv: item.discSpv || 0,
        disc_promo: item.discPromo || 0,
      })),
      total: cartTotal,
      discSpv: totalDiscSpv,
      discPromo: totalDiscPromo,
      charge: totalCharge,
      bayar: totalBayar,
      typeId: paymentTypeId,
      state: paymentState, // 'full', 'piutang', 'komplemen'
    };

    // Submit to backend
    const response = await axios.post('/proses-bayar', checkoutData);

    if (response.data.status === 'ok') {
      // ✅ IMPORTANT: Backend already reduced stok & released reserved
      // Just clear local cart
      clearCart();
      
      showAlert('Success', 'Pembayaran berhasil', 'success');
      
      // Redirect to print
      if (response.data.trxId) {
        // Print bill...
      }
    }

  } catch (error) {
    showAlert('Error', error.response?.data?.msg || error.message, 'error');
  } finally {
    setIsLoading(false);
  }
};
```

---

## UI/UX Improvements

### 1. Show Real-Time Stock Indicator

```typescript
// Add to item row in cart table
<div className="flex items-center gap-2">
  <span>Stok: {item.available} pcs</span>
  {item.available < 5 && (
    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
      Limited
    </span>
  )}
</div>
```

### 2. Disable Add Button if Stock 0

```typescript
<button
  onClick={() => handleBarcodeScan(barcode)}
  disabled={isLoading || searchResults.some(item => item.available <= 0)}
  className="..."
>
  Add to Cart
</button>
```

### 3. Show Reserved Status

```typescript
// In cart table, show which items are reserved
{item.reserved && (
  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
    Reserved
  </span>
)}
```

### 4. Warning if Scanning After Some Time

```typescript
// If cart items older than 10 minutes, warn before checkout
const cartAgeMinutes = (new Date() - cartCreatedTime) / 60000;
if (cartAgeMinutes > 10) {
  showAlert(
    'Warning',
    'Cart items reserved 10+ minutes. Stock status may have changed.',
    'warning'
  );
}
```

---

## Testing the Integration

### Test 1: Basic Add & Remove

```
1. Scan item → Should call checkStockAvailability & reserveStockItem
2. Remove item → Should call releaseReservedItems
3. Cart should show "Reserved" badge
```

### Test 2: Concurrent Scanning

```
1. Open 2 Kasir pages
2. Both scan same item (stock: 2)
3. Kasir A: Add 1 → Reserve: OK, Available: 1
4. Kasir B: Add 1 → Reserve: OK, Available: 0
5. Kasir C: Try scan → Check: available=0, should show warning
```

### Test 3: Checkout

```
1. Add items → Reserved
2. Click Checkout
3. Payment success
4. Backend reduces stok & releases reserved
5. Cart cleared
6. Verify stock reduced in inventory
```

---

## Debugging Tips

### Enable Logging

```typescript
// Add to handleBarcodeScan
console.log('=== STOCK CHECK ===');
console.log('Barang:', barang);
console.log('Stock check response:', stockCheck);
console.log('Reserve response:', reserved);
console.log('Current available:', reserved.data.available);
```

### Check Network Requests

1. Open DevTools → Network tab
2. Look for requests to:
   - `/check-stock-availability`
   - `/reserve-stock-item`
   - `/release-reserved-items`
   - `/proses-bayar`
3. Verify response status & data

### Check Backend Logs

```bash
# Watch Laravel logs in real-time
tail -f storage/logs/laravel.log | grep -i stock

# Or check database
SELECT * FROM barang_stock_movements 
  WHERE created_at >= NOW() - INTERVAL 5 MINUTE;
```

---

## Summary of Changes

| Aspect | Old | New |
|--------|-----|-----|
| Stock check | ❌ None | ✅ Before add |
| Stock reduction | At scan | At checkout |
| Reserved tracking | ❌ None | ✅ Yes |
| Release on cancel | ❌ No | ✅ Yes |
| Race condition | ⚠️ Yes | ✅ Fixed |

---

## Common Errors & Solutions

### Error: "Gagal reserve stok"

**Cause**: Stock became unavailable between check & reserve  
**Solution**: Handled by frontend - show warning & don't add

### Error: "Release reserved failed"

**Cause**: Database error or connection issue  
**Solution**: Log the error but continue (reserved will auto-release on checkout)

### Error: "Payment success but stok not reduced"

**Cause**: `setTransaksiDetails()` not updated  
**Solution**: Verify KasirController has new stock reduction code

---

## Next Steps

1. Update all functions as shown above
2. Test with concurrent kasir scanning
3. Monitor backend logs for errors
4. Train operators on new flow
5. Go live! 🚀

---

**Questions?** Check `REALTIME_STOCK_FIX.md` for detailed API documentation.
