<?php

namespace App\Http\Controllers\Services;

use Mike42\Escpos\Printer;
use Mike42\Escpos\CapabilityProfile;
use Mike42\Escpos\PrintConnectors\NetworkPrintConnector;

class PrinterShiftServices extends BasePrinter
{
    public function printCloseShift(object $data, object $printer): void
    {
        $user = $data->user;

        // $connector = new WindowsPrintConnector("smb://$data->printer_ip/$data->printer_name");
        $connector = new NetworkPrintConnector($printer->ip_address);
        $profile = CapabilityProfile::load("default");
        $print = new Printer($connector, $profile);

        // Init printer settings
        $print->initialize();

        // Title
        $print->setJustification(Printer::JUSTIFY_CENTER);
        $print->setTextSize(2, 1);
        $print->text("Close Shift Kasir\n");
        $print->setTextSize(1, 1);

        // Timestamp Print
        $print->setJustification(Printer::JUSTIFY_CENTER);
        $print->text(date('j F Y H:i:s') . "\n");

        $this->horizontalLine($print);

        // Shift Info
        $print->setJustification(Printer::JUSTIFY_LEFT);
        $print->text(" Shift : $data->shift\n");
        $print->text(" Kasir : {$user->name}\n");
        $print->text(" Open  : $data->open_time\n");
        $print->text(" Close : " . date('Y-m-d H:i:s') . "\n");

        $print->setJustification(Printer::JUSTIFY_CENTER);
        $this->horizontalLine($print);

        // Report
        $print->setJustification(Printer::JUSTIFY_LEFT);
        $print->text(" OMSET SISTEM\n");
        $this->printReport($print, "Omset CASH Rp.", $data->o_cash);
        $this->printReport($print, "Omset CARD Rp.", $data->o_card);
        $this->sumLine($print);
        $this->printReport($print, "Total Rp.", $data->o_total);

        $print->feed();

        $print->text(" SETORAN FISIK KASIR\n");
        $this->printReport($print, "Setoran CASH Rp.", $data->s_cash);
        $this->printReport($print, "Setoran CARD Rp.", $data->s_card);
        $this->sumLine($print);
        $this->printReport($print, "Total Rp.", $data->s_total);

        $print->feed();

        $print->text(" SELISIH FISIK KASIR\n");
        $this->printReport($print, "Total Selisih Rp.", $data->selisih);

        $print->feed();

        $print->text(" LAINNYA\n");
        $this->printReport($print, "KOMPLEMEN Rp.", $data->komplemen);
        $this->printReport($print, "PIUTANG Rp.", $data->piutang);

        $print->setJustification(Printer::JUSTIFY_CENTER);
        $this->horizontalLine($print);

        $print->setJustification(Printer::JUSTIFY_CENTER);
        $print->text("Approval\n");
        $print->feed(4);
        $this->signLine($print, $user->name);

        $this->horizontalLine($print);

        // Cut the receipt
        $print->feed(2);
        $print->cut();
        $print->close();
    }

    private function printReport($print, $title, $price)
    {
        $str = str_pad($title, 28, ' ', STR_PAD_LEFT);
        $netto = str_pad(number_format($price), 13, ' ', STR_PAD_LEFT); // 99,999,999,999
        $print->text("$str $netto\n");
    }

    public function sumLine($print)
    {
        $print->setJustification(Printer::JUSTIFY_RIGHT);
        $print->textRaw(str_repeat(chr(196), 35) . str_repeat(' ', 5) . PHP_EOL);
        $print->setJustification(Printer::JUSTIFY_LEFT);
    }

    private function signLine($print, $kasir)
    {
        $line = str_repeat(chr(196), 12);
        $space = str_repeat(' ', 10);
        $print->text("$line $space $line\n");

        $kasirPad = str_pad("Kasir", 7, ' ', STR_PAD_LEFT);
        $spvPad = str_pad("Supervisor", 15, ' ', STR_PAD_LEFT);
        $print->text("$kasirPad $space $spvPad\n");
    }
}
