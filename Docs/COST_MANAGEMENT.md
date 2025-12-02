# Cost Management & Profit Analysis System

## Overview

This system provides comprehensive cost tracking, profit analysis, and margin reporting for retail operations. It uses the existing `harga_beli` (cost price) in the Barang table to calculate profitability metrics.

---

## Core Features

### 1. Daily Profit Breakdown

**Endpoint:** `GET /api/profit-analysis/daily?date=2024-12-02`

**Response:**
```json
{
  "status": "ok",
  "data": {
    "date": "2024-12-02",
    "summary": {
      "total_revenue": 5250000,
      "total_cogs": 3150000,
      "gross_profit": 2100000,
      "total_discount": 125000,
      "total_charge": 350000,
      "total_tax": 75000,
      "net_profit": 2400000,
      "gross_margin_pct": 40.0,
      "net_margin_pct": 45.71
    },
    "statistics": {
      "transaction_count": 156,
      "item_count": 487,
      "avg_transaction_value": 33654,
      "avg_item_price": 10772
    },
    "top_products": [
      {
        "sku": "001",
        "deskripsi": "Aqua 600ml",
        "qty": 120,
        "revenue": 540000,
        "cogs": 240000,
        "profit": 300000
      }
    ]
  }
}
```

**Metrics Calculated:**
- **COGS** (Cost of Goods Sold): `item_qty × harga_beli` per transaction detail
- **Gross Profit**: `Revenue - COGS`
- **Net Profit**: `Gross Profit - Discounts - Charges + Tax`
- **Gross Margin %**: `(Gross Profit / Revenue) × 100`
- **Net Margin %**: `(Net Profit / Revenue) × 100`

**Caching:** 3600 seconds per date (1 hour)

---

### 2. Profit Trend Analysis

**Endpoint:** `GET /api/profit-analysis/trend?start=2024-11-01&end=2024-12-02`

**Response:**
```json
{
  "status": "ok",
  "start_date": "2024-11-01",
  "end_date": "2024-12-02",
  "data": [
    {
      "date": "2024-11-01",
      "display_date": "01/11",
      "revenue": 4800000,
      "cogs": 2880000,
      "profit": 1920000,
      "margin_pct": 40.0
    },
    {
      "date": "2024-11-02",
      "display_date": "02/11",
      "revenue": 5100000,
      "cogs": 3060000,
      "profit": 2040000,
      "margin_pct": 40.0
    }
  ]
}
```

**Caching:** 1800 seconds per date range (30 minutes)

**Uses for:**
- 📊 Trend visualization in dashboard charts
- 📈 Identify peak/low profit days
- 🎯 Compare performance week-to-week
- 📉 Detect seasonal patterns

---

### 3. Product Profitability Ranking

**Endpoint:** `GET /api/profit-analysis/products?limit=20`

**Response:**
```json
{
  "status": "ok",
  "count": 20,
  "data": [
    {
      "sku": "001",
      "deskripsi": "Aqua 600ml",
      "harga_beli": 2000,
      "times_sold": 487,
      "total_qty": 540,
      "total_revenue": 1350000,
      "total_profit": 810000,
      "profit_margin_pct": 60.0,
      "avg_sale_price": 2500
    }
  ]
}
```

**Ranking by:**
- Total profit (descending)
- Helps identify best-selling, high-margin items
- Enables strategic product focusing

**Features:**
- ✅ All-time data (not limited to date range)
- ✅ Total qty, revenue, and profit per product
- ✅ Profit margin percentage per item
- ✅ Average sale price vs cost
- ✅ Times sold (frequency)

---

### 4. Single Product Margin

**Endpoint:** `GET /api/profit-analysis/product/{barangId}/margin`

**Response:**
```json
{
  "status": "ok",
  "data": {
    "sku": "001",
    "deskripsi": "Aqua 600ml",
    "harga_beli": 2000,
    "harga_jual": 2500,
    "profit_per_unit": 500,
    "margin_pct": 25.0,
    "margin_type": "good"
  }
}
```

**Margin Types:**
- `excellent` ≥ 30%
- `good` ≥ 20%
- `fair` ≥ 10%
- `low` < 10%

**Uses:**
- ✅ Pricing strategy analysis
- ✅ Identify low-margin products
- ✅ Quick margin lookup during inventory management

---

### 5. Inventory Value Metrics

**Endpoint:** `GET /api/profit-analysis/inventory-value`

**Response:**
```json
{
  "status": "ok",
  "data": {
    "cost_value": 52500000,
    "retail_value": 87500000,
    "potential_profit": 35000000,
    "markup_pct": 66.67,
    "total_items": 5420,
    "unique_items": 347
  }
}
```

**Metrics:**
- **Cost Value**: Total inventory worth at cost price
- **Retail Value**: Total inventory worth at retail price
- **Potential Profit**: Difference (if all sold at retail)
- **Markup %**: Markup percentage across all inventory
- **Total Items**: Total quantity in stock
- **Unique Items**: Number of different SKUs

**Caching:** 3600 seconds (1 hour)

**Uses:**
- 💰 Balance sheet valuation
- 🎯 Financial reporting
- 📊 Inventory health monitoring
- 💡 Understand markup consistency

---

## UI Dashboard

**Route:** `GET /profit-dashboard`

Displays:
1. Today's summary cards (Revenue, Profit, Margin)
2. 30-day profit trend chart
3. Top 10 products by profit
4. Inventory value metrics
5. Profitability indicators

---

## Data Model Flow

