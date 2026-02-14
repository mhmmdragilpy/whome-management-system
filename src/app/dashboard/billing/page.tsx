'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { fetchTransactions, fetchCustomers, confirmPayment } from '@/lib/api';
import { formatRupiah, formatPeriode, generateWhatsAppLinkWithPhone } from '@/lib/whatsapp';
import type { Transaksi, Pelanggan } from '@/types';

export default function BillingPage() {
    const [transactions, setTransactions] = useState<Transaksi[]>([]);
    const [customers, setCustomers] = useState<Pelanggan[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'Lunas' | 'Belum Bayar'>('all');
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        transaction: Transaksi | null;
    }>({ open: false, transaction: null });
    const [confirming, setConfirming] = useState(false);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [trxRes, custRes] = await Promise.all([
                fetchTransactions(),
                fetchCustomers(),
            ]);

            if (trxRes.success && trxRes.data) {
                setTransactions(trxRes.data);
            }
            if (custRes.success && custRes.data) {
                setCustomers(custRes.data);
            }
        } catch (err) {
            toast.error('Gagal memuat data billing');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Find customer phone by pelanggan ID
    const getCustomerPhone = (idPelanggan: string): string => {
        const customer = customers.find((c) => c.id_pelanggan === idPelanggan);
        return customer?.no_hp || '';
    };

    // Filter transactions
    const filteredTransactions = transactions.filter((trx) => {
        const matchSearch =
            trx.nama.toLowerCase().includes(search.toLowerCase()) ||
            trx.paket.toLowerCase().includes(search.toLowerCase()) ||
            trx.id_transaksi.toLowerCase().includes(search.toLowerCase());

        const matchStatus =
            statusFilter === 'all' || trx.status_bayar === statusFilter;

        return matchSearch && matchStatus;
    });

    // Handle confirm payment
    const handleConfirmPayment = async () => {
        if (!confirmDialog.transaction) return;

        try {
            setConfirming(true);
            const res = await confirmPayment(confirmDialog.transaction.id_transaksi);

            if (res.success) {
                toast.success('Pembayaran dikonfirmasi!', {
                    description: `${confirmDialog.transaction.nama} - ${formatRupiah(confirmDialog.transaction.harga)}`,
                });
                // Update local state
                setTransactions((prev) =>
                    prev.map((trx) =>
                        trx.id_transaksi === confirmDialog.transaction!.id_transaksi
                            ? { ...trx, status_bayar: 'Lunas' as const, tgl_bayar: new Date().toISOString() }
                            : trx
                    )
                );
            } else {
                toast.error('Gagal mengkonfirmasi pembayaran', {
                    description: res.error || 'Terjadi kesalahan',
                });
            }
        } catch (err) {
            toast.error('Gagal mengkonfirmasi pembayaran');
            console.error(err);
        } finally {
            setConfirming(false);
            setConfirmDialog({ open: false, transaction: null });
        }
    };

    // Handle WhatsApp click
    const handleWhatsApp = (trx: Transaksi) => {
        const phone = getCustomerPhone(trx.id_pelanggan);
        if (!phone) {
            toast.warning('Nomor HP tidak ditemukan', {
                description: 'Data pelanggan belum memiliki nomor HP',
            });
            return;
        }
        const url = generateWhatsAppLinkWithPhone(phone, trx);
        window.open(url, '_blank');
    };

    const lunasCount = transactions.filter((t) => t.status_bayar === 'Lunas').length;
    const belumBayarCount = transactions.filter((t) => t.status_bayar === 'Belum Bayar').length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
                    <span className="gradient-text">Billing</span> Management
                </h1>
                <p className="mt-1 text-muted-foreground">
                    Kelola tagihan dan konfirmasi pembayaran pelanggan
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-3 grid-cols-3">
                <Card
                    className={`cursor-pointer transition-smooth hover:shadow-md ${statusFilter === 'all' ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setStatusFilter('all')}
                >
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className="text-xl font-bold">{transactions.length}</p>
                    </CardContent>
                </Card>
                <Card
                    className={`cursor-pointer transition-smooth hover:shadow-md ${statusFilter === 'Lunas' ? 'ring-2 ring-emerald-500' : ''}`}
                    onClick={() => setStatusFilter('Lunas')}
                >
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground">Lunas</p>
                        <p className="text-xl font-bold text-emerald-500">{lunasCount}</p>
                    </CardContent>
                </Card>
                <Card
                    className={`cursor-pointer transition-smooth hover:shadow-md ${statusFilter === 'Belum Bayar' ? 'ring-2 ring-red-500' : ''}`}
                    onClick={() => setStatusFilter('Belum Bayar')}
                >
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground">Belum Bayar</p>
                        <p className="text-xl font-bold text-red-500">{belumBayarCount}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Search & Table */}
            <Card>
                <CardHeader className="pb-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <CardTitle className="text-lg">Daftar Tagihan</CardTitle>
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1 sm:w-72">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                >
                                    <circle cx="11" cy="11" r="8" />
                                    <path d="m21 21-4.3-4.3" />
                                </svg>
                                <Input
                                    placeholder="Cari nama, paket, atau ID..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <Button variant="outline" size="sm" onClick={loadData}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                                    <path d="M3 3v5h5" />
                                    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                                    <path d="M16 16h5v5" />
                                </svg>
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <Skeleton className="h-4 flex-1" />
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-8 w-32" />
                                </div>
                            ))}
                        </div>
                    ) : filteredTransactions.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 opacity-40">
                                <circle cx="11" cy="11" r="8" />
                                <path d="m21 21-4.3-4.3" />
                            </svg>
                            <p className="text-sm">
                                {search
                                    ? `Tidak ditemukan hasil untuk "${search}"`
                                    : 'Belum ada data tagihan'}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto -mx-6">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="pl-6">Nama</TableHead>
                                        <TableHead className="hidden sm:table-cell">Paket</TableHead>
                                        <TableHead>Jumlah</TableHead>
                                        <TableHead className="hidden md:table-cell">Periode</TableHead>
                                        <TableHead className="hidden md:table-cell">Jatuh Tempo</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="pr-6 text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredTransactions.map((trx) => (
                                        <TableRow
                                            key={trx.id_transaksi}
                                            className="transition-smooth hover:bg-accent/30"
                                        >
                                            <TableCell className="pl-6">
                                                <div>
                                                    <p className="font-medium">{trx.nama}</p>
                                                    <p className="text-xs text-muted-foreground sm:hidden">
                                                        {trx.paket}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell text-muted-foreground">
                                                {trx.paket}
                                            </TableCell>
                                            <TableCell className="font-semibold">
                                                {formatRupiah(trx.harga)}
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell text-muted-foreground">
                                                {formatPeriode(trx.periode)}
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell text-muted-foreground">
                                                {trx.tgl_jatuh_tempo}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={trx.status_bayar === 'Lunas' ? 'default' : 'destructive'}
                                                    className={
                                                        trx.status_bayar === 'Lunas'
                                                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                                                            : 'bg-red-500/15 text-red-400 border-red-500/30 hover:bg-red-500/20'
                                                    }
                                                >
                                                    {trx.status_bayar}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="pr-6">
                                                <div className="flex items-center justify-end gap-2">
                                                    {trx.status_bayar === 'Belum Bayar' && (
                                                        <>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-8 gap-1.5 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10"
                                                                onClick={() => handleWhatsApp(trx)}
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                                                </svg>
                                                                <span className="hidden sm:inline">Tagih WA</span>
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                className="h-8 gap-1.5"
                                                                onClick={() =>
                                                                    setConfirmDialog({ open: true, transaction: trx })
                                                                }
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                    <path d="M20 6 9 17l-5-5" />
                                                                </svg>
                                                                <span className="hidden sm:inline">Lunas</span>
                                                            </Button>
                                                        </>
                                                    )}
                                                    {trx.status_bayar === 'Lunas' && (
                                                        <span className="text-xs text-muted-foreground">
                                                            {trx.tgl_bayar || '✓'}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {/* Table Footer */}
                    {!loading && filteredTransactions.length > 0 && (
                        <div className="mt-4 flex items-center justify-between border-t pt-4 text-sm text-muted-foreground">
                            <span>
                                Menampilkan {filteredTransactions.length} dari {transactions.length} tagihan
                            </span>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Confirm Payment Dialog */}
            <Dialog
                open={confirmDialog.open}
                onOpenChange={(open) => {
                    if (!confirming) setConfirmDialog({ open, transaction: null });
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Konfirmasi Pembayaran</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin mengkonfirmasi pembayaran berikut?
                        </DialogDescription>
                    </DialogHeader>
                    {confirmDialog.transaction && (
                        <div className="rounded-lg border p-4 space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Nama</span>
                                <span className="text-sm font-medium">{confirmDialog.transaction.nama}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Paket</span>
                                <span className="text-sm">{confirmDialog.transaction.paket}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Jumlah</span>
                                <span className="text-sm font-bold">
                                    {formatRupiah(confirmDialog.transaction.harga)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Periode</span>
                                <span className="text-sm">
                                    {formatPeriode(confirmDialog.transaction.periode)}
                                </span>
                            </div>
                        </div>
                    )}
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setConfirmDialog({ open: false, transaction: null })}
                            disabled={confirming}
                        >
                            Batal
                        </Button>
                        <Button onClick={handleConfirmPayment} disabled={confirming}>
                            {confirming ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Memproses...
                                </>
                            ) : (
                                'Ya, Konfirmasi Lunas'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
