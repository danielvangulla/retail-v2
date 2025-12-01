<?php

namespace App\Http\Controllers\Ai;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use OpenAI\Laravel\Facades\OpenAI;

class OpenAiController extends Controller
{
    public function test()
    {
        // $result = OpenAI::completions()->create([
        //     'model' => 'ada',
        //     'prompt' => 'laravel install pest',
        // ]);

        // return response()->json($result);
    }
}
