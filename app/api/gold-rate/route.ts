import { NextResponse } from 'next/server';
import { getSimulatedGoldRates } from '@/lib/pricing/pricingEngine';

/**
 * GET /api/gold-rate
 * Returns current domestic gold rates (simulated in development).
 * In production, swap the body with a live IBJA/MCX API call.
 */
// RapidAPI Configuration
const RAPID_API_KEY = '7be44bb703msh801bd1e0e4a7142p18fabfjsn1a717aa2c222';
const RAPID_API_HOST = 'metal-sentinel.p.rapidapi.com';
const GRAMS_PER_OUNCE = 31.1035;
const GST_FACTOR = 1.03;

export async function GET() {
  try {
    const fetchOptions = {
      method: 'GET',
      headers: {
        'x-rapidapi-host': RAPID_API_HOST,
        'x-rapidapi-key': RAPID_API_KEY,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 300 }, // Cache for 5 mins
    };

    // Parallel fetch for gold and silver
    const [goldRes, silverRes] = await Promise.all([
      fetch(`https://${RAPID_API_HOST}/gold-price?currency=INR`, fetchOptions),
      fetch(`https://${RAPID_API_HOST}/silver-price?currency=INR`, fetchOptions),
    ]);

    if (!goldRes.ok) throw new Error('Gold API failed');
    
    const goldData = await goldRes.json();
    const silverData = silverRes.ok ? await silverRes.json() : null;

    // Metal Sentinel returns price per OUNCE in the 'mid' field
    const goldPricePerOunce = goldData.results[0].mid;
    const silverPricePerOunce = silverData?.results[0]?.mid || 0;

    const goldPricePerGram = (goldPricePerOunce / GRAMS_PER_OUNCE) * GST_FACTOR;
    const silverPricePerGram = (silverPricePerOunce / GRAMS_PER_OUNCE) * GST_FACTOR;

    const rates = {
      rate24k: Math.round(goldPricePerGram),
      rate22k: Math.round(goldPricePerGram * (22 / 24)),
      rate18k: Math.round(goldPricePerGram * (18 / 24)),
      rate14k: Math.round(goldPricePerGram * (14 / 24)),
      rateSilver: Math.round(silverPricePerGram),
      source: 'rapid_api' as const,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(rates, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    });
  } catch (error) {
    console.error('Gold Rate API Error:', error);
    // Fallback to simulation
    const rates = getSimulatedGoldRates();
    return NextResponse.json({ ...rates, note: 'Using fallback simulation' });
  }
}