```
TransaksiDetail (sales line item)
    ├─ qty: quantity sold
    ├─ bayar: final amount paid (after discounts)
    ├─ barang_id: reference to product
    └─ Barang.harga_beli: cost price

Calculation:
    COGS per item = qty × harga_beli
    Profit per item = bayar - (qty × harga_beli)
    
Daily totals:
    Total Revenue = SUM(bayar) for all items
    Total COGS = SUM(qty × harga_beli) for all items
    Gross Profit = Total Revenue - Total COGS
    Net Profit = Gross Profit - Discounts - Charges + Tax
```

---

## Real-World Example

**Scenario:** Aqua 600ml bottle
- Cost Price (harga_beli): Rp 2,000
- Retail Price (harga_jual1): Rp 2,500
- Per-unit Margin: Rp 500 (25%)

**Daily Sales (30 units):**
- Revenue: 30 × 2,500 = Rp 75,000
- COGS: 30 × 2,000 = Rp 60,000
- Profit: Rp 15,000
- Margin: 20% (after discounts)

**Report Shows:**
- Product profitability: Ranked by total profit
- Margin analysis: 20-25% margin (excellent)
- Contribution to daily profit: Significant if high volume

---

## Usage in Reports & Dashboards

### Executive Dashboard
```typescript
// React example
const today = await axios.get('/api/profit-analysis/daily');
<StatCard
  title="Today's Net Profit"
  value={today.data.summary.net_profit}
  margin={today.data.summary.net_margin_pct}
/>
```

### Product Management
```typescript
// Check margin before adjusting pricing
const margin = await axios.get(`/api/profit-analysis/product/${barangId}/margin`);
if (margin.data.data.margin_type === 'low') {
  showWarning('Low margin product - consider increasing price');
}
```

### Inventory Valuation
```typescript
// Balance sheet preparation
const inventory = await axios.get('/api/profit-analysis/inventory-value');
balanceSheet.inventory_asset = inventory.data.data.cost_value;
```

### Sales Analysis
```typescript
// Identify top performers
const products = await axios.get('/api/profit-analysis/products?limit=10');
// Display top 10 by profit
```

---

## Cache Management

### Cache Keys
- `profit_analysis_{date}` - Daily analysis (3600 sec)
- `profit_trend_{start}_{end}` - Trend data (1800 sec)
- `inventory_value_total` - Inventory valuation (3600 sec)

### Manual Cache Invalidation
```php
// After stock adjustment or cost price change
ProfitAnalysisService::clearProfitCache('2024-12-02');

// Clear all profit caches
ProfitAnalysisService::clearProfitCache();
```

### Automatic Invalidation
Cache is cleared automatically when:
1. Stock is reduced (checkout)
2. Stock is reserved (reserved stock pattern)
3. Stock is adjusted (opname)

---

## Performance Considerations

### Query Optimization

**Daily Analysis:**
- Uses eager loading with `with(['details', 'details.barang'])`
- Single query to fetch all transactions + relationships
- Calculations in application (not database)

**Product Profitability:**
- Uses database aggregation (`SUM`, `COUNT`, `AVG`)
- Single query with `groupBy`
- Sorted in database (ORDER BY total_profit)

**Inventory Value:**
- Single query with `join` + aggregation
- Calculates all metrics in one pass

### Caching Strategy
- Daily analysis cached 1 hour (updated hourly)
- Trend data cached 30 minutes (less frequently changed)
- Inventory value cached 1 hour

### Scaling Tips
- For high transaction volume, consider hourly aggregation tables
- Create materialized views for common queries
- Archive old transactions (>6 months) to separate table

---

## API Reference

| Endpoint | Method | Parameters | Purpose |
|----------|--------|------------|---------|
| `/api/profit-analysis/daily` | GET | date (optional) | Daily profit breakdown |
| `/api/profit-analysis/trend` | GET | start, end (optional) | Trend over date range |
| `/api/profit-analysis/products` | GET | limit (default 20) | Top products by profit |
| `/api/profit-analysis/product/{id}/margin` | GET | none | Single product margin |
| `/api/profit-analysis/inventory-value` | GET | none | Total inventory value |
| `/profit-dashboard` | GET | none | UI dashboard page |

**All endpoints require:** `auth` middleware + `check.module:reports,view`

---

## Troubleshooting

### Problem: harga_beli is NULL
**Solution:** Ensure cost price is set during item creation
```php
// Migration or seeder
$barang->update(['harga_beli' => $costPrice]);
```

### Problem: Incorrect profit calculation
**Check:**
1. TransaksiDetail.bayar is populated correctly
2. Barang.harga_beli is set
3. Cache not stale: `cache()->forget("profit_analysis_*")`

### Problem: Slow dashboard load
**Solutions:**
1. Reduce date range for trend analysis
2. Reduce product limit (top N instead of all)
3. Add database indexes on:
   - `transaksi_dets.created_at`
   - `barang.harga_beli`

---

## Future Enhancements

- [ ] Cost price history tracking (BarangCostHistory table)
- [ ] Automatic cost price updates from purchase orders
- [ ] Variance analysis (actual vs budgeted profit)
- [ ] Product category profit breakdown
- [ ] Seasonal trend analysis
- [ ] Forecasting based on historical patterns
- [ ] Automated alerts for low-margin items
- [ ] Multi-warehouse profit comparison

---

## Summary

**What it does:**
- ✅ Calculates daily/period profit with cost accounting
- ✅ Identifies best & worst performing products
- ✅ Provides inventory valuation metrics
- ✅ Tracks margin trends over time
- ✅ Enables data-driven pricing decisions

**Key Metrics:**
- Revenue, COGS, Gross Profit, Net Profit
- Margin %: gross and net
- Product profitability ranking
- Inventory value and markup analysis

**Performance:**
- Cached queries (1-1.5 hour TTL)
- Database aggregation optimized
- Handles high transaction volume efficiently

