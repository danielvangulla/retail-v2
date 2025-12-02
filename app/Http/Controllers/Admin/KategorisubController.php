<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Kategorisub;
use App\Models\Kategori;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;

class KategorisubController extends Controller
{
    public function index(): Response
    {
        $kategorisub = Kategorisub::with('kategori')->paginate(20);
        $kategoris = Kategori::all();

        return Inertia::render('admin/Kategorisub/Index', [
            'kategorisub' => $kategorisub,
            'kategoris' => $kategoris,
        ]);
    }

    public function list(Request $request): JsonResponse
    {
        $query = Kategorisub::with('kategori');

        if ($request->search) {
            $query->where('ket', 'LIKE', "%{$request->search}%");
        }

        if ($request->kategori_id) {
            $query->where('kategori_id', $request->kategori_id);
        }

        $kategorisub = $query->paginate(20);

        return response()->json([
            'status' => 'ok',
            'data' => $kategorisub,
        ]);
    }

    public function create(): Response
    {
        $kategoris = Kategori::all();

        return Inertia::render('admin/Kategorisub/Create', [
            'kategoris' => $kategoris,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ket' => 'required|unique:kategorisub',
            'kategori_id' => 'required|exists:kategori,id',
        ]);

        Kategorisub::create($validated);

        return redirect('/admin/kategorisub')->with('message', 'Sub Kategori berhasil ditambahkan');
    }

    public function edit(string $id): Response
    {
        $kategorisub = Kategorisub::findOrFail($id);
        $kategoris = Kategori::all();

        return Inertia::render('admin/Kategorisub/Edit', [
            'kategorisub' => $kategorisub,
            'kategoris' => $kategoris,
        ]);
    }

    public function update(Request $request, string $id): RedirectResponse
    {
        $kategorisub = Kategorisub::findOrFail($id);

        $validated = $request->validate([
            'ket' => 'required|unique:kategorisub,ket,' . $id . ',id',
            'kategori_id' => 'required|exists:kategori,id',
        ]);

        $kategorisub->update($validated);

        return redirect('/admin/kategorisub')->with('message', 'Sub Kategori berhasil diupdate');
    }

    public function destroy(string $id): RedirectResponse
    {
        $kategorisub = Kategorisub::findOrFail($id);

        if ($kategorisub->barangs()->count() > 0) {
            return redirect('/admin/kategorisub')->with('error', 'Tidak bisa menghapus sub kategori yang masih memiliki barang');
        }

        $kategorisub->delete();

        return redirect('/admin/kategorisub')->with('message', 'Sub Kategori berhasil dihapus');
    }
}
