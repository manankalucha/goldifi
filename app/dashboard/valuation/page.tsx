'use client';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ValuationForm from '@/components/dashboard/ValuationForm';
import OfferCard from '@/components/dashboard/OfferCard';
import { PayoutResult } from '@/types';
import { Microscope } from 'lucide-react';
import styles from './valuation.module.css';

export default function ValuationPage() {
  const searchParams = useSearchParams();
  const customerId = searchParams.get('customerId') || undefined;
  const apptId = searchParams.get('apptId') || undefined;

  const [offer, setOffer] = useState<(PayoutResult & { 
    id: string; 
    customerId?: string; 
    grossWeightGrams?: number; 
    netWeightGrams?: number; 
    xrfGoldPurity?: number; 
    diamondVerified?: boolean;
    ratesSnapshot?: any;
  }) | null>(null);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleWrap}>
          <div className={styles.iconWrap}>
            <Microscope size={28} />
          </div>
          <div>
            <h1 className={styles.title}>Jewelry Valuation</h1>
            <p className={styles.subtitle}>
              {customerId ? `Customer ID: ${customerId}` : 'Direct Valuation'}
            </p>
          </div>
        </div>
      </header>

      <div className={styles.content}>
        {!offer ? (
          <ValuationForm 
            customerId={customerId} 
            apptId={apptId}
            onOfferGenerated={setOffer} 
          />
        ) : (
          <OfferCard 
            offer={offer} 
            onReset={() => setOffer(null)} 
          />
        )}
      </div>
    </div>
  );
}
