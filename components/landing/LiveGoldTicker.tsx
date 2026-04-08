'use client';
import { useGoldRate } from '@/lib/hooks/useGoldRate';
import { RefreshCw } from 'lucide-react';
import styles from './LiveGoldTicker.module.css';

const formatINR = (val: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

export default function LiveGoldTicker() {
  const { rates, loading } = useGoldRate();

  const items = rates
    ? [
        { label: '24K (999)', value: formatINR(rates.rate24k), sub: 'per gram' },
        { label: '22K (916)', value: formatINR(rates.rate22k), sub: 'per gram' },
        { label: '18K (750)', value: formatINR(rates.rate18k), sub: 'per gram' },
        { label: '14K (585)', value: formatINR(rates.rate14k), sub: 'per gram' },
      ]
    : [];

  // Duplicate for infinite scroll effect
  const tickerItems = [...items, ...items, ...items];

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.liveIndicator}>
          <span className={styles.liveDot} />
          <span className={styles.liveLabel}>LIVE GOLD RATES</span>
          <span className={styles.simLabel}>(Simulated)</span>
        </div>
        {rates && (
          <span className={styles.timestamp}>
            <RefreshCw size={10} />
            Updated {new Date(rates.updatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>

      <div className={styles.tickerTrack}>
        {loading ? (
          <div className={styles.skeleton}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={styles.skeletonItem} />
            ))}
          </div>
        ) : (
          <div className={styles.ticker}>
            {tickerItems.map((item, idx) => (
              <div key={idx} className={styles.tickerItem}>
                <span className={styles.tickerLabel}>{item.label}</span>
                <span className={styles.tickerValue}>{item.value}</span>
                <span className={styles.tickerSub}>{item.sub}</span>
                <span className={styles.separator}>|</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
