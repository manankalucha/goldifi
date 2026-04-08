// ============================================================
// Goldify Pricing Engine
// Computes final payout offer based on hardware-verified data.
// NO manual wastage deductions — only configurable spread margin.
// ============================================================

import { PayoutResult } from '@/types';

export const SPREAD_MARGIN_DEFAULT = 0.04; // 4%

/**
 * Derives approximate karatage from XRF gold purity percentage.
 */
export const purityToKaratage = (goldPurityFraction: number): number => {
  const pct = goldPurityFraction * 100;
  if (pct >= 99) return 24;
  if (pct >= 91.6) return 22;
  if (pct >= 75) return 18;
  if (pct >= 58.5) return 14;
  return 10;
};

/**
 * Computes the 24k equivalent rate in ₹/gram from the 22k market rate.
 */
export const get24kRate = (rate22kPerGram: number): number =>
  (rate22kPerGram / 22) * 24;

/**
 * Computes payout offer from hardware-verified weight, XRF purity, and live gold rate.
 *
 * Formula:
 *   baseGoldValue = netWeightGrams × xrfGoldPurity × goldRate24kPerGram
 *   finalOffer    = baseGoldValue × (1 - spreadMarginPct)
 *
 * Diamond status is a routing flag ONLY — it does NOT affect the gold payout calculation.
 */
export const computePayout = ({
  netWeightGrams,
  xrfGoldPurity,
  goldRate24kPerGram,
  spreadMarginPct = SPREAD_MARGIN_DEFAULT,
}: {
  netWeightGrams: number;
  xrfGoldPurity: number;
  goldRate24kPerGram: number;
  spreadMarginPct?: number;
}): PayoutResult => {
  const karatage = purityToKaratage(xrfGoldPurity);
  const baseGoldValue = netWeightGrams * xrfGoldPurity * goldRate24kPerGram;
  const spreadAmount = baseGoldValue * spreadMarginPct;
  const finalOffer = baseGoldValue - spreadAmount;

  return {
    karatage,
    baseGoldValue: Math.round(baseGoldValue),
    spreadMarginPct,
    spreadAmount: Math.round(spreadAmount),
    finalOffer: Math.round(finalOffer),
    goldRateUsed: goldRate24kPerGram,
  };
};

/**
 * Quick estimate for the customer-facing estimator.
 * Returns a low/mid/high range reflecting typical XRF variance (±1%) and spread.
 */
export const computeEstimateRange = ({
  weightGrams,
  karatage,
  goldRate24kPerGram,
  spreadMarginPct = SPREAD_MARGIN_DEFAULT,
}: {
  weightGrams: number;
  karatage: number;
  goldRate24kPerGram: number;
  spreadMarginPct?: number;
}) => {
  const nominalPurity = karatage / 24;
  const lowPurity = Math.max(nominalPurity - 0.01, 0);
  const highPurity = Math.min(nominalPurity + 0.005, 1);

  const computeValue = (purity: number) =>
    Math.round(weightGrams * purity * goldRate24kPerGram * (1 - spreadMarginPct));

  return {
    lowEstimate: computeValue(lowPurity),
    midEstimate: computeValue(nominalPurity),
    highEstimate: computeValue(highPurity),
    rateUsed: goldRate24kPerGram,
  };
};

/**
 * Simulates a realistic domestic gold rate based on a seeded international price.
 * Used in development / when no live API key is configured.
 * Base: ~$2,330/troy-oz → converted to INR/gram using ₹84 exchange rate.
 */
export const getSimulatedGoldRates = () => {
  const usdPerTroyOz = 2330 + (Math.random() - 0.5) * 40; // ±$20 variance
  const inrPerUsd = 84.2;
  const gramsPerTroyOz = 31.1035;
  const rate24k = (usdPerTroyOz * inrPerUsd) / gramsPerTroyOz;
  const makingChargeFactor = 1.015; // domestic premium

  return {
    rate24k: Math.round(rate24k * makingChargeFactor),
    rate22k: Math.round(rate24k * (22 / 24) * makingChargeFactor),
    rate18k: Math.round(rate24k * (18 / 24) * makingChargeFactor),
    rate14k: Math.round(rate24k * (14 / 24) * makingChargeFactor),
    source: 'simulated' as const,
    updatedAt: new Date().toISOString(),
  };
};
