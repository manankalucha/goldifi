import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/landing/HeroSection';
import LiveGoldTicker from '@/components/landing/LiveGoldTicker';
import HowItWorks from '@/components/landing/HowItWorks';
import TrustBadges from '@/components/landing/TrustBadges';

export const metadata: Metadata = {
  title: 'Goldify — Transparent Gold & Jewelry Valuation',
  description: 'Sell your gold and jewelry at true market value. XRF-verified purity, live MCX rates, zero wastage deductions.',
};

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <LiveGoldTicker />
        <HowItWorks />
        <TrustBadges />
      </main>
      <Footer />
    </>
  );
}
