import { useMemo } from 'react';
import { BarangItem } from '@/components/kasir/types';

export default function useKasirCalculations(
    selectedItems: BarangItem[],
    isPiutang: boolean,
    isStaff: boolean
) {
    const calculatedData = useMemo(() => {
        let newTotalDisc = 0;
        let newTotalPromo = 0;
        let newTotalCharge = 0;
        let newGrandTotal = 0;
        let newTotalQty = 0;

        const updatedItems = selectedItems.map(item => {
            const v = { ...item };

            if (!v.disc_spv) v.disc_spv = 0;
            v.hargaJual = v.harga_jual1;
            v.namaPromo = '';
            v.disc_promo = 0;
            v.charge = 0;

            if (isPiutang) {
                v.charge = v.harga_jual2;
            }

            if (isStaff) {
                v.charge = 0;
            }

            if (v.multiplier && v.charge) {
                v.charge *= (v.qty || 1);
            }

            v.total = ((v.qty || 1) * v.hargaJual) - v.disc_spv - v.disc_promo;

            if (isPiutang) {
                v.total += parseFloat(String(v.charge || 0));
            }

            newTotalDisc += parseFloat(String(v.disc_spv));
            newTotalPromo += parseFloat(String(v.disc_promo));
            newTotalCharge += parseFloat(String(v.charge || 0));
            newGrandTotal += parseFloat(String(v.total || 0));
            newTotalQty += (v.qty || 0);

            return v;
        });

        return {
            calculatedItems: updatedItems,
            totalDisc: newTotalDisc,
            totalPromo: newTotalPromo,
            totalCharge: newTotalCharge,
            grandTotal: newGrandTotal,
            totalQty: newTotalQty
        };
    }, [selectedItems, isPiutang, isStaff]);

    return calculatedData;
}
