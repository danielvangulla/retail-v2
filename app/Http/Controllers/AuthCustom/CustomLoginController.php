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

        $user = User::where('pin', $request->pin)->first();

        if (!isset($user)) {
            throw ValidationException::withMessages([
                'error' => 'invalid PIN, please Try Again..!',
            ]);
        }

        $credentials = [
            'email' => $user->email,
            'password' => $request->pin,
        ];

        $validate = Auth::attempt($credentials);

        if (!$validate) {
            RateLimiter::hit($this->throttleKey($user, $request));

            throw ValidationException::withMessages([
                'error' => 'Validation Error',
            ]);
        }

        RateLimiter::clear($this->throttleKey($user, $request));

        $request->session()->regenerate();

        Barang::setCache();

        return redirect('/home-space');
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
