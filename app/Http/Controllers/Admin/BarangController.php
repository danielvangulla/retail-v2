<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Barang;
use App\Models\Kategori;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;

class BarangController extends Controller
{
    public function index(): Response
    {
        $barang = Barang::with('kategori')->paginate(20);
        
        return Inertia::render('admin/Barang/Index', [
            'barang' => $barang,
            'kategoris' => Kategori::all(),
        ]);
    }

    public function list(Request $request)
    {
        $query = Barang::query();

        if ($request->search) {
            $search = $request->search;
            $query->where('deskripsi', 'LIKE', "%{$search}%")
                ->orWhere('barcode', 'LIKE', "%{$search}%");
        }

        if ($request->kategori_id) {
            $query->where('kategori_id', $request->kategori_id);
        }

        if ($request->show !== null) {
            $query->where('st_aktif', $request->show);
        }

        $barangs = $query->with('kategori')->paginate(20);

        return response()->json([
            'status' => 'ok',
            'data' => $barangs,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/Barang/Create', [
            'kategoris' => Kategori::all(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'barcode' => 'required|unique:barang',
            'deskripsi' => 'required',
            'kategori_id' => 'required|exists:kategori,id',
            'harga_beli' => 'required|numeric|min:0',
            'harga_jual' => 'required|numeric|min:0',
            'min_stock' => 'required|integer|min:0',
            'st_aktif' => 'required|in:0,1',
        ]);

        // Map harga_jual to harga_jual1
        $validated['harga_jual1'] = $validated['harga_jual'];
        unset($validated['harga_jual']);

        Barang::create($validated);

        return redirect('/back/barang')->with('message', 'Barang berhasil ditambahkan');
    }

    public function edit(string $id): Response
    {
        $barang = Barang::findOrFail($id);

        return Inertia::render('admin/Barang/Edit', [
            'barang' => $barang,
            'kategoris' => Kategori::all(),
        ]);
    }

    public function update(Request $request, string $id): RedirectResponse
    {
        $barang = Barang::findOrFail($id);

        $validated = $request->validate([
            'barcode' => 'required|unique:barang,barcode,' . $id . ',id',
            'deskripsi' => 'required',
            'kategori_id' => 'required|exists:kategori,id',
            'harga_beli' => 'required|numeric|min:0',
            'harga_jual' => 'required|numeric|min:0',
            'min_stock' => 'required|integer|min:0',
            'st_aktif' => 'required|in:0,1',
        ]);

        // Map harga_jual to harga_jual1
        $validated['harga_jual1'] = $validated['harga_jual'];
        unset($validated['harga_jual']);

        $barang->update($validated);

        return redirect('/back/barang')->with('message', 'Barang berhasil diupdate');
    }

    public function destroy(string $id): RedirectResponse
    {
        $barang = Barang::findOrFail($id);
        $barang->delete();

        return redirect('/back/barang')->with('message', 'Barang berhasil dihapus');
    }

    public function lowStock(): Response
    {
        $lowStocks = Barang::where('st_aktif', 1)->get();

        return Inertia::render('admin/Barang/LowStock', [
            'lowStocks' => $lowStocks,
        ]);
    }
}
