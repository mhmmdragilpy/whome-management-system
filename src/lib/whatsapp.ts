// ── WhatsApp Click-to-Chat Link Generator ──

import { Transaksi } from '@/types';

/**
 * Format currency to Indonesian Rupiah
 */
export function formatRupiah(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

/**
 * Format a periode string (yyyy-MM) to a readable month name
 */
export function formatPeriode(periode: string): string {
    const [year, month] = periode.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
}

/**
 * Generate a WhatsApp click-to-chat link for billing reminder
 */
export function generateWhatsAppLink(transaksi: Transaksi): string {
    // Remove leading 0 and add 62 for Indonesia country code
    let phone = transaksi.nama; // We'll need the phone number from the parent data

    const message = `Assalamualaikum, Bapak/Ibu *${transaksi.nama}*.\n\n` +
        `Ini adalah pengingat tagihan internet Whome:\n\n` +
        `📋 *Detail Tagihan:*\n` +
        `├ Paket: ${transaksi.paket}\n` +
        `├ Periode: ${formatPeriode(transaksi.periode)}\n` +
        `├ Jumlah: *${formatRupiah(transaksi.harga)}*\n` +
        `└ Jatuh Tempo: *${transaksi.tgl_jatuh_tempo}*\n\n` +
        `Mohon segera lakukan pembayaran sebelum tanggal jatuh tempo.\n\n` +
        `Terima kasih 🙏\n` +
        `_Whome Internet_`;

    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/?text=${encodedMessage}`;
}

/**
 * Generate a WhatsApp link with phone number
 */
export function generateWhatsAppLinkWithPhone(
    phoneNumber: string,
    transaksi: Transaksi
): string {
    // Normalize phone number: remove spaces, dashes, and leading 0
    let phone = phoneNumber.replace(/[\s-]/g, '');
    if (phone.startsWith('0')) {
        phone = '62' + phone.substring(1);
    } else if (!phone.startsWith('62')) {
        phone = '62' + phone;
    }

    const message = `Assalamualaikum, Bapak/Ibu *${transaksi.nama}*.\n\n` +
        `Ini adalah pengingat tagihan internet Whome:\n\n` +
        `📋 *Detail Tagihan:*\n` +
        `├ Paket: ${transaksi.paket}\n` +
        `├ Periode: ${formatPeriode(transaksi.periode)}\n` +
        `├ Jumlah: *${formatRupiah(transaksi.harga)}*\n` +
        `└ Jatuh Tempo: *${transaksi.tgl_jatuh_tempo}*\n\n` +
        `Mohon segera lakukan pembayaran sebelum tanggal jatuh tempo.\n\n` +
        `Terima kasih 🙏\n` +
        `_Whome Internet_`;

    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${phone}?text=${encodedMessage}`;
}
