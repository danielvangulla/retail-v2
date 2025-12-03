<?php

namespace App\Http\Controllers\Back;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOpnameRequest;
use App\Models\Barang;
use App\Models\Opname;
use App\Traits\ManageStok;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class OpnameController extends Controller
{
    /**
     * Display a listing of opnames
     */
    public function index(): Response
    {
        $opnames = Opname::with(['user', 'barang'])
            ->orderBy('tgl', 'desc')
            ->paginate(15);

        return Inertia::render('admin/Opname/Index', [
            'opnames' => $opnames,
        ]);
    }

    /**
     * Show the form for creating a new opname
     */
    public function create(): Response
    {
        $barangs = Barang::where('st_aktif', 1)
            ->select('id', 'sku', 'barcode', 'deskripsi', 'satuan', 'harga_beli', 'harga_jual1')
            ->orderBy('deskripsi')
            ->get();

        return Inertia::render('admin/Opname/Create', [
            'barangs' => $barangs,
        ]);
    }

    /**
     * Store a newly created opname in storage
     */
    public function store(StoreOpnameRequest $request)
    {
        try {
            DB::beginTransaction();

            $data = $request->validated()['data'];
            $createdCount = 0;
            $errors = [];

            foreach ($data as $item) {
                try {
                    $opname = Opname::create([
                        'user_id' => Auth::user()->id,
                        'barang_id' => $item['id'],
                        'tgl' => now()->toDateString(),
                        'sistem' => $item['qtySistem'],
                        'fisik' => $item['qtyFisik'],
                        'selisih' => $item['qtySelisih'],
                        'keterangan' => $item['keterangan'] ?? null,
                    ]);

                    // Update stok fisik jika ada selisih (gunakan ManageStok)
                    if ($item['qtySelisih'] !== 0) {
                        if ($item['qtySelisih'] > 0) {
                            // Fisik lebih banyak = barang masuk
                            ManageStok::addStok(
                                $item['id'],
                                $item['qtySelisih'],
                                'in',
                                'opname',
                                $opname->id,
                                'Opname stok: '.($item['keterangan'] ?? 'Penyesuaian stok'),
                                Auth::user()->id
                            );
                        } else {
                            // Fisik lebih sedikit = barang keluar
                            ManageStok::reduceStok(
                                $item['id'],
                                abs($item['qtySelisih']),
                                'out',
                                'opname',
                                $opname->id,
                                'Opname stok: '.($item['keterangan'] ?? 'Penyesuaian stok'),
                                Auth::user()->id
                            );
                        }
                    }

                    $createdCount++;
                } catch (\Exception $e) {
                    $errors[] = [
                        'barang_id' => $item['id'],
                        'error' => $e->getMessage(),
                    ];
                }
            }

            DB::commit();

            return response()->json([
                'status' => 'ok',
                'message' => "{$createdCount} opname berhasil disimpan",
                'created_count' => $createdCount,
                'errors' => $errors,
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menyimpan opname: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified opname
     */
    public function show(Opname $opname): Response
    {
        return Inertia::render('admin/Opname/Show', [
            'opname' => $opname->load(['user', 'barang']),
        ]);
    }

    /**
     * Show the form for editing the specified opname
     */
    public function edit(Opname $opname): Response
    {
        $barangs = Barang::where('st_aktif', 1)
            ->select('id', 'sku', 'barcode', 'deskripsi', 'satuan', 'harga_beli', 'harga_jual1')
            ->orderBy('deskripsi')
            ->get();

        return Inertia::render('admin/Opname/Edit', [
            'opname' => $opname->load(['user', 'barang']),
            'barangs' => $barangs,
        ]);
    }

    /**
     * Update the specified opname in storage
     */
    public function update(Request $request, Opname $opname)
    {
        try {
            $validated = $request->validate([
                'barang_id' => ['required', 'uuid', 'exists:barang,id'],
                'sistem' => ['required', 'integer', 'min:0'],
                'fisik' => ['required', 'integer', 'min:0'],
                'keterangan' => ['nullable', 'string', 'max:500'],
            ]);

            DB::beginTransaction();

            $oldSelisih = $opname->selisih;
            $newSelisih = $validated['fisik'] - $validated['sistem'];

            $opname->update([
                'barang_id' => $validated['barang_id'],
                'sistem' => $validated['sistem'],
                'fisik' => $validated['fisik'],
                'selisih' => $newSelisih,
                'keterangan' => $validated['keterangan'] ?? null,
            ]);

            // Jika selisih berubah, update stok
            if ($oldSelisih !== $newSelisih) {
                $diff = $newSelisih - $oldSelisih;

                if ($diff > 0) {
                    ManageStok::addStok(
                        $opname->barang_id,
                        $diff,
                        'in',
                        'opname_update',
                        $opname->id,
                        'Update opname',
                        Auth::user()->id
                    );
                } else {
                    ManageStok::reduceStok(
                        $opname->barang_id,
                        abs($diff),
                        'out',
                        'opname_update',
                        $opname->id,
                        'Update opname',
                        Auth::user()->id
                    );
                }
            }

            DB::commit();

            return redirect()->route('admin.opname.show', $opname)
                ->with('success', 'Opname berhasil diperbarui');
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()
                ->with('error', 'Gagal memperbarui opname: '.$e->getMessage());
        }
    }

    /**
     * Remove the specified opname from storage
     */
    public function destroy(Opname $opname)
    {
        try {
            DB::beginTransaction();

            // Reverse stok adjustment
            if ($opname->selisih !== 0) {
                if ($opname->selisih > 0) {
                    ManageStok::reduceStok(
                        $opname->barang_id,
                        $opname->selisih,
                        'out',
                        'opname_cancel',
                        $opname->id,
                        'Pembatalan opname',
                        Auth::user()->id
                    );
                } else {
                    ManageStok::addStok(
                        $opname->barang_id,
                        abs($opname->selisih),
                        'in',
                        'opname_cancel',
                        $opname->id,
                        'Pembatalan opname',
                        Auth::user()->id
                    );
                }
            }

            $opname->delete();

            DB::commit();

            return redirect()->route('admin.opname.index')
                ->with('success', 'Opname berhasil dihapus');
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()
                ->with('error', 'Gagal menghapus opname: '.$e->getMessage());
        }
    }

    /**
     * Get opname list as JSON (for API/AJAX)
     */
    public function opnameJson(Request $request)
    {
        $query = Opname::with('barang', 'user')
            ->orderBy('tgl', 'desc');

        if ($request->has('start_date') && $request->start_date) {
            $query->whereDate('tgl', '>=', $request->start_date);
        }

        if ($request->has('end_date') && $request->end_date) {
            $query->whereDate('tgl', '<=', $request->end_date);
        }

        if ($request->has('barang_id') && $request->barang_id) {
            $query->where('barang_id', $request->barang_id);
        }

        $data = $query->get();

        return response()->json([
            'status' => 'ok',
            'data' => $data,
            'count' => $data->count(),
        ], 200);
    }

    /**
     * Get summary of opnames for a date range
     */
    public function summary(Request $request)
    {
        $request->validate([
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
        ]);

        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        $summary = Opname::getSummary($startDate, $endDate);

        return response()->json([
            'status' => 'ok',
            'data' => $summary,
        ], 200);
    }
}
