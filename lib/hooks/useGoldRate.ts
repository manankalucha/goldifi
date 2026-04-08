'use client';
import { useState, useEffect } from 'react';
import { GoldRates } from '@/types';
import { getSimulatedGoldRates } from '@/lib/pricing/pricingEngine';

/**
 * Provides real-time gold rates.
 * In development / simulated mode, refreshes every 60 seconds with seeded values.
 * In production, this should subscribe to the Firestore `goldRates/current` document.
 */
export const useGoldRate = () => {
  const [rates, setRates] = useState<GoldRates | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRates = async () => {
    try {
      const res = await fetch('/api/gold-rate', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setRates(data);
      } else {
        // Fallback to client-side simulation
        setRates(getSimulatedGoldRates());
      }
    } catch {
      setRates(getSimulatedGoldRates());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
    const interval = setInterval(fetchRates, 60_000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  return { rates, loading, refresh: fetchRates };
};
