<?php

namespace App\Http\Controllers\AuthCustom;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Helpers;
use App\Models\Barang;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Str;

class CustomLoginController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:' . User::class],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:' . User::class],
            'pin' => ['required', 'confirmed', 'numeric', 'unique:' . User::class],
            'level' => ['required'],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->pin),
            'pin' => $request->pin,
            'level' => $request->level,
        ]);

        Auth::login($user);

        return redirect('/home-space');
    }

    public function verifyLogin(Request $request)
    {
        $macId = (object) Helpers::macId();
        if ($macId->status !== 'registered.') {
            return response()->json($macId, 403);
        }

        // Find user by username or email (case-insensitive for name)
        $user = User::whereRaw('LOWER(name) = ?', [strtolower($request->username)])
            ->orWhere('email', $request->username)
            ->first();

        if (!isset($user)) {
            throw ValidationException::withMessages([
                'username' => 'invalid username, please try again',
            ]);
        }

        // Try to authenticate with password
        $credentials = [
            'email' => $user->email,
            'password' => $request->password,
        ];

        $validate = Auth::attempt($credentials);

        if (!$validate) {
            RateLimiter::hit($this->throttleKey($user, $request));

            throw ValidationException::withMessages([
                'password' => 'Invalid password',
            ]);
        }

        RateLimiter::clear($this->throttleKey($user, $request));

        $request->session()->regenerate();

        // Redirect based on user level
        // Level 1 = Supervisor, redirect to login-choice
        // Level 2+ = Kasir, redirect to kasir page
        $redirectUrl = $user->level == 1 ? '/login-choice' : '/kasir';

        return redirect($redirectUrl);
    }

    private function throttleKey($user, $request): string
    {
        return Str::transliterate(Str::lower($user->email) . '|' . $this->ip($request));
    }

    private function ip($request)
    {
        $ip = $request->getClientIp();

        if (!$request->isFromTrustedProxy()) {
            return $ip;
        }

        $ips = $request->getClientIps();

        return is_array($ips) ? implode(',', $ips) : $ip;
    }
}
