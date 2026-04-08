'use client';
import { useState } from 'react';
import { InventoryItem } from '@/types';
import { X, Factory, Gem } from 'lucide-react';
import { updateDocument } from '@/lib/firebase/firestore';
import { useAuth } from '@/lib/hooks/useAuth';
import styles from './RoutingModal.module.css';

interface Props {
  item: InventoryItem;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RoutingModal({ item, onClose, onSuccess }: Props) {
  const { user } = useAuth();
  const [stream, setStream] = useState<'b2b_scrap' | 'cpo' | null>(null);
  const [refineryRef, setRefineryRef] = useState('');
  const [cpoPrice, setCpoPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!stream) {
      setError('Please select a routing stream.');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const updates: any = {
        stream,
        assignedBy: user.uid,
        assignedAt: new Date().toISOString(),
      };

      if (stream === 'b2b_scrap') {
        updates.refineryRef = refineryRef || `REF-${Date.now().toString(36).toUpperCase()}`;
      } else if (stream === 'cpo') {
        if (!cpoPrice || parseFloat(cpoPrice) <= item.finalOffer) {
          throw new Error('CPO listing price must be greater than the acquisition offer.');
        }
        updates.cpoListingPrice = parseFloat(cpoPrice);
      }

      await updateDocument('inventory', item.id, updates);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to apply routing decision.');
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Assign Inventory Route</h2>
          <button onClick={onClose} className={styles.closeBtn}><X size={20} /></button>
        </div>

        <div className={styles.body}>
          {error && <div className={styles.error}>{error}</div>}
          
          <div className={styles.itemSummary}>
            <p><strong>Item:</strong> {item.itemDescription}</p>
            <p><strong>Value:</strong> ₹{item.finalOffer.toLocaleString('en-IN')}</p>
          </div>

          <div className={styles.splitOpts}>
            <button
              type="button"
              className={`${styles.optBtn} ${stream === 'b2b_scrap' ? styles.activeScrap : ''}`}
              onClick={() => setStream('b2b_scrap')}
            >
              <Factory size={24} />
              <span>B2B Scrap</span>
            </button>
            <button
              type="button"
              className={`${styles.optBtn} ${stream === 'cpo' ? styles.activeCpo : ''}`}
              onClick={() => setStream('cpo')}
            >
              <Gem size={24} />
              <span>CPO Retail</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className={styles.formContainer}>
            {stream === 'b2b_scrap' && (
              <div className="form-group slideDown">
                <label className="form-label">Refinery Batch Ref (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  value={refineryRef}
                  onChange={(e) => setRefineryRef(e.target.value)}
                  placeholder="Leave blank to auto-generate"
                />
              </div>
            )}

            {stream === 'cpo' && (
              <div className="form-group slideDown">
                <label className="form-label">Suggested Retail Price (INR) *</label>
                <input
                  type="number"
                  className="form-input"
                  value={cpoPrice}
                  onChange={(e) => setCpoPrice(e.target.value)}
                  placeholder={`Min value: ${item.finalOffer + 1}`}
                  required
                />
              </div>
            )}

            <div className={styles.footer}>
              <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading || !stream}>
                {loading ? 'Saving...' : 'Confirm Routing'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
