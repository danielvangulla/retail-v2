<?php

use App\Http\Controllers\Back\SyncController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


// Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
//     return $request->user();
// });

// Route::group(['middleware' => ['auth:sanctum']], function () {

Route::post('/sync-getter', [SyncController::class, 'getter']);
// });
