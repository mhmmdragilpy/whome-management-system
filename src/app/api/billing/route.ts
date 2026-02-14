// ── /api/billing – Proxy to Google Apps Script ──
// Handles GET (fetch transactions/summary) and POST (confirm payment)

import { NextRequest, NextResponse } from 'next/server';

const GAS_URL = process.env.GAS_WEB_APP_URL!;
const API_KEY = process.env.GAS_API_KEY!;

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action') || 'fetch';

        const url = new URL(GAS_URL);
        url.searchParams.set('api_key', API_KEY);
        url.searchParams.set('sheet', 'transaksi');
        url.searchParams.set('action', action);

        const response = await fetch(url.toString(), {
            method: 'GET',
            redirect: 'follow',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Billing GET error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch billing data' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const url = new URL(GAS_URL);
        url.searchParams.set('api_key', API_KEY);

        const response = await fetch(url.toString(), {
            method: 'POST',
            redirect: 'follow',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Billing POST error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update billing data' },
            { status: 500 }
        );
    }
}
