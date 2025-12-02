/**
 * Format tanggal ke format "d M Y" (contoh: "1 Des 2025")
 */
export const formatTgl = (dateString: string): string => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

    // Handle berbagai format tanggal dari Laravel
    let date: Date;
    if (typeof dateString === 'string') {
        // Jika string berupa ISO format atau dengan timezone, buat Date object
        date = new Date(dateString);
    } else {
        date = new Date();
    }

    if (isNaN(date.getTime())) return '—';

    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
};

/**
 * Format waktu ke format "HH:MM:SS" (contoh: "14:30:45")
 */
export const formatTime = (dateString: string): string => {
    let date: Date;
    if (typeof dateString === 'string') {
        date = new Date(dateString);
    } else {
        date = new Date();
    }

    if (isNaN(date.getTime())) return '—';

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
};

/**
 * Format tanggal dan waktu ke format "d M Y HH:MM:SS"
 */
export const formatDateTime = (dateString: string): string => {
    let date: Date;
    if (typeof dateString === 'string') {
        date = new Date(dateString);
    } else {
        date = new Date();
    }

    if (isNaN(date.getTime())) return '—';

    return `${formatTgl(dateString)} ${formatTime(dateString)}`;
};

/**
 * Format angka dengan pemisah ribuan dan desimal opsional (0-2 digit)
 * Contoh: 1000 -> "1.000", 1000.5 -> "1.000,5", 1000.75 -> "1.000,75"
 */
export const formatDigit = (value: number | string): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(num)) return '0';

    // Cek apakah ada desimal
    const hasDecimal = num % 1 !== 0;

    if (hasDecimal) {
        // Format dengan maksimal 2 desimal, hapus trailing zeros
        return num.toLocaleString('id-ID', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        });
    }

    // Jika tidak ada desimal, format tanpa desimal
    return num.toLocaleString('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
};
