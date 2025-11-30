<?php

namespace App\Http\Controllers\Services;

use Mike42\Escpos\Printer;
use Mike42\Escpos\CapabilityProfile;
use Mike42\Escpos\PrintConnectors\NetworkPrintConnector;
// use Mike42\Escpos\PrintConnectors\WindowsPrintConnector;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Auth;

class PrinterSalesReportServices extends BasePrinter implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $data;
    protected $printer;

    public function __construct(Object $data, Object $printer)
    {
        $this->data = $data;
        $this->printer = $printer;
    }

    public function handle(): void
    {
        // $connector = new WindowsPrintConnector("smb://$data->printer_ip/$data->printer_name");
        $connector = new NetworkPrintConnector($this->printer->ip_address);
        $profile = CapabilityProfile::load("default");
        $print = new Printer($connector, $profile);

        // Init printer settings
        $print->initialize();

        // Title
        $print->setJustification(Printer::JUSTIFY_CENTER);
        $print->setTextSize(2, 1);
        $print->text("Penjualan by Item\n");
        $print->setTextSize(1, 1);

        // Timestamp Print
        $print->setJustification(Printer::JUSTIFY_CENTER);
        $print->text(date('j F Y H:i:s') . "\n");

        $this->horizontalLine($print);

        // Shift Info
        if (isset($this->data->shift)) {
            $shift = (object) $this->data->shift;
            $print->setJustification(Printer::JUSTIFY_LEFT);
            $print->text(" Shift : $shift->shift\n");
            $print->text(" Kasir : $shift->user\n");
            $print->text(" Open  : $shift->open\n");
            $print->text(" Close : $shift->close\n");
        } else {
            $user = Auth::user();
            $print->setJustification(Printer::JUSTIFY_LEFT);
            $print->text(" Tanggal  : {$this->data->tgl}\n");
            $print->text(" Print by : $user->name\n");
        }

        $print->setJustification(Printer::JUSTIFY_CENTER);
        $this->horizontalLine($print);

        $this->printTitle($print);
        $this->horizontalLine($print);
        // Items

        foreach ($this->data->items as $v) {
            $item = (object) $v;
            $this->printItem($print, $item);
        }

        $this->horizontalLine($print);

        // Cut the receipt
        $print->feed(2);
        $print->cut();
        $print->close();
    }

    private function printTitle($print)
    {
        $s = str_repeat(' ', 2);
        $qty = str_pad(" Qty", 5, ' ', STR_PAD_LEFT);
        $sku = str_pad(" SKU ", 10);
        $deskripsi = str_pad(" Deskripsi ", 25);
        $print->text(" $qty $s $sku $s$deskripsi\n");
    }

    private function printItem($print, $item)
    {
        $barang = (object) $item->barang;
        $qty = str_pad(number_format($item->qty), 5, ' ', STR_PAD_LEFT); // 999
        $sku = str_pad($item->sku, 10);
        $deskripsi = str_pad($barang->deskripsi, 25);
        $s = str_repeat(' ', 1);
        $print->text(" $qty $s $sku $deskripsi\n");
    }
}
