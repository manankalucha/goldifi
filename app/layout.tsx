import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Goldify — India\'s Trusted Pre-Owned Jewelry Valuation Platform',
    template: '%s | Goldify',
  },
  description:
    'Sell your gold, diamond, and precious jewelry at transparent, hardware-verified market rates. No wastage deductions — just honest, technology-driven valuations at Goldify kiosks across India.',
  keywords: ['sell gold', 'gold valuation', 'pre-owned jewelry', 'gold price today', 'jewelry buyback India'],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'Goldify',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>{children}</body>
    </html>
  );
}
