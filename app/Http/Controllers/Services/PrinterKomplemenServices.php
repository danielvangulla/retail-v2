<?php

namespace App\Http\Controllers\Services;

use App\Models\Transaksi;

use Mike42\Escpos\Printer;
use Mike42\Escpos\CapabilityProfile;
use Mike42\Escpos\PrintConnectors\NetworkPrintConnector;
// use Mike42\Escpos\PrintConnectors\WindowsPrintConnector;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class PrinterKomplemenServices extends BasePrinter implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $printer;
    protected $transaksi_id;

    public function __construct(Object $printer, int $transaksi_id)
    {
        $this->printer = $printer;
        $this->transaksi_id = $transaksi_id;
    }

    public function handle(): void
    {
        $trx = Transaksi::with('komplemen')
            ->with(['details' => function ($query) {
                $query->selectRaw('transaksi_id, sku, sum(qty) as qty, sum(netto) as netto, user_order_id');
                $query->where('qty', '>', 0);

                $query->with(['barang' => function ($query) {
                    $query->select('sku', 'deskripsi');
                }]);

                $query->with(['captain' => function ($query) {
                    $query->select('id', 'name');
                }]);

                $query->groupBy('transaksi_id', 'user_order_id', 'sku');
            }])->with(['kasir' => function ($query) {
                $query->select('id', 'name');
            }])->where('id', $this->transaksi_id)->first();

        $data = (object) [
            'printer_name' => $this->printer->nama,
            'printer_ip' => $this->printer->ip_address,
            'jam' => Date('Y-m-d H:i:s'),
            'trx' => $trx,
            'items' => [],
        ];

        foreach ($trx->details as $v) {
            $data->items[] = [
                'qty' => $v->qty,
                'deskripsi' => $v->barang->deskripsi,
                'netto' => $v->netto,
                'captain' => $v->captain->name,
            ];
        }

        $this->startPrint($data);
    }

    public function startPrint(Object $data)
    {
        $header = $this->header();

        // $connector = new WindowsPrintConnector("smb://$data->printer_ip/$data->printer_name");
        $connector = new NetworkPrintConnector($data->printer_ip);
        $profile = CapabilityProfile::load("default");
        $print = new Printer($connector, $profile);

        // Init printer settings
        $print->initialize();

        // Nama Perusahaan
        $print->setJustification(Printer::JUSTIFY_CENTER);
        $print->setTextSize(3, 2);
        $print->text("$header->perusahaan\n");
        $print->setTextSize(1, 1);

        // Alamat
        $print->text("$header->alamat1\n");
        $print->text("$header->alamat2\n");

        $this->horizontalLine($print);

        // Timestamp Print
        $print->setJustification(Printer::JUSTIFY_CENTER);
        $print->setFont(Printer::FONT_B);
        $print->text(date('j F Y H:i:s') . "\n");
        $print->setFont(Printer::FONT_A);

        // Other
        $print->selectPrintMode(Printer::MODE_DOUBLE_WIDTH);
        $print->text("MEJA {$data->trx->meja}\n");
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
        $this->printSum($print, "Sub Total 3 Rp.", $data->trx->bayar);
        $this->printSum($print, "COMPLIMENT by {$data->trx->komplemen->name} Rp.", $data->trx->bayar);
        $this->sumLine($print);
        $this->printSum($print, "Grand Total Rp.", 0);

        $print->feed();

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
}
