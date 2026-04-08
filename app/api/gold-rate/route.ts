import { NextResponse } from 'next/server';
import { getSimulatedGoldRates } from '@/lib/pricing/pricingEngine';

/**
 * GET /api/gold-rate
 * Returns current domestic gold rates (simulated in development).
 * In production, swap the body with a live IBJA/MCX API call.
 */
export async function GET() {
  try {
    // --- PRODUCTION SWAP POINT ---
    // Replace this block with a live API call, e.g.:
    // const response = await fetch('https://api.ibja.in/gold-rates', { headers: { 'x-api-key': process.env.IBJA_API_KEY } });
    // const liveData = await response.json();
    // return NextResponse.json(liveData);

    const rates = getSimulatedGoldRates();
    return NextResponse.json(rates, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch gold rates' },
      { status: 500 }
    );
  }
}
