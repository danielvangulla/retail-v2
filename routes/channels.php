<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('status-meja', function ($user) {
    return true;
});

Broadcast::channel('omset-code', function ($user) {
    return true;
});

Broadcast::channel('update-time', function ($user) {
    return true;
});

Broadcast::channel('notif.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});
