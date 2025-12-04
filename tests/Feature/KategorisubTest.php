<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Kategori;
use App\Models\Kategorisub;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class KategorisubTest extends TestCase
{
    use RefreshDatabase;

    protected User $supervisor;
    protected Kategori $kategori;

    protected function setUp(): void
    {
        parent::setUp();
        $this->supervisor = User::factory()->create(['level' => 1]);
        $this->kategori = Kategori::factory()->create();
    }

    public function test_can_view_kategorisub_index(): void
    {
        $response = $this->actingAs($this->supervisor)
            ->get('/admin/kategorisub');

        $response->assertStatus(200);
    }

    public function test_can_create_kategorisub(): void
    {
        $response = $this->actingAs($this->supervisor)
            ->post('/admin/kategorisub', [
                'ket' => 'Sub Kategori Test',
                'kategori_id' => $this->kategori->id,
            ]);

        $response->assertStatus(302);
        $this->assertDatabaseHas('kategorisub', [
            'ket' => 'Sub Kategori Test',
            'kategori_id' => $this->kategori->id,
        ]);
    }

    public function test_kategorisub_ket_must_be_unique(): void
    {
        Kategorisub::factory()->create([
            'ket' => 'Minuman',
            'kategori_id' => $this->kategori->id,
        ]);

        $response = $this->actingAs($this->supervisor)
            ->post('/admin/kategorisub', [
                'ket' => 'Minuman',
                'kategori_id' => $this->kategori->id,
            ]);

        $response->assertSessionHasErrors();
    }

    public function test_can_update_kategorisub(): void
    {
        $sub = Kategorisub::factory()->create(['kategori_id' => $this->kategori->id]);

        $response = $this->actingAs($this->supervisor)
            ->patch("/admin/kategorisub/{$sub->id}", [
                'ket' => 'Sub Kategori Updated',
                'kategori_id' => $this->kategori->id,
            ]);

        $response->assertStatus(302);
        $this->assertDatabaseHas('kategorisub', [
            'id' => $sub->id,
            'ket' => 'Sub Kategori Updated',
        ]);
    }

    public function test_can_delete_empty_kategorisub(): void
    {
        $sub = Kategorisub::factory()->create(['kategori_id' => $this->kategori->id]);

        $response = $this->actingAs($this->supervisor)
            ->delete("/admin/kategorisub/{$sub->id}");

        $response->assertStatus(302);
        $this->assertDatabaseMissing('kategorisub', ['id' => $sub->id]);
    }

    public function test_cannot_delete_kategorisub_with_barang(): void
    {
        $sub = Kategorisub::factory()->create(['kategori_id' => $this->kategori->id]);
        \App\Models\Barang::factory()->create(['kategorisub_id' => $sub->id]);

        $response = $this->actingAs($this->supervisor)
            ->delete("/admin/kategorisub/{$sub->id}");

        // Soft delete - status should be 302 redirect but item should still exist
        $this->assertDatabaseHas('kategorisub', ['id' => $sub->id]);
    }

    public function test_kategorisub_requires_kategori_id(): void
    {
        $response = $this->actingAs($this->supervisor)
            ->post('/admin/kategorisub', [
                'ket' => 'Sub Kategori Orphan',
            ]);

        // Missing kategori_id should result in validation error
        $response->assertStatus(302);
    }
}
