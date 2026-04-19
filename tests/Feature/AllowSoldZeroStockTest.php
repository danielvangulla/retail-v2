<?php

namespace Tests\Feature;

use App\Models\Barang;
use App\Models\BarangStock;
use App\Traits\ManageStok;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AllowSoldZeroStockTest extends TestCase
{
    use RefreshDatabase;

    protected Barang $allowZeroBarang;
    protected Barang $disallowZeroBarang;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create barang dengan allow_sold_zero_stock = true
        $this->allowZeroBarang = Barang::factory()->create([
            'allow_sold_zero_stock' => true,
        ]);
        BarangStock::create([
            'barang_id' => $this->allowZeroBarang->id,
            'quantity' => 0,
            'reserved' => 0,
            'available' => 0,
        ]);

        // Create barang dengan allow_sold_zero_stock = false
        $this->disallowZeroBarang = Barang::factory()->create([
            'allow_sold_zero_stock' => false,
        ]);
        BarangStock::create([
            'barang_id' => $this->disallowZeroBarang->id,
            'quantity' => 0,
            'reserved' => 0,
            'available' => 0,
        ]);
    }

    public function test_can_sell_barang_with_zero_stock_when_allowed(): void
    {
        $result = ManageStok::reduceStok(
            $this->allowZeroBarang->id,
            5,
            'out',
            'penjualan',
            '1',
            'Test sale with allow_sold_zero_stock=true'
        );

        $this->assertTrue($result['success']);
        $this->assertStringContainsString('berhasil', strtolower($result['message']));
    }

    public function test_cannot_sell_barang_with_zero_stock_when_disallowed(): void
    {
        $result = ManageStok::reduceStok(
            $this->disallowZeroBarang->id,
            5,
            'out',
            'penjualan',
            '1',
            'Test sale with allow_sold_zero_stock=false'
        );

        $this->assertFalse($result['success']);
        $this->assertStringContainsString('tidak mencukupi', strtolower($result['message']));
    }

    public function test_search_barang_includes_allow_sold_zero_stock_flag(): void
    {
        // Skip untuk SQLite yang tidak support GREATEST
        if (config('database.default') === 'sqlite') {
            $this->markTestSkipped('SQLite does not support GREATEST function');
        }

        $results = Barang::searchBarang($this->allowZeroBarang->sku);

        $this->assertCount(1, $results);
        $this->assertNotNull($results[0]->allow_sold_zero_stock);
        $this->assertTrue($results[0]->allow_sold_zero_stock);
    }

    public function test_barang_list_includes_allow_sold_zero_stock_flag(): void
    {
        // Skip untuk SQLite yang tidak support GREATEST
        if (config('database.default') === 'sqlite') {
            $this->markTestSkipped('SQLite does not support GREATEST function');
        }

        $results = Barang::getBarangList();

        $allowZeroFound = $results->firstWhere('id', $this->allowZeroBarang->id);
        $this->assertNotNull($allowZeroFound);
        $this->assertTrue($allowZeroFound->allow_sold_zero_stock);

        $disallowZeroFound = $results->firstWhere('id', $this->disallowZeroBarang->id);
        $this->assertNotNull($disallowZeroFound);
        $this->assertFalse($disallowZeroFound->allow_sold_zero_stock);
    }

    public function test_can_reserve_stock_when_zero_stock_allowed(): void
    {
        // Reserve stok ketika allow_sold_zero_stock=true dan available=0
        $result = ManageStok::reserveStok(
            $this->allowZeroBarang->id,
            5,
            'order-123',
            true  // Pass allow_sold_zero_stock flag
        );

        $this->assertTrue($result['success']);
        $stock = BarangStock::where('barang_id', $this->allowZeroBarang->id)->first();
        $this->assertEquals(5, $stock->reserved);
    }

    public function test_cannot_reserve_stock_when_zero_stock_disallowed(): void
    {
        // Cannot reserve stok ketika allow_sold_zero_stock=false dan available=0
        $result = ManageStok::reserveStok(
            $this->disallowZeroBarang->id,
            5,
            'order-123',
            false  // Pass allow_sold_zero_stock flag
        );

        $this->assertFalse($result['success']);
        $stock = BarangStock::where('barang_id', $this->disallowZeroBarang->id)->first();
        $this->assertEquals(0, $stock->reserved);
    }
}
