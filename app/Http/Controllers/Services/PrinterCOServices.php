<?php

namespace App\Http\Controllers\Services;

use Mike42\Escpos\Printer;
use Mike42\Escpos\CapabilityProfile;
use Mike42\Escpos\PrintConnectors\NetworkPrintConnector;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class PrinterCOServices extends BasePrinter implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $requestData;
    protected $copy;

    public function __construct(Object $requestData, int $copy)
    {
        $this->requestData = $requestData;
        $this->copy = $copy;
    }

    public function handle(): void
    {
        $copy = "";
        if ($this->copy > 0) {
            $copy = "- Copy $this->copy";
        }

        $data = $this->requestData;
        $connector = new NetworkPrintConnector($data->printer_ip);
        $profile = CapabilityProfile::load("default");
        $print = new Printer($connector, $profile);

        // init Printer
        $print->initialize();

        // Justify Content Center
        $print->setJustification(Printer::JUSTIFY_CENTER);

        // Info
        $print->selectPrintMode(Printer::MODE_DOUBLE_WIDTH);
        $print->text("$data->printer_name $copy\n");
        $print->selectPrintMode();

        // Timestamp
        $print->setFont(Printer::FONT_B);
        $print->text(date('Y-m-d H:i:s') . " | $data->no_co | $data->captain\n");
        // $print->text(date('j F Y H:i:s') . "\n");
        $print->setFont(Printer::FONT_A);

        // Meja
        $print->selectPrintMode(Printer::MODE_DOUBLE_WIDTH);
        $print->text("Meja $data->meja\n");
        $print->selectPrintMode();

        // Horizontal Line
        $print->textRaw(str_repeat(chr(196), 45) . PHP_EOL);

        // Justify Content Left
        $print->setJustification(Printer::JUSTIFY_LEFT);

        // Items
        foreach ($data->items as $item) {
            $item = (object) $item;
            $qty = str_pad($item->qty, 5, ' ', STR_PAD_LEFT);
            $print->text("$qty $item->deskripsi");

            if ($item->note != '-') {
                $print->setFont(Printer::FONT_B);
                $pad = str_pad("->", 10, ' ', STR_PAD_LEFT);
                $print->text("\n $pad $item->note");
                $print->setFont(Printer::FONT_A);
            }
            $print->text("\n");
        }
        $print->feed();

        // Justify Content Center
        $print->setJustification(Printer::JUSTIFY_CENTER);

        // Horizontal Line
        $print->textRaw(str_repeat(chr(196), 45) . PHP_EOL);

        // Cut the receipt
        $print->feed();
        $print->cut();
        $print->close();
    }
}
