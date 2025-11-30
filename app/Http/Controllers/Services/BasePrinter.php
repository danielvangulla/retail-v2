<?php

namespace App\Http\Controllers\Services;

use App\Models\Printer as ModelsPrinter;
use Mike42\Escpos\CapabilityProfile;
use Mike42\Escpos\PrintConnectors\NetworkPrintConnector;
use Mike42\Escpos\PrintConnectors\WindowsPrintConnector;
use Mike42\Escpos\Printer;

class BasePrinter
{
    public function header()
    {
        return (object) [
            'perusahaan' => env('NAMA_PERUSAHAAN', ''),
            'alamat1' => env('ALAMAT1_PERUSAHAAN', ''),
            'alamat2' => env('ALAMAT2_PERUSAHAAN', ''),
        ];
    }

    public function test($type)
    {
        $printer = ModelsPrinter::where('name', 'kasir');

        if ($type === 'usb') {
            $connector = new WindowsPrintConnector("kasirusb");
        } else {
            $connector = new NetworkPrintConnector($printer->ip_address);
        }

        $profile = CapabilityProfile::load("default");
        $print = new Printer($connector, $profile);

        // Init printer settings
        $print->initialize();

        // Nama Perusahaan
        $print->setJustification(Printer::JUSTIFY_CENTER);
        $print->setTextSize(3, 2);
        $print->text("{$this->header()->perusahaan}\n");
        $print->setTextSize(1, 1);

        // Alamat
        $print->text("{$this->header()->alamat1}\n");
        $print->text("{$this->header()->alamat2}\n");

        $this->horizontalLine($print);

        // Timestamp Print
        $print->setJustification(Printer::JUSTIFY_CENTER);
        $print->setFont(Printer::FONT_B);
        $print->text(date('j F Y H:i:s') . "\n");
        $print->setFont(Printer::FONT_A);

        // Other
        $print->selectPrintMode(Printer::MODE_DOUBLE_WIDTH);
        $print->text("MEJA TEST\n");
        $print->selectPrintMode();

        $this->horizontalLine($print);

        // Column Title
        $print->setEmphasis(true);
        $qtyPad = str_pad("Qty", 4, ' ', STR_PAD_LEFT); // 9,999
        $ketPad = str_pad("Keterangan", 24);
        $hargaPad = str_pad("Harga Rp. ", 10, ' ', STR_PAD_LEFT); // 99,999,999
        $captainPad = str_pad("Capt.", 6, ' ', STR_PAD_LEFT);

        $print->text("$qtyPad $ketPad $hargaPad $captainPad\n");
        $print->setEmphasis(false);

        $this->horizontalLine($print);

        // items
        $data = (object) [
            'items' => [
                ['qty' => 2, 'deskripsi' => 'testing', 'netto' => 12500, 'captain' => 'user']
            ],
            'trx' => (object) [
                'brutto' => 12500, 'disc_spv' => 0, 'disc_promo' => 0, 'netto' => 12500, 'tax' => 0, 'service' => 0, 'bayar' => 12500
            ],
        ];

        foreach ($data->items as $item) {
            $item = (object) $item;
            $qty = str_pad($item->qty, 4, ' ', STR_PAD_LEFT); // 9,999
            $ket = str_pad(substr($item->deskripsi, 0, 23), 23);
            $harga = str_pad(number_format($item->netto), 10, ' ', STR_PAD_LEFT); // 99,999,999
            $captain = str_pad(substr($item->captain, 0, 6), 7, ' ', STR_PAD_LEFT);
            $print->text("$qty $ket $harga $captain\n");
        }

        $this->horizontalLine($print);

        // Disc. SPV & Promo
        $this->printSum($print, "Sub Total 1 Rp.", $data->trx->brutto);
        $this->printSum($print, "Disc. SPV Rp.", $data->trx->disc_spv * -1);
        $this->printSum($print, "Disc. Promo Rp.", $data->trx->disc_promo * -1);

        // Netto Service Tax
        $this->sumLine($print);
        $this->printSum($print, "Sub Total 2 Rp.", $data->trx->netto);
        $this->printSum($print, "Service Rp.", $data->trx->service);
        $this->printSum($print, "Tax Rp.", $data->trx->tax);

        // Grand Total
        $this->sumLine($print);
        $this->printSum($print, "Grand Total Rp.", $data->trx->bayar);

        $this->horizontalLine($print);

        $print->selectPrintMode(Printer::MODE_DOUBLE_WIDTH);
        $print->text("  Pembayaran\n");
        $print->selectPrintMode();

        $trx = (object) [
            'payments' => [
                [
                    'type' => (object) ['ket' => 'Cash'],
                    'nominal' => 50000,
                ]
            ],
            'payment' => 50000,
            'kembali' => 37500,
        ];
        foreach ($trx->payments as $v) {
            $v = (object) $v;
            $this->printSum($print, $v->type->ket, $v->nominal);
        }

        $this->sumLine($print);
        $this->printSum($print, "Total Bayar Rp.", $trx->payment);

        $print->text("\n");
        $this->printSum($print, "Kembali Rp.", $trx->kembali);

        $this->horizontalLine($print);

        $print->setJustification(Printer::JUSTIFY_CENTER);
        $print->text("Terima Kasih.\n");
        $print->setJustification(Printer::JUSTIFY_LEFT);

        $this->horizontalLine($print);

        // Cut the receipt
        $print->feed(2);
        $print->cut();
        $print->close();
    }

