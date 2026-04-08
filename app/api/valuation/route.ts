import { NextRequest, NextResponse } from 'next/server';
import { computePayout, get24kRate, getSimulatedGoldRates } from '@/lib/pricing/pricingEngine';
import { ValuationFormData } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: ValuationFormData = await request.json();

    // Fetch gold rate (uses simulated in dev)
    const rates = getSimulatedGoldRates();
    const goldRate24k = get24kRate(rates.rate22k);

    const {
      netWeightGrams,
      xrfGoldPurity,
    } = body;

    // Validate
    if (!netWeightGrams || netWeightGrams <= 0) {
      return NextResponse.json({ error: 'Invalid net weight' }, { status: 400 });
    }
    if (!xrfGoldPurity || xrfGoldPurity <= 0 || xrfGoldPurity > 1) {
      return NextResponse.json({ error: 'Invalid XRF purity — must be 0.0 to 1.0' }, { status: 400 });
    }

    // Compute payout — diamond status does NOT affect gold calculation
    const payout = computePayout({
      netWeightGrams,
      xrfGoldPurity,
      goldRate24kPerGram: goldRate24k,
      spreadMarginPct: 0.04, // In production: fetch from Firestore config/pricing
    });

    return NextResponse.json({
      ...payout,
      goldRateSource: rates.source,
      ratesSnapshot: rates,
      // Diamond routing flag — handled by admin inventory panel
      requiresGemologistAppraisal: body.diamondVerified,
    });
  } catch {
    return NextResponse.json({ error: 'Valuation computation failed' }, { status: 500 });
  }
}
