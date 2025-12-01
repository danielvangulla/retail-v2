<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\TestController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    if (config('app.type') === 'retail') {
        return redirect('/home-space');
    }

    return redirect('/home-space');
});

Route::get('/dashboard', function () {
    return redirect('/home-space');
})->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/pengaturan', [SettingsController::class, 'index']);
    Route::post('/update-setup', [SettingsController::class, 'updateSetup']);
});

Route::get('/test-print', [TestController::class, 'testPrint']);
Route::get('/test-cache', [TestController::class, 'testCache']);

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/admin.php';
require __DIR__.'/retail.php';
