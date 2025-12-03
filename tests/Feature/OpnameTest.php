<?php

use App\Models\Barang;
use App\Models\Opname;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('can show opname index page', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/admin/opname');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('admin/Opname/Index')
    );
});

it('can show opname create page', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/admin/opname/create');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('admin/Opname/Create')
        ->has('barangs')
    );
});

it('can create opname with valid data', function () {
    $user = User::factory()->create();
    $barang = Barang::factory()->create();

    $response = $this->actingAs($user)->postJson('/admin/opname', [
        'data' => [
            [
                'id' => $barang->id,
                'deskripsi' => $barang->deskripsi,
                'qtySistem' => 10,
                'qtyFisik' => 12,
                'qtySelisih' => 2,
                'keterangan' => 'Stock lebih dari sistem',
            ],
        ],
    ]);

    $response->assertStatus(200);
    $response->assertJson(['status' => 'ok']);

    expect(Opname::whereBarangId($barang->id)->whereUserId($user->id)->exists())->toBeTrue();
});

it('can show opname detail', function () {
    $user = User::factory()->create();
    $barang = Barang::factory()->create();
    $opname = Opname::factory()
        ->for($user)
        ->for($barang)
        ->create([
            'sistem' => 10,
            'fisik' => 12,
            'selisih' => 2,
        ]);

    $response = $this->actingAs($user)->get("/admin/opname/{$opname->id}");

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('admin/Opname/Show')
        ->has('opname')
    );
});

it('can show opname edit page', function () {
    $user = User::factory()->create();
    $barang = Barang::factory()->create();
    $opname = Opname::factory()
        ->for($user)
        ->for($barang)
        ->create();

    $response = $this->actingAs($user)->get("/admin/opname/{$opname->id}/edit");

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('admin/Opname/Edit')
        ->has('opname')
        ->has('barangs')
    );
});

it('can update opname', function () {
    $user = User::factory()->create();
    $barang = Barang::factory()->create();
    $opname = Opname::factory()
        ->for($user)
        ->for($barang)
        ->create([
            'sistem' => 10,
            'fisik' => 12,
            'selisih' => 2,
        ]);

    $response = $this->actingAs($user)->patchJson("/admin/opname/{$opname->id}", [
        'barang_id' => $barang->id,
        'qtySistem' => 10,
        'qtyFisik' => 15,
        'keterangan' => 'Updated keterangan',
    ]);

    $response->assertRedirect("/admin/opname/{$opname->id}");

    expect(Opname::find($opname->id)->fisik)->toBe(15);
});

it('can delete opname', function () {
    $user = User::factory()->create();
    $barang = Barang::factory()->create();
    $opname = Opname::factory()
        ->for($user)
        ->for($barang)
        ->create([
            'sistem' => 10,
            'fisik' => 12,
            'selisih' => 2,
        ]);

    $response = $this->actingAs($user)->deleteJson("/admin/opname/{$opname->id}");

    $response->assertRedirect('/admin/opname');

    expect(Opname::find($opname->id)->trashed())->toBeTrue();
});

it('can get opname list as json', function () {
    $user = User::factory()->create();
    $barang = Barang::factory()->create();
    Opname::factory(3)
        ->for($user)
        ->for($barang)
        ->create();

    $response = $this->actingAs($user)->postJson('/admin/opname-list');

    $response->assertStatus(200);
    $response->assertJson(['status' => 'ok']);
});

it('can filter opname list by date range', function () {
    $user = User::factory()->create();
    $barang = Barang::factory()->create();

    Opname::factory()
        ->for($user)
        ->for($barang)
        ->create(['tgl' => now()->subDays(5)]);

    Opname::factory()
        ->for($user)
        ->for($barang)
        ->create(['tgl' => now()]);

    $response = $this->actingAs($user)->postJson('/admin/opname-list', [
        'start_date' => now()->subDays(2)->toDateString(),
        'end_date' => now()->toDateString(),
    ]);

    $response->assertStatus(200);
    $response->assertJson(['status' => 'ok']);
});

it('validates required fields on store', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson('/admin/opname', [
        'data' => [],
    ]);

    $response->assertStatus(422);
});

it('validates barang exists on store', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson('/admin/opname', [
        'data' => [
            [
                'id' => 'invalid-uuid',
                'deskripsi' => 'Test',
                'qtySistem' => 10,
                'qtyFisik' => 12,
                'qtySelisih' => 2,
            ],
        ],
    ]);

    $response->assertStatus(422);
});

it('can get opname summary', function () {
    $user = User::factory()->create();
    $barang = Barang::factory()->create();
    Opname::factory(3)
        ->for($user)
        ->for($barang)
        ->create([
            'sistem' => 10,
            'fisik' => 15,
            'selisih' => 5,
        ]);

    $response = $this->actingAs($user)->getJson('/admin/opname-summary');

    $response->assertStatus(200);
    $response->assertJson(['status' => 'ok']);
});
