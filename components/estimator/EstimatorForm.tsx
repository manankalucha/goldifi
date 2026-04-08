'use client';
import { useState } from 'react';
import { useGoldRate } from '@/lib/hooks/useGoldRate';
import { computeEstimateRange } from '@/lib/pricing/pricingEngine';
import { Karatage, EstimateResult } from '@/types';
import PayoutRangeDisplay from './PayoutRangeDisplay';
import { Scale, Gem, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import styles from './EstimatorForm.module.css';

const karatOptions: { value: Karatage; label: string }[] = [
  { value: 24, label: '24K — 999 (Pure Gold)' },
  { value: 22, label: '22K — 916 (Hallmark Standard)' },
  { value: 18, label: '18K — 750 (Common Jewelry)' },
  { value: 14, label: '14K — 585' },
  { value: 10, label: '10K — 417' },
];

export default function EstimatorForm() {
  const { rates, loading: rateLoading } = useGoldRate();
  const [weight, setWeight] = useState(10);
  const [karatage, setKaratage] = useState<Karatage>(22);
  const [result, setResult] = useState<EstimateResult | null>(null);

  const handleEstimate = () => {
    if (!rates) return;
    const goldRate24k = rates.rate24k;
    const estimate = computeEstimateRange({
      weightGrams: weight,
      karatage,
      goldRate24kPerGram: goldRate24k,
    });
    setResult({ ...estimate, rateUsed: goldRate24k, karatage, weightGrams: weight });
  };

  return (
    <div className={styles.wrapper}>
      {/* Inputs */}
      <div className={styles.inputSection}>
        {/* Weight */}
        <div className="form-group">
          <label className="form-label" htmlFor="est-weight">
            <Scale size={12} style={{ display: 'inline', marginRight: 4 }} />
            Approximate Gross Weight (grams)
          </label>
          <div className={styles.weightRow}>
            <input
              id="est-weight"
              type="range"
              min={1}
              max={200}
              step={0.5}
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className={styles.slider}
            />
            <input
              type="number"
              min={0.1}
              max={1000}
              step={0.5}
              value={weight}
              onChange={(e) => setWeight(Math.max(0.1, Number(e.target.value)))}
              className={`form-input ${styles.weightInput}`}
              aria-label="Weight in grams"
            />
          </div>
          <p className={styles.weightHint}>
            Approximate gross weight including any stones or clasps.
            XRF verification at kiosk provides the exact net weight.
          </p>
        </div>

        {/* Karatage */}
        <div className="form-group">
          <label className="form-label" htmlFor="est-karat">
            <Gem size={12} style={{ display: 'inline', marginRight: 4 }} />
            Approximate Karatage / Purity
          </label>
          <select
            id="est-karat"
            className="form-select"
            value={karatage}
            onChange={(e) => setKaratage(Number(e.target.value) as Karatage)}
          >
            {karatOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <p className={styles.weightHint}>
            Not sure of karatage? Check for BIS hallmark stamp. Our XRF spectrometer will
            verify the exact purity at the kiosk.
          </p>
        </div>

        {/* Rate info */}
        {rates && (
          <div className={styles.rateInfo}>
            <span className={styles.rateDot} />
            <span>
              Using {karatage}K rate:{' '}
              <strong>
                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
                  karatage === 24 ? rates.rate24k : karatage === 22 ? rates.rate22k : karatage === 18 ? rates.rate18k : rates.rate14k
                )}
              </strong>
              /gram (Simulated)
            </span>
          </div>
        )}

        <button
          id="estimate-btn"
          className={`btn btn-primary btn-lg ${styles.calcBtn}`}
          onClick={handleEstimate}
          disabled={rateLoading || !rates}
        >
          {rateLoading ? (
            <>
              <span className="spinner" style={{ width: 16, height: 16 }} />
              Loading Rates...
            </>
          ) : (
            <>
              Calculate Estimate
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </div>

      {/* Result */}
      {result && <PayoutRangeDisplay result={result} />}

      {/* CTA */}
      {result && (
        <div className={styles.ctaBox}>
          <p>
            This is a preliminary estimate only. Your final offer is based on hardware-verified
            XRF purity and exact net weight at our kiosk — always higher accuracy than self-reported values.
          </p>
          <Link href="/book" className="btn btn-primary" id="estimator-book-cta">
            Book a Free Valuation Appointment
            <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </div>
  );
}
