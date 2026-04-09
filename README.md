# Goldify — Phygital Pre-Owned Jewelry Valuation & Liquidation Platform

A seamless, end-to-end platform bridging the physical and digital worlds for estimating, booking, and liquidating pre-owned jewelry. 

Next.js  Firebase  React  TypeScript  TailwindCSS

![Goldify Demo](/docs/goldify_demo_video.webp)

## What Is This
Goldify turns the fragmented process of jewelry appraisal and liquidation into a unified, transparent, and highly secure pipeline. Whether it's providing instant online estimates, securing physical appointments, or tracking refinery payouts, Goldify handles it all. 

Features an integrated pipeline that:
*   **Calculates real-time estimates** based on current rates and item details.
*   **Manages secure bookings** connected to a robust Firebase backend.
*   **Tracks assets** from initial drop-off at a physical location to the final refinery liquidation.
*   **Empowers staff** with a comprehensive dashboard to view new bookings, scan items via QR, and analyze metrics.

**Built for security and scale:** Leveraging Next.js and Firebase (Firestore + Storage) with strict, production-ready security rules, Goldify ensures all customer data, transactions, and live tracking modules are protected at every step.

## Features

| Feature | Description |
| :--- | :--- |
| **Real-Time Estimator** | Dynamic valuation form giving customers instant pricing transparency. |
| **Automated Booking Pipeline** | End-to-end appointment scheduling backed by Firestore APIs. |
| **Google Maps Integration** | Seamless location routing for customers to find physical store drop-offs. |
| **Staff Central Dashboard** | Comprehensive UI for branch managers to review bookings and track walk-ins. |
| **Phygital QR Scanning** | Built-in HTML5 QR code scanning bridging physical receipts with digital records. |
| **Refinery Tracking** | Real-time status updates as jewelry moves from store to refinery to payout. |
| **Live Financial Analytics** | Integrated Recharts for transparent, real-time data visualization on performance. |
| **Secure Cloud Storage** | Granular Firebase security rules protecting user data, IDs, and transactions. |

## Quick Start

```bash
# 1. Clone and install
git clone https://github.com/yourusername/goldify.git
cd goldify && npm install

# 2. Configure Environment variables
cp .env.example .env.local
# Add your Firebase and Google Maps API keys

# 3. Setup Firebase
npm install -g firebase-tools
firebase login
firebase use --add  # Select your project

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

Goldify operates across three primary user experiences:

*   **Customer Portal (/):** Users can get rapid estimates for their items, securely book appointments, and track their item's refinery status.
*   **Staff Dashboard (/dashboard):** Store staff manage daily schedules, scan QR codes using their device cameras, and update valuation records.
*   **Admin/Enterprise:** Oversee live payment modules, configure backend rule changes, and monitor refinery pipelines.

## How It Works

```text
 Customer requests Estimate
        │
        ▼
┌──────────────────┐
│  Estimator Form  │  Calculates baseline value & captures details
└────────┬─────────┘
         │
┌────────▼─────────┐
│ Booking Pipeline │  Reserves slot, integrates Google Maps routing
│   (Firestore)    │
└────────┬─────────┘
         │
    ┌────┼────┐
    ▼    ▼    ▼
 Staff  Live Tracking
 Dash   & QR Scans
```

## Project Structure

```text
goldify/
├── app/                         # Next.js 14 App Router pages
│   ├── login/                   # Authentication flows
│   └── ...
├── components/                  # React UI Components
│   └── estimator/               # Valuation form logic
├── lib/                         # Shared utilities and helpers
├── public/                      # Static assets
├── styles/                      # Global CSS
├── types/                       # TypeScript definitions
├── firebase.json                # Firebase config
├── firestore.rules              # DB security rules
├── storage.rules                # Storage security rules
├── next.config.js               # Next.js configuration
├── tailwind.config.ts           # Styling configuration
└── package.json                 # Dependencies
```

## Tech Stack

**Next.js (App Router)** • **React 18** • **Firebase** • **TypeScript**

*   **Frontend:** React 18, Next.js 14, Framer Motion (animations), Lucide React (icons), Recharts.
*   **Backend:** Firebase Auth, Firestore (Database), Firebase Storage.
*   **Utilities:** Date-fns, HTML5-QRCode.

## Disclaimer
By using this software, you acknowledge:
*   **Data Security:** Proper configuration of `.env.local` and application of `firestore.rules` and `storage.rules` are required to maintain user data privacy in production.
*   **Valuation Accuracy:** The estimates provided by the tool are indicative and subject to physical verification and real-time market fluctuations.

## License
MIT
