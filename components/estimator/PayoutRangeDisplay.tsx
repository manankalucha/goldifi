'use client';
import { EstimateResult } from '@/types';
import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import styles from './PayoutRangeDisplay.module.css';

const fmt = (val: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

interface Props {
  result: EstimateResult;
}

export default function PayoutRangeDisplay({ result }: Props) {
  const { lowEstimate, midEstimate, highEstimate, rateUsed, karatage, weightGrams } = result;
  const range = highEstimate - lowEstimate;
  const midOffset = ((midEstimate - lowEstimate) / range) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={styles.card}
      id="estimate-result"
    >
      <div className={styles.header}>
        <h3>Estimated Payout Range</h3>
        <span className={styles.sim}>⚠ Simulated Rate</span>
      </div>

      {/* Three tier display */}
      <div className={styles.tiers}>
        <div className={styles.tier}>
          <TrendingDown size={16} className={styles.iconLow} />
          <p className={styles.tierLabel}>Conservative</p>
          <p className={styles.tierValue}>{fmt(lowEstimate)}</p>
          <p className={styles.tierHint}>Lower XRF variance</p>
        </div>
        <div className={`${styles.tier} ${styles.tierMid}`}>
          <Minus size={16} className={styles.iconMid} />
          <p className={styles.tierLabel}>Expected Offer</p>
          <p className={`${styles.tierValue} ${styles.midValue}`}>{fmt(midEstimate)}</p>
          <p className={styles.tierHint}>At stated {karatage}K purity</p>
        </div>
        <div className={styles.tier}>
          <TrendingUp size={16} className={styles.iconHigh} />
          <p className={styles.tierLabel}>Optimistic</p>
          <p className={styles.tierValue}>{fmt(highEstimate)}</p>
          <p className={styles.tierHint}>Higher XRF reading</p>
        </div>
      </div>

      {/* Range bar */}
      <div className={styles.rangeBar}>
        <div className={styles.rangeTrack}>
          <motion.div
            className={styles.rangeFill}
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 0.6, delay: 0.2 }}
          />
          <div
            className={styles.rangeMidMark}
            style={{ left: `${midOffset}%` }}
          />
        </div>
        <div className={styles.rangeLabels}>
          <span>{fmt(lowEstimate)}</span>
          <span>{fmt(highEstimate)}</span>
        </div>
      </div>

      {/* Breakdown */}
      <div className={styles.breakdown}>
        <div className={styles.breakdownRow}>
          <span>Weight entered</span><span>{weightGrams}g (gross approx.)</span>
        </div>
        <div className={styles.breakdownRow}>
          <span>Market rate used</span>
          <span>₹{rateUsed.toLocaleString('en-IN')}/g (24K)</span>
        </div>
        <div className={styles.breakdownRow}>
          <span>Buy-sell spread</span><span>4% (configurable)</span>
        </div>
        <div className={styles.breakdownRow}>
          <span>Wastage deduction</span>
          <span className={styles.zero}>₹0 — None</span>
        </div>
      </div>

      <p className={styles.disclaimer}>
        This estimate is indicative only and subject to hardware-verified XRF purity testing and exact
        net weight measurement at our kiosk. No estimate is a binding offer.
      </p>
    </motion.div>
  );
}
