<?php

namespace App\Http\Controllers\AuthCustom;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Helpers;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class CustomLoginController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:'.User::class],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:'.User::class],
            'pin' => ['required', 'confirmed', 'numeric', 'unique:'.User::class],
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
            return Inertia::render('errors/Unregistered', [
                'os'      => $macId->os ?? 'Unknown',
                'status'  => $macId->status,
                'message' => $macId->message ?? 'Contact developer to Register the App to this Machine.',
            ])->toResponse($request)->setStatusCode(403);
        }

        // Find user by username or email (case-insensitive for name)
        $user = User::whereRaw('LOWER(name) = ?', [strtolower($request->username)])
            ->orWhere('email', $request->username)
            ->first();

        if (! isset($user)) {
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

        if (! $validate) {
            RateLimiter::hit($this->throttleKey($user, $request));

            throw ValidationException::withMessages([
                'password' => 'Invalid password',
            ]);
        }

        RateLimiter::clear($this->throttleKey($user, $request));

        $request->session()->regenerate();

        // Redirect berdasarkan level user:
        // Level 1 = Admin  → langsung ke admin dashboard
        // Level 2 = SPV    → login-choice (pilih kasir atau admin)
        // Level 3 = Kasir  → langsung ke kasir
        if ($user->level == 1) {
            $redirectUrl = '/admin/dashboard';
        } elseif ($user->level == 2) {
            $redirectUrl = '/login-choice';
        } else {
            $redirectUrl = '/kasir';
        }

        return redirect($redirectUrl);
    }

    private function throttleKey($user, $request): string
    {
        return Str::transliterate(Str::lower($user->email).'|'.$this->ip($request));
    }

    private function ip($request)
    {
        $ip = $request->getClientIp();

        if (! $request->isFromTrustedProxy()) {
            return $ip;
        }

        $ips = $request->getClientIps();

        return is_array($ips) ? implode(',', $ips) : $ip;
    }
}
