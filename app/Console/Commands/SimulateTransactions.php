<?php

namespace App\Console\Commands;

use Database\Seeders\TransactionSimulationSeeder;
use Illuminate\Console\Command;

class SimulateTransactions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:simulate-transactions
                          {--reset : Reset all simulated transactions before running}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Simulate complete transaction flow: pembelian, penjualan, retur, opname for Average Perpetual Cost testing';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        if ($this->option('reset')) {
            $this->info('⚠️  Resetting simulated transactions...');
            $this->resetSimulatedData();
        }

        $this->call('db:seed', [
            '--class' => TransactionSimulationSeeder::class,
        ]);

        return Command::SUCCESS;
    }

    /**
     * Reset simulated transaction data
     */
    private function resetSimulatedData(): void
    {
        $this->info('Deleting recent opname records...');
        \App\Models\Opname::where('created_at', '>=', now()->subHours(2))->forceDelete();

        $this->info('Deleting recent retur records...');
        \App\Models\BarangRetur::where('created_at', '>=', now()->subHours(2))->forceDelete();

        $this->info('Deleting recent purchase records...');
        \App\Models\Pembelian::where('created_at', '>=', now()->subHours(2))->forceDelete();

        $this->info('Deleting recent stock movements...');
        \Illuminate\Support\Facades\DB::table('barang_stock_movements')
            ->where('created_at', '>=', now()->subHours(2))
            ->delete();

        $this->info('Deleting recent cost history...');
        \Illuminate\Support\Facades\DB::table('barang_cost_history')
            ->where('created_at', '>=', now()->subHours(2))
            ->delete();

        $this->info('✅ Simulated data reset complete');
    }
}
