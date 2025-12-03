<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use PDOException;

class DatabaseConnectionService
{
    public static bool $connectionPoolingEnabled = true;
    private static int $maxRetries = 5;
    private static int $retryDelayMs = 2000; // 2 seconds
    private static int $totalTimeoutSecs = 10; // 10 seconds total

    /**
     * Update configuration
     */
    public static function updateConfig(array $config): array
    {
        if (isset($config['max_retries']) && $config['max_retries'] > 0) {
            self::$maxRetries = (int) $config['max_retries'];
        }

        if (isset($config['retry_delay_ms']) && $config['retry_delay_ms'] > 0) {
            self::$retryDelayMs = (int) $config['retry_delay_ms'];
        }

        Log::info('Database connection pool configuration updated', [
            'max_retries' => self::$maxRetries,
            'retry_delay_ms' => self::$retryDelayMs,
        ]);

        return self::getConfig();
    }
    public static function getConnectionStats(): array
    {
        try {
            $pdo = DB::connection()->getPdo();

            // Get MySQL connection stats
            $result = DB::selectOne("SHOW PROCESSLIST");
            $connections = DB::select("SHOW PROCESSLIST");

            return [
                'status' => 'ok',
                'total_connections' => count($connections),
                'active_connections' => count(array_filter($connections, fn($c) => $c->Command !== 'Sleep')),
                'idle_connections' => count(array_filter($connections, fn($c) => $c->Command === 'Sleep')),
                'timestamp' => now(),
                'health' => 'healthy',
            ];
        } catch (Exception $e) {
            return [
                'status' => 'error',
                'error' => $e->getMessage(),
                'timestamp' => now(),
                'health' => 'unhealthy',
            ];
        }
    }

    /**
     * Connect with retry logic
     * Returns true if connected, throws exception if timeout
     */
    public static function connectWithRetry(): bool
    {
        if (!self::$connectionPoolingEnabled) {
            return true;
        }

        $startTime = microtime(true);
        $attempt = 0;

        while ($attempt < self::$maxRetries) {
            $attempt++;

            try {
                DB::connection()->getPdo();

                if ($attempt > 1) {
                    Log::info('Database connection retry successful', [
                        'attempt' => $attempt,
                        'elapsed_seconds' => round(microtime(true) - $startTime, 2),
                    ]);
                }

                return true;
            } catch (PDOException $e) {
                $elapsedTime = microtime(true) - $startTime;

                // Check if we've exceeded timeout
                if ($elapsedTime >= self::$totalTimeoutSecs) {
                    Log::error('Database connection timeout', [
                        'total_attempts' => $attempt,
                        'timeout_seconds' => self::$totalTimeoutSecs,
                        'elapsed_seconds' => round($elapsedTime, 2),
                        'last_error' => $e->getMessage(),
                    ]);

                    throw new \Exception(
                        "Database connection timeout setelah {$attempt} percobaan dalam " . round($elapsedTime, 2) . " detik"
                    );
                }

                // Wait before retry
                usleep(self::$retryDelayMs * 1000);

                Log::warning('Database connection retry attempt', [
                    'attempt' => $attempt,
                    'max_retries' => self::$maxRetries,
                    'elapsed_seconds' => round($elapsedTime, 2),
                    'error' => $e->getMessage(),
                ]);
            }
        }

        throw new \Exception('Failed to connect to database after all retries');
    }

    /**
     * Toggle connection pooling on/off
     */
    public static function togglePooling(bool $enabled): bool
    {
        self::$connectionPoolingEnabled = $enabled;

        Log::info('Database connection pooling ' . ($enabled ? 'enabled' : 'disabled'));

        return self::$connectionPoolingEnabled;
    }

    /**
     * Get pooling status
     */
    public static function isPoolingEnabled(): bool
    {
        return self::$connectionPoolingEnabled;
    }

    /**
     * Get configuration
     */
    public static function getConfig(): array
    {
        return [
            'enabled' => self::$connectionPoolingEnabled,
            'max_retries' => self::$maxRetries,
            'retry_delay_ms' => self::$retryDelayMs,
            'total_timeout_secs' => self::$totalTimeoutSecs,
        ];
    }
}
