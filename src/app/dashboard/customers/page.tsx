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
import { fetchCustomers } from '@/lib/api';
import { formatRupiah } from '@/lib/whatsapp';
import type { Pelanggan } from '@/types';

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Pelanggan[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetchCustomers();
            if (res.success && res.data) {
                setCustomers(res.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const filteredCustomers = customers.filter(
        (c) =>
            c.nama.toLowerCase().includes(search.toLowerCase()) ||
            c.alamat.toLowerCase().includes(search.toLowerCase()) ||
            c.no_hp.includes(search) ||
            c.paket.toLowerCase().includes(search.toLowerCase())
    );

    const activeCount = customers.filter((c) => c.status === 'Aktif').length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
                    Data <span className="gradient-text">Pelanggan</span>
                </h1>
                <p className="mt-1 text-muted-foreground">
                    Kelola data pelanggan Whome Internet
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-3 grid-cols-2">
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground">Total Pelanggan</p>
                        <p className="text-2xl font-bold">{customers.length}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground">Aktif</p>
                        <p className="text-2xl font-bold text-emerald-500">{activeCount}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Table */}
            <Card>
                <CardHeader className="pb-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <CardTitle className="text-lg">Daftar Pelanggan</CardTitle>
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
                                    placeholder="Cari nama, alamat, HP..."
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
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <Skeleton className="h-4 flex-1" />
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-20" />
                                </div>
                            ))}
                        </div>
                    ) : filteredCustomers.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 opacity-40">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                            </svg>
                            <p className="text-sm">
                                {search
                                    ? `Tidak ditemukan hasil untuk "${search}"`
                                    : 'Belum ada data pelanggan'}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto -mx-6">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="pl-6">Nama</TableHead>
                                        <TableHead className="hidden sm:table-cell">Alamat</TableHead>
                                        <TableHead>No. HP</TableHead>
                                        <TableHead className="hidden md:table-cell">Paket</TableHead>
                                        <TableHead className="hidden md:table-cell">Harga</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="hidden lg:table-cell pr-6">Tgl. Daftar</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredCustomers.map((customer) => (
                                        <TableRow
                                            key={customer.id_pelanggan}
                                            className="transition-smooth hover:bg-accent/30"
                                        >
                                            <TableCell className="pl-6">
                                                <div>
                                                    <p className="font-medium">{customer.nama}</p>
                                                    <p className="text-xs text-muted-foreground sm:hidden truncate max-w-[150px]">
                                                        {customer.alamat}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell text-muted-foreground max-w-[200px] truncate">
                                                {customer.alamat}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {customer.no_hp}
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell text-muted-foreground">
                                                {customer.paket}
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell font-medium">
                                                {formatRupiah(customer.harga)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={customer.status === 'Aktif' ? 'default' : 'secondary'}
                                                    className={
                                                        customer.status === 'Aktif'
                                                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                                            : 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30'
                                                    }
                                                >
                                                    {customer.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="hidden lg:table-cell text-muted-foreground pr-6">
                                                {customer.tgl_daftar}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {/* Table Footer */}
                    {!loading && filteredCustomers.length > 0 && (
                        <div className="mt-4 flex items-center justify-between border-t pt-4 text-sm text-muted-foreground">
                            <span>
                                Menampilkan {filteredCustomers.length} dari {customers.length} pelanggan
                            </span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
