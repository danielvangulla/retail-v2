<?php

namespace App\Traits;

use App\Models\Queue;

trait HasQueue
{
    public static function booted()
    {
        static::created(function ($model) {
            // self::setQueue('insert', $model);
        });

        static::updated(function ($model) {
            // self::setQueue('update', $model);
        });
    }

    private static function setQueue(string $command, object $model)
    {
        $table = $model->getTable();
        $data = $model::find($model->id);

        Queue::where('command', $command)
            ->where('sent', 1)
            ->where('table_name', $table)
            ->where('key', $model->id)
            ->delete();

        $queue = Queue::where('command', $command)
            ->where('sent', 0)
            ->where('table_name', $table)
            ->where('key', $model->id)
            ->first();

        if ($queue) {
            $queue->update([
                'updated' => $queue->updated + 1,
                'data' => $data,
            ]);
        } else {
            Queue::create([
                'command' => $command,
                'table_name' => $table,
                'key' => $model->id,
                'data' => $data,
            ]);
        }
    }
}
