<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Kategori;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class KategoriTest extends TestCase
{
    use RefreshDatabase;

    protected User $supervisor;

    protected function setUp(): void
    {
        parent::setUp();
        $this->supervisor = User::factory()->create(['level' => 1]);
    }

    public function test_can_view_kategori_index(): void
    {
        $response = $this->actingAs($this->supervisor)
            ->get('/admin/kategori');

        $response->assertStatus(200);
    }

    public function test_can_create_kategori(): void
    {
        $response = $this->actingAs($this->supervisor)
            ->post('/admin/kategori', [
                'ket' => 'Makanan Minuman',
            ]);

        $response->assertStatus(302);
        $this->assertDatabaseHas('kategori', ['ket' => 'Makanan Minuman']);
    }

    public function test_kategori_ket_must_be_unique(): void
    {
        Kategori::factory()->create(['ket' => 'Elektronik']);

        $response = $this->actingAs($this->supervisor)
            ->post('/admin/kategori', [
                'ket' => 'Elektronik',
            ]);

        $response->assertSessionHasErrors();
    }

    public function test_can_view_kategori_create(): void
    {
        $response = $this->actingAs($this->supervisor)
            ->get('/admin/kategori/create');

        $response->assertStatus(200);
    }

    public function test_can_update_kategori(): void
    {
        $kategori = Kategori::factory()->create();

        $response = $this->actingAs($this->supervisor)
            ->patch("/admin/kategori/{$kategori->id}", [
                'ket' => 'Kategori Baru',
            ]);

        $response->assertStatus(302);
        $this->assertDatabaseHas('kategori', ['id' => $kategori->id, 'ket' => 'Kategori Baru']);
    }

    public function test_can_delete_empty_kategori(): void
    {
        $kategori = Kategori::factory()->create();

        $response = $this->actingAs($this->supervisor)
            ->delete("/admin/kategori/{$kategori->id}");

        $response->assertStatus(302);
        $this->assertDatabaseMissing('kategori', ['id' => $kategori->id]);
    }

    public function test_cannot_delete_kategori_with_barang(): void
    {
        $kategori = Kategori::factory()->create();
        \App\Models\Barang::factory()->create(['kategori_id' => $kategori->id]);

        $response = $this->actingAs($this->supervisor)
            ->delete("/admin/kategori/{$kategori->id}");

        $response->assertStatus(302);
        $response->assertSessionHas('error');
        $this->assertDatabaseHas('kategori', ['id' => $kategori->id]);
    }
}