    public function printSum($print, $title, $price)
    {
        $str = str_pad($title, 35, ' ', STR_PAD_LEFT);
        $netto = str_pad(number_format($price), 10, ' ', STR_PAD_LEFT); // 99,999,999
        $print->text("$str $netto\n");
    }

    public function sumLine($print)
    {
        $print->setJustification(Printer::JUSTIFY_RIGHT);
        $print->textRaw(str_repeat(chr(196), 30) . PHP_EOL);
        $print->setJustification(Printer::JUSTIFY_LEFT);
    }

    public function horizontalLine($print)
    {
        // Print Horizontal Line
        $print->setJustification(Printer::JUSTIFY_CENTER);
        $print->textRaw(str_repeat(chr(196), 47) . PHP_EOL);
        $print->setJustification(Printer::JUSTIFY_LEFT);
    }

    public function twoColumn($left_text, $right_text, $is_double_width = false)
    {
        $cols_width = $is_double_width ? 8 : 16;

        return str_pad($left_text, $cols_width) . str_pad($right_text, $cols_width, ' ', STR_PAD_LEFT);
    }

    public function toCO(Object $item)
    {
        $right_cols = 10;
        $left_cols = 22;

        $item_price = number_format($item->price, 0, ',', '.');
        $item_subtotal = number_format($item->price * $item->qty, 0, ',', '.');

        $print_name = str_pad($item->name, 16);
        $print_priceQty = str_pad($item_price . ' x ' . $item->qty, $left_cols);
        $print_subtotal = str_pad($item_subtotal, $right_cols, ' ', STR_PAD_LEFT);

        return "$print_name\n$print_priceQty$print_subtotal\n";
    }

    public function toString(Object $item)
    {
        $right_cols = 10;
        $left_cols = 22;

        $item_price = number_format($item->price, 0, ',', '.');
        $item_subtotal = number_format($item->price * $item->qty, 0, ',', '.');

        $print_name = str_pad($item->name, 16);
        $print_priceQty = str_pad($item_price . ' x ' . $item->qty, $left_cols);
        $print_subtotal = str_pad($item_subtotal, $right_cols, ' ', STR_PAD_LEFT);

        return "$print_name\n$print_priceQty$print_subtotal\n";
    }

    public function getPrintableSummary($label, $value, $is_double_width = false)
    {
        $left_cols = $is_double_width ? 6 : 12;
        $right_cols = $is_double_width ? 10 : 20;

        $formatted_value = number_format($value, 0, ',', '.');

        return str_pad($label, $left_cols) . str_pad($formatted_value, $right_cols, ' ', STR_PAD_LEFT);
    }
}
