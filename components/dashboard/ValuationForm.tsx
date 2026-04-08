'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { PayoutResult, ValuationFormData } from '@/types';
import { Scale, Activity, Diamond, ArrowRight, Save } from 'lucide-react';
import styles from './ValuationForm.module.css';

interface Props {
  customerId?: string;
  apptId?: string;
  onOfferGenerated: (offer: PayoutResult & { id: string }) => void;
}

export default function ValuationForm({ customerId, apptId, onOfferGenerated }: Props) {
  const { user } = useAuth();
  
  // Hardware Inputs
  const [grossWeight, setGrossWeight] = useState<string>('');
  const [deductions, setDeductions] = useState<string>('0');
  const [xrfAu, setXrfAu] = useState<string>('');
  const [xrfAg, setXrfAg] = useState<string>('0');
  const [xrfCu, setXrfCu] = useState<string>('0');
  
  // Diamond Data
  const [diamondVerified, setDiamondVerified] = useState(false);
  const [diamondCarats, setDiamondCarats] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-calculated net weight
  const netWeight = Math.max(0, (parseFloat(grossWeight) || 0) - (parseFloat(deductions) || 0));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    const auVal = parseFloat(xrfAu) || 0;
    if (auVal <= 0 || auVal > 1) {
      setError('XRF Gold Purity (Au) must be between 0.001 and 1.000');
      return;
    }
    if (netWeight <= 0) {
      setError('Net weight must be greater than 0');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload: ValuationFormData = {
        customerId: customerId || 'WALK-IN',
        appointmentId: apptId,
        grossWeightGrams: parseFloat(grossWeight),
        deductionsGrams: parseFloat(deductions),
        netWeightGrams: netWeight,
        xrfGoldPurity: auVal,
        xrfSilverPct: parseFloat(xrfAg) || 0,
        xrfCopperPct: parseFloat(xrfCu) || 0,
        diamondVerified,
        diamondCarats: diamondVerified ? parseFloat(diamondCarats) : undefined,
      };

      const res = await fetch('/api/valuation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to compute valuation');

      // The API does not write to DB to allow operator to review the offer first.
      // We'll pass the result up to display the OfferCard.
      // In a real app we'd save a "Draft" valuation here.
      
      onOfferGenerated({ ...data, id: `VAL-${Date.now().toString(36).toUpperCase()}` });
    } catch (err: any) {
      setError(err.message || 'Error occurred during valuation computation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.grid}>
        {/* Weight Section */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Scale size={18} className={styles.iconGold} />
            <h3>Weight Measurement</h3>
          </div>
          <div className={styles.cardBody}>
            <div className="form-group mb-4">
              <label className="form-label">Gross Weight (grams) *</label>
              <input
                type="number"
                step="0.001"
                min="0.1"
                required
                className="form-input"
                value={grossWeight}
                onChange={(e) => setGrossWeight(e.target.value)}
                placeholder="e.g. 15.450"
              />
            </div>
            <div className="form-group mb-4">
              <label className="form-label">Deductions (Stones/Wax) (grams)</label>
              <input
                type="number"
                step="0.001"
                min="0"
                className="form-input"
                value={deductions}
                onChange={(e) => setDeductions(e.target.value)}
              />
            </div>
            <div className={styles.resultBox}>
              <span>Net Gold Weight:</span>
              <span className={styles.highlight}>{netWeight.toFixed(3)} g</span>
            </div>
          </div>
        </div>

        {/* XRF Section */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Activity size={18} className={styles.iconGold} />
            <h3>XRF Spectrometry Data</h3>
          </div>
          <div className={styles.cardBody}>
            <div className="form-group mb-4">
              <label className="form-label">Gold (Au) Fraction (0.0 - 1.0) *</label>
              <input
                type="number"
                step="0.001"
                min="0.001"
                max="1"
                required
                className="form-input"
                value={xrfAu}
                onChange={(e) => setXrfAu(e.target.value)}
                placeholder="e.g. 0.916 for 22K"
              />
            </div>
            <div className={styles.row}>
              <div className="form-group">
                <label className="form-label">Silver (Ag) %</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  className="form-input"
                  value={xrfAg}
                  onChange={(e) => setXrfAg(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Copper (Cu) %</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  className="form-input"
                  value={xrfCu}
                  onChange={(e) => setXrfCu(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Diamond Section */}
      <div className={styles.card} style={{ marginTop: 'var(--space-6)' }}>
        <div className={styles.cardHeader}>
          <Diamond size={18} className={styles.iconBlue} />
          <h3>GIA iD100 Verification (Diamonds)</h3>
        </div>
        <div className={styles.cardBody}>
          <label className={styles.toggleRow}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={diamondVerified}
              onChange={(e) => setDiamondVerified(e.target.checked)}
            />
            <div>
              <span className={styles.toggleLabel}>Item contains Natural Diamonds</span>
              <p className={styles.toggleDesc}>
                Flags item for &quot;Certified Pre-Owned&quot; routing. Does not compute diamond value automatically.
              </p>
            </div>
          </label>

          {diamondVerified && (
            <div className={`form-group ${styles.indent}`}>
              <label className="form-label">Approximate Total Carat Weight</label>
              <input
                type="number"
                step="0.01"
                min="0.1"
                className="form-input"
                style={{ width: '200px' }}
                value={diamondCarats}
                onChange={(e) => setDiamondCarats(e.target.value)}
                placeholder="e.g. 1.25"
              />
            </div>
          )}
        </div>
      </div>

      <div className={styles.footer}>
        <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
          {loading ? 'Computing...' : 'Generate Transparent Offer'}
          {!loading && <ArrowRight size={18} />}
        </button>
      </div>
    </form>
  );
}
