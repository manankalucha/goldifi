'use client';
import { useState, useEffect } from 'react';
import { subscribeToCollection, updateDocument } from '@/lib/firebase/firestore';
import { Valuation, Customer, PaymentStatus } from '@/types';
import { CreditCard, CheckCircle, Clock, ExternalLink, Search, User } from 'lucide-react';
import styles from './DisbursementPanel.module.css';

const fmt = (val: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

export default function DisbursementPanel() {
  const [valuations, setValuations] = useState<Valuation[]>([]);
  const [customers, setCustomers] = useState<Record<string, Customer>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<PaymentStatus | 'all'>('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [refInput, setRefInput] = useState('');

  useEffect(() => {
    // 1. Subscribe to valuations that are 'accepted'
    const unsubVal = subscribeToCollection<Valuation>('valuations', (data) => {
      const accepted = data.filter(v => v.status === 'accepted');
      setValuations(accepted);
      setLoading(false);
    });

    // 2. Subscribe to customers for lookup
    const unsubCust = subscribeToCollection<Customer>('customers', (data) => {
      const dict: Record<string, Customer> = {};
      data.forEach(c => dict[c.id] = c);
      setCustomers(dict);
    });

    return () => {
      unsubVal();
      unsubCust();
    };
  }, []);

  const handleMarkAsProcessing = async (id: string) => {
    try {
      await updateDocument('valuations', id, { paymentStatus: 'processing' });
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleCompletePayout = async (id: string) => {
    if (!refInput) return;
    try {
      await updateDocument('valuations', id, { 
        paymentStatus: 'completed',
        disbursementRef: refInput,
        processedAt: new Date().toISOString()
      });
      setProcessingId(null);
      setRefInput('');
    } catch (err) {
      console.error('Failed to complete payout', err);
    }
  };

  const filtered = valuations.filter(v => filter === 'all' ? true : v.paymentStatus === filter);

  if (loading) return <div className="spinner" />;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statVal}>{valuations.filter(v => v.paymentStatus === 'pending').length}</span>
            <span className={styles.statLabel}>Pending Payouts</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statVal}>{fmt(valuations.filter(v => v.paymentStatus === 'pending').reduce((acc, v) => acc + v.finalOffer, 0))}</span>
            <span className={styles.statLabel}>Payable Volume</span>
          </div>
        </div>

        <div className={styles.filters}>
          <button className={`btn ${filter === 'pending' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter('pending')}>Pending</button>
          <button className={`btn ${filter === 'processing' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter('processing')}>In Progress</button>
          <button className={`btn ${filter === 'completed' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter('completed')}>Settled</button>
          <button className={`btn ${filter === 'all' ? 'btn-ghost' : 'btn-ghost'}`} onClick={() => setFilter('all')}>All</button>
        </div>
      </div>

      <div className={styles.list}>
        {filtered.length === 0 ? (
          <div className={styles.empty}>No {filter} payouts found.</div>
        ) : (
          filtered.map(v => {
            const c = customers[v.customerId];
            const isProcessing = processingId === v.id;

            return (
              <div key={v.id} className={styles.card}>
                <div className={styles.cardTop}>
                  <div className={styles.customerInfo}>
                    <div className={styles.avatar}><User size={20} /></div>
                    <div>
                      <h4>{c?.fullName || 'Unknown Customer'}</h4>
                      <p>{c?.phone}</p>
                    </div>
                  </div>
                  <div className={styles.payoutValue}>
                    {fmt(v.finalOffer)}
                  </div>
                </div>

                <div className={styles.cardDetails}>
                  <div className={styles.detailRow}>
                    <span>Valuation ID</span>
                    <span className={styles.monospace}>{v.id}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span>Payment Method</span>
                    <span className={styles.methodTag}>
                      {c?.paymentInfo?.preferredMethod === 'upi' ? 'UPI' : 'Bank Transfer'}
                    </span>
                  </div>
                  {c?.paymentInfo && (
                    <div className={styles.paymentBox}>
                      {c.paymentInfo.preferredMethod === 'upi' ? (
                        <p><strong>VPA:</strong> {c.paymentInfo.upi?.vpa}</p>
                      ) : (
                        <>
                          <p><strong>Bank:</strong> {c.paymentInfo.bank?.bankName}</p>
                          <p><strong>A/C:</strong> {c.paymentInfo.bank?.accountNumber}</p>
                          <p><strong>IFSC:</strong> {c.paymentInfo.bank?.ifscCode}</p>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className={styles.cardActions}>
                  {v.paymentStatus === 'pending' && (
                    <button className="btn btn-primary" onClick={() => handleMarkAsProcessing(v.id)}>
                      <Clock size={16} /> Mark as Processing
                    </button>
                  )}
                  {v.paymentStatus === 'processing' && !isProcessing && (
                    <button className="btn btn-primary" onClick={() => setProcessingId(v.id)}>
                      <CreditCard size={16} /> Enter Transaction ID
                    </button>
                  )}
                  {isProcessing && (
                    <div className={styles.settleForm}>
                      <input 
                        className="form-input" 
                        placeholder="UTR / Transaction Ref" 
                        value={refInput}
                        onChange={(e) => setRefInput(e.target.value)}
                      />
                      <button className="btn btn-primary" onClick={() => handleCompletePayout(v.id)}>Confirm</button>
                      <button className="btn btn-ghost" onClick={() => setProcessingId(null)}>Cancel</button>
                    </div>
                  )}
                  {v.paymentStatus === 'completed' && (
                    <div className={styles.settledBadge}>
                      <CheckCircle size={16} /> Settled: {v.disbursementRef}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
