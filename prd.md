# Whome Management System v2 – PRD

## Overview
ISP management dashboard for billing, customer tracking, and WhatsApp-based notifications.

## Tech Stack
- **Frontend**: Next.js 16 (App Router) + TypeScript + Tailwind CSS + Shadcn UI
- **Backend/DB**: Google Sheets via Google Apps Script (GAS) REST API
- **Deployment**: Vercel (Frontend) + Google Web App (Backend)

## Core Business Rules
1. **Billing Cycle**: Auto-generate billing on the 1st of every month for all "Aktif" customers
2. **Due Date**: Fixed to the 5th of every month
3. **No PDF/Storage**: All notifications via WhatsApp Click-to-Chat links
4. **API Security**: API_KEY validation on all GAS requests

## Directory Structure
```
Whome-Management-System v2/
├── gas/                        # Google Apps Script backend
│   ├── Code.gs                 # Main GAS script
│   └── appsscript.json         # GAS manifest
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── billing/route.ts    # Billing API proxy
│   │   │   └── customers/route.ts  # Customers API proxy
│   │   ├── dashboard/
│   │   │   ├── layout.tsx          # Dashboard layout + sidebar
│   │   │   ├── page.tsx            # Overview page
│   │   │   ├── billing/page.tsx    # Billing management
│   │   │   └── customers/page.tsx  # Customer data
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/ui/          # Shadcn UI components
│   ├── lib/
│   │   ├── api.ts              # API helper functions
│   │   ├── whatsapp.ts         # WA link generator
│   │   └── utils.ts            # Shadcn utilities
│   └── types/index.ts          # TypeScript interfaces
├── .env.local                  # Environment variables
├── .env.example
├── package.json
└── tsconfig.json
```
