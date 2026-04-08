'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PayoutResult } from '@/types';
import { addDocument } from '@/lib/firebase/firestore';
import { useAuth } from '@/lib/hooks/useAuth';
import { Check, X, Shield, RefreshCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './OfferCard.module.css';

const fmt = (val: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

interface Props {
  offer: PayoutResult & { 
    id: string; 
    customerId?: string; 
    grossWeightGrams?: number; 
    netWeightGrams?: number; 
    xrfGoldPurity?: number; 
    diamondVerified?: boolean;
    ratesSnapshot?: any;
  };
  onReset: () => void;
}

export default function OfferCard({ offer, onReset }: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleAction = async (status: 'accepted' | 'rejected') => {
    if (!user) return;
    setLoading(true);

    try {
      const valuationData = {
        id: offer.id,
        customerId: offer.customerId || 'WALK-IN',
        grossWeightGrams: offer.grossWeightGrams || 0,
        netWeightGrams: offer.netWeightGrams || 0,
        xrfGoldPurity: offer.xrfGoldPurity || 0,
        diamondVerified: offer.diamondVerified || false,
        karatage: offer.karatage,
        baseGoldValue: offer.baseGoldValue,
        spreadMarginPct: offer.spreadMarginPct,
        finalOffer: offer.finalOffer,
        status,
        operatorId: user.uid,
        createdAt: new Date().toISOString(),
        ratesSnapshot: offer.ratesSnapshot,
      };

      // 1. Save to valuations collection
      await addDocument('valuations', valuationData);

      // 2. If accepted, route to inventory (Admin handles assignment)
      if (status === 'accepted') {
        await addDocument('inventory', {
          valuationId: offer.id,
          customerId: valuationData.customerId,
          itemDescription: `${offer.karatage}K Gold Item`, // operator can edit later
          goldPurity: offer.xrfGoldPurity || 0,
          netWeightGrams: offer.netWeightGrams || 0,
          finalOffer: offer.finalOffer,
          stream: 'unassigned', // needs admin routing
          acquisitionDate: new Date().toISOString(),
          diamondVerified: offer.diamondVerified || false,
        });
      }

      setSaved(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

    } catch (err) {
      console.error(err);
      alert('Failed to save valuation status.');
      setLoading(false);
    }
  };

  if (saved) {
    return (
      <div className={styles.successState}>
        <Check size={48} className={styles.successIcon} />
        <h2>Valuation Saved</h2>
        <p>Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={styles.card}
    >
      <div className={styles.header}>
        <Shield size={24} className={styles.icon} />
        <h2>Computed Final Offer</h2>
        <span className={styles.badge}>XRF Verified</span>
      </div>

      <div className={styles.offerValue}>
        <p className={styles.offerLabel}>Net Payout ({offer.karatage}K)</p>
        <p className={styles.offerAmount}>{fmt(offer.finalOffer)}</p>
      </div>

      <div className={styles.breakdown}>
        <div className={styles.row}>
          <span>Base Gold Value</span>
          <span>{fmt(offer.baseGoldValue)}</span>
        </div>
        <div className={styles.row}>
          <span>Spread Margin ({offer.spreadMarginPct * 100}%)</span>
          <span className={styles.deduct}>- {fmt(offer.spreadAmount)}</span>
        </div>
        <div className={styles.row}>
          <span>Wastage Deduction</span>
          <span className={styles.zero}>₹0</span>
        </div>
        {offer.diamondVerified && (
          <div className={styles.row}>
            <span>Diamond Value</span>
            <span className={styles.tbd}>TBD (CPO Routing)</span>
          </div>
        )}
      </div>

      <div className={styles.actions}>
        <button 
          className="btn btn-ghost" 
          onClick={onReset}
          disabled={loading}
        >
          <RefreshCcw size={16} /> Recalculate
        </button>
        <div className={styles.decisionGroup}>
          <button 
            className="btn btn-danger" 
            onClick={() => handleAction('rejected')}
            disabled={loading}
          >
            <X size={16} /> Customer Rejected
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => handleAction('accepted')}
            disabled={loading}
          >
            <Check size={16} /> Customer Accepted
          </button>
        </div>
      </div>
    </motion.div>
  );
}
