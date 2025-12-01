interface CartSummaryProps {
    totalQty: number;
    totalDisc: number;
    totalPromo: number;
    totalCharge: number;
    grandTotal: number;
    formatNumber: (num: number) => string;
}

export default function CartSummary({
    totalQty,
    totalDisc,
    totalPromo,
    totalCharge,
    grandTotal,
    formatNumber,
}: CartSummaryProps) {
    return (
        <div className="mt-auto pt-2 sm:pt-3 border-t border-slate-600 bg-slate-800/50">
            <div className="space-y-1.5 sm:space-y-2 text-slate-200">
                <div className="flex justify-between text-xs sm:text-sm">
                    <span>Total Item:</span>
                    <span className="font-medium">{totalQty}</span>
                </div>
                {totalDisc > 0 && (
                    <div className="flex justify-between text-xs sm:text-sm text-amber-400">
                        <span>Diskon SPV:</span>
                        <span className="font-medium">- Rp {formatNumber(totalDisc)}</span>
                    </div>
                )}
                {totalPromo > 0 && (
                    <div className="flex justify-between text-xs sm:text-sm text-emerald-400">
                        <span>Promo:</span>
                        <span className="font-medium">- Rp {formatNumber(totalPromo)}</span>
                    </div>
                )}
                {totalCharge > 0 && (
                    <div className="flex justify-between text-xs sm:text-sm text-orange-400">
                        <span>Biaya:</span>
                        <span className="font-medium">+ Rp {formatNumber(totalCharge)}</span>
                    </div>
                )}
                <div className="flex justify-between pt-2 border-t border-slate-600">
                    <span className="font-semibold text-sm sm:text-base">Grand Total:</span>
                    <span className="font-bold text-lg sm:text-xl text-blue-400">
                        Rp {formatNumber(grandTotal)}
                    </span>
                </div>
            </div>
        </div>
    );
}
