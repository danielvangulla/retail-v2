<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;

class LoginChoiceController extends Controller
{
    public function show(): Response
    {
        return Inertia::render('auth/LoginChoice', [
            'userName' => Auth::user()->name,
        ]);
    }
}
