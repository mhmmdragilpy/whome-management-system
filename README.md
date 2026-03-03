# Whome Management System v2

## Overview
Whome Management System v2 is an ISP management dashboard built for handling billing, tracking customers, and seamless WhatsApp-based notifications. It leverages Next.js on the frontend and uses Google Sheets via Google Apps Script (GAS) as an accessible, serverless backend database.

## Features
- **Dashboard Overview:** Track total active users, monthly revenue, pending payments, and overall growth.
- **Customer Management:** Keep track of users with statuses like Active, and manage detailed profiles including service plans and connection IPs.
- **Automated Billing Workflow:** Auto-generate billing on the 1st of every month for all active customers, with a fixed due date on the 5th.
- **WhatsApp Integration:** No PDF or local storage required. All notifications operate via WhatsApp Click-to-Chat links, making it exceptionally easy to communicate with clients about their billing status.
- **API Security:** API key validation integrated into all Google Apps Script REST requests.

## Tech Stack
- **Frontend Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Shadcn UI
- **Backend / Database:** Google Sheets API accessed via Google Apps Script (GAS) REST API
- **Deployment:**
  - *Frontend:* Vercel
  - *Backend:* Google Web App (Apps Script)

## Getting Started

First, ensure all environment variables are properly set. You can use `.env.example` as a template to create your `.env.local` file:

```bash
cp .env.example .env.local
```

Next, install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

Start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the dashboard.

## Deployment Backend (Google Apps Script)
1. Navigate to the `gas/` folder to view the backend scripts.
2. Ensure you have `clasp` (Command Line Apps Script Projects) installed and authenticated.
3. Push your code to the designated Apps Script project:
```bash
clasp push
```
4. Deploy the script as a Web App in the Google Apps Script editor, and retrieve the deployment URL.
5. Update your `NEXT_PUBLIC_API_URL` environment variable within your Next.js project.
