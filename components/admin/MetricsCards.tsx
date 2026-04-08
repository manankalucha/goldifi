'use client';
import { InventoryItem } from '@/types';
import { PackageSearch, TrendingUp, Gem, Factory } from 'lucide-react';
import styles from './MetricsCards.module.css';

const fmt = (val: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

interface Props {
  inventory: InventoryItem[];
}

export default function MetricsCards({ inventory }: Props) {
  const pending = inventory.filter(i => i.stream === 'unassigned').length;
  
  const scrapItems = inventory.filter(i => i.stream === 'b2b_scrap');
  const scrapValue = scrapItems.reduce((acc, curr) => acc + curr.finalOffer, 0);

  const cpoItems = inventory.filter(i => i.stream === 'cpo');
  const totalValue = inventory.reduce((acc, curr) => acc + curr.finalOffer, 0);

  return (
    <div className={styles.grid}>
      <div className={styles.card}>
        <div className={styles.iconWrap} style={{ color: 'var(--warning)', background: 'rgba(245,158,11,0.1)' }}>
          <PackageSearch size={24} />
        </div>
        <div>
          <p className={styles.label}>Pending Routing</p>
          <p className={styles.value}>{pending}</p>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.iconWrap} style={{ color: 'var(--success)', background: 'rgba(34,197,94,0.1)' }}>
          <Factory size={24} />
        </div>
        <div>
          <p className={styles.label}>B2B Scrap Queue</p>
          <p className={styles.value}>{scrapItems.length}</p>
          <p className={styles.sub}>Value: {fmt(scrapValue)}</p>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.iconWrap} style={{ color: 'var(--info)', background: 'rgba(59,130,246,0.1)' }}>
          <Gem size={24} />
        </div>
        <div>
          <p className={styles.label}>CPO Pipeline</p>
          <p className={styles.value}>{cpoItems.length}</p>
          <p className={styles.sub}>Retail prep</p>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.iconWrap} style={{ color: 'var(--gold-400)', background: 'rgba(240,192,64,0.1)' }}>
          <TrendingUp size={24} />
        </div>
        <div>
          <p className={styles.label}>Total Acquisition Value</p>
          <p className={styles.value}>{fmt(totalValue)}</p>
        </div>
      </div>
    </div>
  );
}
