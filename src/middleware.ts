import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if the path is a protected dashboard route
    if (pathname.startsWith('/dashboard')) {
        const authCookie = request.cookies.get('whome_auth');

        // If not authenticated, redirect to login
        if (!authCookie || authCookie.value !== 'authenticated') {
            const loginUrl = new URL('/login', request.url);
            return NextResponse.redirect(loginUrl);
        }
    }

    // If already authenticated and trying to access login, redirect to dashboard
    if (pathname === '/login') {
        const authCookie = request.cookies.get('whome_auth');
        if (authCookie && authCookie.value === 'authenticated') {
            const dashboardUrl = new URL('/dashboard', request.url);
            return NextResponse.redirect(dashboardUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/login'],
};
