<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Kategori;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;

class KategoriController extends Controller
{
    public function index(): Response
    {
        $kategoris = Kategori::withCount('barangs')->paginate(20);

        return Inertia::render('admin/Kategori/Index', [
            'kategoris' => $kategoris,
        ]);
    }

    public function list(Request $request): JsonResponse
    {
        $query = Kategori::query();

        if ($request->search) {
            $query->where('ket', 'LIKE', "%{$request->search}%");
        }

        $kategoris = $query->withCount('barangs')->paginate(20);

        return response()->json([
            'status' => 'ok',
            'data' => $kategoris,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/Kategori/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ket' => 'required|unique:kategori',
        ]);

        Kategori::create($validated);

        return redirect('/admin/kategori')->with('message', 'Kategori berhasil ditambahkan');
    }

    public function edit(string $id): Response
    {
        $kategori = Kategori::findOrFail($id);

        return Inertia::render('admin/Kategori/Edit', [
            'kategori' => $kategori,
        ]);
    }

    public function update(Request $request, string $id): RedirectResponse
    {
        $kategori = Kategori::findOrFail($id);

        $validated = $request->validate([
            'ket' => 'required|unique:kategori,ket,' . $id . ',id',
        ]);

        $kategori->update($validated);

        return redirect('/admin/kategori')->with('message', 'Kategori berhasil diupdate');
    }

    public function destroy(string $id): RedirectResponse
    {
        $kategori = Kategori::findOrFail($id);

        if ($kategori->barangs()->count() > 0) {
            return redirect('/admin/kategori')->with('error', 'Tidak bisa menghapus kategori yang masih memiliki barang');
        }

        $kategori->delete();

        return redirect('/admin/kategori')->with('message', 'Kategori berhasil dihapus');
    }
}
