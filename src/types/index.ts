// ── TypeScript Interfaces for Whome Management System ──

export interface Pelanggan {
  id_pelanggan: string;
  nama: string;
  alamat: string;
  no_hp: string;
  paket: string;
  harga: number;
  status: 'Aktif' | 'Nonaktif';
  tgl_daftar: string;
}

export interface Transaksi {
  id_transaksi: string;
  id_pelanggan: string;
  nama: string;
  paket: string;
  harga: number;
  periode: string;
  status_bayar: 'Lunas' | 'Belum Bayar';
  tgl_jatuh_tempo: string;
  tgl_bayar: string;
}

export interface DashboardSummary {
  totalCustomers: number;
  aktivCustomers: number;
  totalRevenue: number;
  totalPending: number;
  lunasCount: number;
  belumBayarCount: number;
  currentPeriode: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
