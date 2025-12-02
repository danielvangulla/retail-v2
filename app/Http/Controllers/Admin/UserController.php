<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/User/Index');
    }

    public function list(Request $request): JsonResponse
    {
        $query = User::query();

        if ($request->search) {
            $query->where('name', 'LIKE', "%{$request->search}%")
                ->orWhere('email', 'LIKE', "%{$request->search}%");
        }

        if ($request->level !== null) {
            $query->where('level', $request->level);
        }

        $users = $query->paginate(20);

        return response()->json([
            'status' => 'ok',
            'data' => $users,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/User/Create', [
            'levels' => [
                ['id' => 1, 'name' => 'Supervisor'],
                ['id' => 2, 'name' => 'Kasir'],
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|unique:users',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
            'level' => 'required|in:1,2',
        ]);

        $validated['password'] = Hash::make($validated['password']);

        User::create($validated);

        return redirect('/admin/user')->with('message', 'User berhasil ditambahkan');
    }

    public function edit(string $id): Response
    {
        $user = User::findOrFail($id);

        return Inertia::render('admin/User/Edit', [
            'user' => $user,
            'levels' => [
                ['id' => 1, 'name' => 'Supervisor'],
                ['id' => 2, 'name' => 'Kasir'],
            ],
        ]);
    }

    public function update(Request $request, string $id): RedirectResponse
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|unique:users,name,' . $id . ',id',
            'email' => 'required|email|unique:users,email,' . $id . ',id',
            'level' => 'required|in:1,2',
        ]);

        // Only update password if provided
        if ($request->password) {
            $validated['password'] = Hash::make($request->password);
        }

        $user->update($validated);

        return redirect('/admin/user')->with('message', 'User berhasil diupdate');
    }

    public function destroy(string $id): RedirectResponse
    {
        $user = User::findOrFail($id);

        // Prevent deleting last admin
        if ($user->level == 1 && User::where('level', 1)->count() === 1) {
            return redirect('/admin/user')->with('error', 'Tidak bisa menghapus satu-satunya supervisor');
        }

        $user->delete();

        return redirect('/admin/user')->with('message', 'User berhasil dihapus');
    }
}
