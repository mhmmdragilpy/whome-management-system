// ── API Helper Functions ──
// Fetches data from our Next.js API routes (which proxy to GAS)

import { ApiResponse, DashboardSummary, Pelanggan, Transaksi } from '@/types';

const BASE_URL = '/api';

/**
 * Fetch dashboard summary data
 */
export async function fetchSummary(): Promise<ApiResponse<DashboardSummary>> {
    const res = await fetch(`${BASE_URL}/billing?action=summary`);
    if (!res.ok) throw new Error('Failed to fetch summary');
    return res.json();
}

/**
 * Fetch all customers
 */
export async function fetchCustomers(): Promise<ApiResponse<Pelanggan[]>> {
    const res = await fetch(`${BASE_URL}/customers`);
    if (!res.ok) throw new Error('Failed to fetch customers');
    return res.json();
}

/**
 * Fetch all transactions
 */
export async function fetchTransactions(): Promise<ApiResponse<Transaksi[]>> {
    const res = await fetch(`${BASE_URL}/billing`);
    if (!res.ok) throw new Error('Failed to fetch transactions');
    return res.json();
}

/**
 * Confirm a payment as "Lunas"
 */
export async function confirmPayment(idTransaksi: string): Promise<ApiResponse<null>> {
    const res = await fetch(`${BASE_URL}/billing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            action: 'konfirmasi_lunas',
            id_transaksi: idTransaksi,
        }),
    });
    if (!res.ok) throw new Error('Failed to confirm payment');
    return res.json();
}

/**
 * Add a new customer
 */
export async function addCustomer(customer: {
    nama: string;
    alamat: string;
    no_hp: string;
    paket: string;
    harga: number;
}): Promise<ApiResponse<null>> {
    const res = await fetch(`${BASE_URL}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            action: 'add_customer',
            ...customer,
        }),
    });
    if (!res.ok) throw new Error('Failed to add customer');
    return res.json();
}
