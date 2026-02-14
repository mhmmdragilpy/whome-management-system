'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { toast } from 'sonner';

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate a slight delay for UX
        await new Promise((resolve) => setTimeout(resolve, 800));

        if (username === 'admin' && password === 'adminwhome') {
            // Set auth cookie/session
            document.cookie = `whome_auth=authenticated; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;
            toast.success('Login berhasil!', { description: 'Selamat datang, Admin' });
            router.push('/dashboard');
        } else {
            toast.error('Login gagal', { description: 'Username atau password salah' });
            setLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
            {/* Background gradient */}
            <div className="absolute inset-0 whome-gradient opacity-90" />

            {/* Floating decorative elements */}
            <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-white/5 blur-3xl animate-float" />
            <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-white/5 blur-3xl animate-float-delayed" />
            <div className="absolute top-1/2 left-1/3 h-48 w-48 rounded-full bg-white/3 blur-2xl animate-float-delayed" />

            {/* Grid pattern overlay */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
                    backgroundSize: '60px 60px',
                }}
            />

            {/* Login card */}
            <Card className="relative z-10 w-full max-w-md border border-white/10 bg-background/80 glass shadow-2xl">
                <CardHeader className="space-y-4 pb-2 pt-8 text-center">
                    {/* Logo */}
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl whome-gradient shadow-lg shadow-blue-500/25">
                        <span className="text-2xl font-black text-white tracking-tight">W</span>
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            <span className="gradient-text">Whome</span>
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">Management System</p>
                    </div>
                </CardHeader>

                <CardContent className="px-8 pb-8 pt-4">
                    <form onSubmit={handleLogin} className="space-y-5">
                        {/* Username */}
                        <div className="space-y-2">
                            <label htmlFor="username" className="text-sm font-medium text-foreground">
                                Username
                            </label>
                            <div className="relative">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                >
                                    <circle cx="12" cy="8" r="5" />
                                    <path d="M20 21a8 8 0 0 0-16 0" />
                                </svg>
                                <Input
                                    id="username"
                                    type="text"
                                    placeholder="Masukkan username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="pl-10 h-11"
                                    required
                                    autoComplete="username"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium text-foreground">
                                Password
                            </label>
                            <div className="relative">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                >
                                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Masukkan password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 pr-10 h-11"
                                    required
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-smooth"
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                            <line x1="1" y1="1" x2="23" y2="23" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <Button
                            type="submit"
                            className="w-full h-11 whome-gradient text-white font-semibold hover:opacity-90 transition-smooth"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Masuk...
                                </div>
                            ) : (
                                'Masuk'
                            )}
                        </Button>
                    </form>

                    {/* Footer */}
                    <div className="mt-6 text-center">
                        <p className="text-xs text-muted-foreground">
                            © 2026 Whome Internet. All rights reserved.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
