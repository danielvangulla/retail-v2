<?php

namespace App\Models;

use App\Http\Controllers\Helpers;
use App\Traits\HasQueue;
use DateTime;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class Transaksi extends Model
{
    use HasFactory, HasUuids, HasQueue;

    protected $primaryKey = 'id';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $table = 'transaksis';

    protected $guarded = ['id'];

    protected $hidden = [
        // 'created_at',
        'updated_at',
    ];

    protected $casts = [];

    public function kasir()
    {
        return $this->belongsTo(User::class, 'user_kasir_id');
    }

    public function spv()
    {
        return $this->belongsTo(User::class, 'user_spv_id');
    }

    public function details()
    {
        return $this->hasMany(TransaksiDetail::class, 'transaksi_id');
    }

    public function payments()
    {
        return $this->hasMany(TransaksiPayment::class);
    }

    public function komplemen()
    {
        return $this->belongsTo(User::class, 'komplemen_id');
    }

    public function piutang()
    {
        return $this->belongsTo(Piutang::class);
    }

    public function piutangBayar()
    {
        return $this->hasOne(PiutangBayar::class);
    }

    public static function getLastTrxByKasir()
    {
        $kasirId = Auth::user()->id;
        $trx = self::with(['payments', 'payments.type', 'details', 'details.barang', 'piutang', 'komplemen'])
            ->where('user_kasir_id', $kasirId)
            ->orderBy('created_at', 'desc')
            ->first();

        return $trx;
    }

    public static function getActive($nomor_meja)
    {
        return self::where('meja', $nomor_meja)
            ->where('status', '!=', 0)
            ->where('is_cancel', 0)
            ->first();
    }

    public static function getActives()
    {
        return self::where('is_cancel', 0)
            ->where('is_cancel', 0)
            ->get();
    }

    public static function existsNotToday(): bool
    {
        $tgl = Helpers::transactionDate();
        $trx = self::where('tgl', '<', $tgl)
            ->where('is_cancel', 0)
            ->count();

        if ($trx > 0) {
            return true;
        }
        return false;
    }

    public static function recountTrx($trx_id): void
    {
        $trx = self::find($trx_id);
        $trx->brutto = 0;
        $trx->disc_spv = 0;
        $trx->disc_promo = 0;
        $trx->netto = 0;
        $trx->service = 0;
        $trx->tax = 0;
        $trx->bayar = 0;

        $nama_promos = [];
        foreach ($trx->details as $v) {
            $trx->brutto += $v->brutto;
            $trx->disc_spv += $v->disc_spv;
            $trx->disc_promo += $v->disc_promo;
            $trx->netto += $v->netto;
            $trx->service += $v->service;
            $trx->tax += $v->tax;
            $trx->bayar += $v->bayar;

            if ($v->nama_promo !== '') {
                $nama_promos[] = $v->nama_promo;
            }
        }

        $nama_promo = implode(", ", array_unique($nama_promos));

        $trx->nama_promo = $nama_promo;
        $trx->save();
    }
}
