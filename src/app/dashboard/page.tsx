'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { fetchSummary, fetchTransactions } from '@/lib/api';
import { formatRupiah } from '@/lib/whatsapp';
import type { DashboardSummary, Transaksi } from '@/types';

export default function DashboardOverview() {
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [recentTransactions, setRecentTransactions] = useState<Transaksi[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                const [summaryRes, transaksiRes] = await Promise.all([
                    fetchSummary(),
                    fetchTransactions(),
                ]);

                if (summaryRes.success && summaryRes.data) {
                    setSummary(summaryRes.data);
                }
                if (transaksiRes.success && transaksiRes.data) {
                    setRecentTransactions(transaksiRes.data.slice(-5).reverse());
                }
            } catch (err) {
                setError('Gagal memuat data. Pastikan koneksi ke Google Apps Script sudah dikonfigurasi.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    const stats = summary
        ? [
            {
                title: 'Total Revenue',
                value: formatRupiah(summary.totalRevenue),
                subtitle: `${summary.lunasCount} transaksi lunas`,
                icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" x2="12" y1="2" y2="22" />
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                ),
                gradient: 'from-emerald-500/20 to-emerald-600/5',
                iconColor: 'text-emerald-500',
            },
            {
                title: 'Pending',
                value: formatRupiah(summary.totalPending),
                subtitle: `${summary.belumBayarCount} belum bayar`,
                icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>
                ),
                gradient: 'from-amber-500/20 to-amber-600/5',
                iconColor: 'text-amber-500',
            },
            {
                title: 'Pelanggan Aktif',
                value: summary.aktivCustomers.toString(),
                subtitle: `dari ${summary.totalCustomers} total`,
                icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                ),
                gradient: 'from-blue-500/20 to-blue-600/5',
                iconColor: 'text-blue-500',
            },
            {
                title: 'Periode',
                value: summary.currentPeriode,
                subtitle: 'Billing bulan ini',
                icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M8 2v4" />
                        <path d="M16 2v4" />
                        <rect width="18" height="18" x="3" y="4" rx="2" />
                        <path d="M3 10h18" />
                    </svg>
                ),
                gradient: 'from-purple-500/20 to-purple-600/5',
                iconColor: 'text-purple-500',
            },
        ]
        : [];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
                    Dashboard <span className="gradient-text">Overview</span>
                </h1>
                <p className="mt-1 text-muted-foreground">
                    Ringkasan billing dan pelanggan Whome Internet
                </p>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
                    <p className="text-sm text-amber-200">{error}</p>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {loading
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i} className="relative overflow-hidden">
                            <CardHeader className="pb-2">
                                <Skeleton className="h-4 w-24" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-32 mb-2" />
                                <Skeleton className="h-3 w-20" />
                            </CardContent>
                        </Card>
                    ))
                    : stats.map((stat) => (
                        <Card
                            key={stat.title}
                            className="relative overflow-hidden transition-smooth hover:shadow-lg hover:-translate-y-0.5"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient}`} />
                            <CardHeader className="relative flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {stat.title}
                                </CardTitle>
                                <div className={`${stat.iconColor}`}>{stat.icon}</div>
                            </CardHeader>
                            <CardContent className="relative">
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <p className="mt-1 text-xs text-muted-foreground">{stat.subtitle}</p>
                            </CardContent>
                        </Card>
                    ))}
            </div>

            {/* Recent Transactions */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Transaksi Terbaru</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-4">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-3 w-24" />
                                    </div>
                                    <Skeleton className="h-6 w-20" />
                                </div>
                            ))}
                        </div>
                    ) : recentTransactions.length === 0 ? (
                        <div className="py-8 text-center text-muted-foreground">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 opacity-40">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="16" y1="13" x2="8" y2="13" />
                                <line x1="16" y1="17" x2="8" y2="17" />
                            </svg>
                            <p className="text-sm">Belum ada transaksi</p>
                            <p className="text-xs mt-1">Data akan muncul setelah billing di-generate</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {recentTransactions.map((trx) => (
                                <div
                                    key={trx.id_transaksi}
                                    className="flex items-center justify-between rounded-lg border border-border/50 p-3 transition-smooth hover:bg-accent/30"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{trx.nama}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {trx.paket} · {trx.periode}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-semibold">{formatRupiah(trx.harga)}</span>
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
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
