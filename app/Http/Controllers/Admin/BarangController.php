<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Barang;
use App\Models\BarangPrice;
use App\Models\Kategori;
use App\Models\Kategorisub;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;

class BarangController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Barang::with(['kategori', 'prices']);

        // Search filter
        if ($request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('deskripsi', 'LIKE', "%{$search}%")
                  ->orWhere('sku', 'LIKE', "%{$search}%")
                  ->orWhere('barcode', 'LIKE', "%{$search}%");
            });
        }

        // Kategori filter
        if ($request->kategori_id) {
            $query->where('kategori_id', $request->kategori_id);
        }

        // Status filter
        if ($request->show !== null && $request->show !== '') {
            $query->where('st_aktif', $request->show);
        }

        $barang = $query->paginate(20)->withQueryString();

        return Inertia::render('admin/Barang/Index', [
            'barang' => $barang,
            'kategoris' => Kategori::select('id', 'ket as nama')->get(),
            'filters' => [
                'search' => $request->search,
                'kategori_id' => $request->kategori_id,
                'show' => $request->show,
            ],
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
        return Inertia::render('admin/Barang/FormNew', [
            'kategoris' => Kategori::all(),
            'kategoriSubs' => Kategorisub::all(),
            'barang' => null,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'barcode' => 'nullable|unique:barang',
            'deskripsi' => 'required',
            'alias' => 'nullable',
            'kategori_id' => 'required|exists:kategori,id',
            'kategorisub_id' => 'nullable|exists:kategorisub,id',
            'satuan' => 'required',
            'isi' => 'required|integer|min:1',
            'volume' => 'nullable',
            'harga_beli' => 'required|numeric|min:0',
            'harga_jual1' => 'required|numeric|min:0',
            'harga_jual2' => 'nullable|numeric|min:0',
            'min_stock' => 'required|integer|min:0',
            'st_aktif' => 'required|in:0,1',
            'prices' => 'nullable|array',
            'prices.*.qty' => 'required|integer|min:1',
            'prices.*.harga1' => 'required|numeric|min:0',
            'prices.*.harga2' => 'nullable|numeric|min:0',
            'prices.*.multiplier' => 'nullable|boolean',
        ]);

        // Generate SKU if not provided
        if (empty($validated['sku'])) {
            $validated['sku'] = 'BRG-' . strtoupper(Str::random(8));
        }

        $barang = Barang::create($validated);

        // Save harga bertingkat if provided
        if (!empty($request->prices)) {
            foreach ($request->prices as $price) {
                BarangPrice::create([
                    'barang_id' => $barang->id,
                    'qty' => $price['qty'],
                    'harga1' => $price['harga1'],
                    'harga2' => $price['harga2'] ?? 0,
                    'multiplier' => $price['multiplier'] ?? false,
                ]);
            }
        }

        return redirect('/back/barang')->with('message', 'Barang berhasil ditambahkan');
    }

    public function edit(string $id): Response
    {
        $barang = Barang::with('prices')->findOrFail($id);

        return Inertia::render('admin/Barang/FormNew', [
            'barang' => $barang,
            'kategoris' => Kategori::all(),
            'kategoriSubs' => Kategorisub::all(),
        ]);
    }

    public function update(Request $request, string $id): RedirectResponse
    {
        $barang = Barang::findOrFail($id);

        $validated = $request->validate([
            'barcode' => 'nullable|unique:barang,barcode,' . $id . ',id',
            'deskripsi' => 'required',
            'alias' => 'nullable',
            'kategori_id' => 'required|exists:kategori,id',
            'kategorisub_id' => 'nullable|exists:kategorisub,id',
            'satuan' => 'required',
            'isi' => 'required|integer|min:1',
            'volume' => 'nullable',
            'harga_beli' => 'required|numeric|min:0',
            'harga_jual1' => 'required|numeric|min:0',
            'harga_jual2' => 'nullable|numeric|min:0',
            'min_stock' => 'required|integer|min:0',
            'st_aktif' => 'required|in:0,1',
            'prices' => 'nullable|array',
            'prices.*.qty' => 'required|integer|min:1',
            'prices.*.harga1' => 'required|numeric|min:0',
            'prices.*.harga2' => 'nullable|numeric|min:0',
            'prices.*.multiplier' => 'nullable|boolean',
        ]);

        $barang->update($validated);

        // Delete old prices and create new ones
        $barang->prices()->delete();
        if (!empty($request->prices)) {
            foreach ($request->prices as $price) {
                BarangPrice::create([
                    'barang_id' => $barang->id,
                    'qty' => $price['qty'],
                    'harga1' => $price['harga1'],
                    'harga2' => $price['harga2'] ?? 0,
                    'multiplier' => $price['multiplier'] ?? false,
                ]);
            }
        }

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
