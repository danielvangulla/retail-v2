<?php

namespace Tests\Feature;

use App\Models\User;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    protected User $supervisor;

    protected function setUp(): void
    {
        parent::setUp();
        $this->supervisor = User::factory()->create(['level' => 1]);
    }

    public function test_can_access_dashboard_as_supervisor(): void
    {
        $response = $this->actingAs($this->supervisor)
            ->get('/admin/dashboard');

        $response->assertStatus(200);
        $response->assertSee('Dashboard');
    }

    public function test_guest_redirected_to_login(): void
    {
        $response = $this->get('/admin/dashboard');

        $response->assertRedirect(route('login'));
    }

    public function test_can_access_barang_index(): void
    {
        $response = $this->actingAs($this->supervisor)
            ->get('/admin/barang');

        $response->assertStatus(200);
    }

    public function test_can_access_kategori_index(): void
    {
        $response = $this->actingAs($this->supervisor)
            ->get('/admin/kategori');

        $response->assertStatus(200);
    }

    public function test_can_access_kategorisub_index(): void
    {
        $response = $this->actingAs($this->supervisor)
            ->get('/admin/kategorisub');

        $response->assertStatus(200);
    }

    public function test_can_access_setup_page(): void
    {
        $response = $this->actingAs($this->supervisor)
            ->get('/admin/setup');

        $response->assertStatus(200);
    }
}
