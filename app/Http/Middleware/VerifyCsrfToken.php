<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    // CSRF exceptions are now configured in bootstrap/app.php
    // This file is kept for backward compatibility
}
