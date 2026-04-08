'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getDocument } from '@/lib/firebase/firestore';
import { InventoryItem, Valuation, Customer } from '@/types';
import RoutingModal from '@/components/admin/RoutingModal';
import { ArrowLeft, Package, User, FileText, Factory, Gem } from 'lucide-react';
import Link from 'next/link';
import styles from './detail.module.css';

const fmt = (val: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

export default function InventoryDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [item, setItem] = useState<InventoryItem | null>(null);
  const [valuation, setValuation] = useState<Valuation | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const itemDoc = await getDocument<InventoryItem>('inventory', id);
        if (itemDoc) {
          setItem(itemDoc);
          
          if (itemDoc.valuationId) {
            const valDoc = await getDocument<Valuation>('valuations', itemDoc.valuationId);
            setValuation(valDoc);
          }
          if (itemDoc.customerId && itemDoc.customerId !== 'WALK-IN') {
            const custDoc = await getDocument<Customer>('customers', itemDoc.customerId);
            setCustomer(custDoc);
          }
        }
      } catch (err) {
        console.error('Error fetching details', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <span className="spinner" style={{ width: 32, height: 32, margin: '0 auto' }} />
      </div>
    );
  }

  if (!item) {
    return (
      <div className={styles.container}>
        <Link href="/admin" className={styles.backLink}><ArrowLeft size={16} /> Back to Inventory</Link>
        <div className={styles.error}>Item not found.</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Link href="/admin" className={styles.backLink}><ArrowLeft size={16} /> Back to Inventory</Link>
      
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Inventory Details</h1>
          <p className={styles.subtitle}>ID: {item.id}</p>
        </div>
        <div className={styles.statusBanners}>
          {item.stream === 'unassigned' && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              Assign Route
            </button>
          )}
          {item.stream === 'b2b_scrap' && (
            <span className={styles.assignedBadge} style={{ borderColor: 'var(--warning)', color: 'var(--warning)', background: 'rgba(245, 158, 11, 0.1)' }}>
              <Factory size={16} /> B2B Scrap
            </span>
          )}
          {item.stream === 'cpo' && (
            <span className={styles.assignedBadge} style={{ borderColor: 'var(--success)', color: 'var(--success)', background: 'rgba(34, 197, 94, 0.1)' }}>
              <Gem size={16} /> CPO Retail
            </span>
          )}
        </div>
      </div>

      <div className={styles.grid}>
        {/* Item Summary */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Package size={18} className={styles.iconGold} />
            <h3>Item Overview</h3>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.keyval}>
              <span>Description</span>
              <span>{item.itemDescription}</span>
            </div>
            <div className={styles.keyval}>
              <span>Acquisition Date</span>
              <span>{new Date(item.acquisitionDate).toLocaleString('en-IN')}</span>
            </div>
            <div className={styles.keyval}>
              <span>Final Paid Offer</span>
              <span className={styles.highlight}>{fmt(item.finalOffer)}</span>
            </div>
            {item.cpoListingPrice && (
              <div className={styles.keyval}>
                <span>Suggested Retail Price</span>
                <span style={{ color: 'var(--success)', fontWeight: 600 }}>{fmt(item.cpoListingPrice)}</span>
              </div>
            )}
            {item.refineryRef && (
              <div className={styles.keyval}>
                <span>Refinery Batch Ref</span>
                <span>{item.refineryRef}</span>
              </div>
            )}
            {item.diamondVerified && (
              <div className={styles.keyval} style={{ borderTop: '1px dashed var(--border-subtle)', paddingTop: 8, marginTop: 8 }}>
                <span style={{ color: 'var(--info)' }}>Extracted Diamonds</span>
                <span>Requires appraisal</span>
              </div>
            )}
          </div>
        </div>

        {/* Valuation Data */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <FileText size={18} className={styles.iconGold} />
            <h3>Hardware Data (XRF & Scale)</h3>
          </div>
          <div className={styles.cardBody}>
            {valuation ? (
              <>
                <div className={styles.keyval}>
                  <span>Gross Weight (Scale)</span>
                  <span>{valuation.grossWeightGrams} g</span>
                </div>
                <div className={styles.keyval}>
                  <span>Net Gold Weight</span>
                  <span>{valuation.netWeightGrams} g</span>
                </div>
                <div className={styles.keyval}>
                  <span>XRF Purity (Au)</span>
                  <span>{(valuation.xrfGoldPurity * 100).toFixed(2)}% ({valuation.karatage}K)</span>
                </div>
                <div className={styles.keyval}>
                  <span>XRF Silver (Ag) / Copper (Cu)</span>
                  <span>{valuation.xrfSilverPct}% / {valuation.xrfCopperPct}%</span>
                </div>
                <div className={styles.keyval}>
                  <span>Market Rate Used (24K basis)</span>
                  <span>{fmt(valuation.goldRateUsed)}/g</span>
                </div>
              </>
            ) : (
              <p className={styles.muted}>No valuation data linked.</p>
            )}
          </div>
        </div>

        {/* Customer Data */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <User size={18} className={styles.iconGold} />
            <h3>Customer KYC Details</h3>
          </div>
          <div className={styles.cardBody}>
            {customer ? (
              <>
                <div className={styles.keyval}>
                  <span>Name</span>
                  <span>{customer.fullName}</span>
                </div>
                <div className={styles.keyval}>
                  <span>Phone</span>
                  <span>{customer.phone}</span>
                </div>
                <div className={styles.keyval}>
                  <span>Email</span>
                  <span>{customer.email || 'N/A'}</span>
                </div>
                <div className={styles.keyval}>
                  <span>ID Proof</span>
                  <a href={customer.idProofUrl} target="_blank" rel="noreferrer" className={styles.link}>View Document</a>
                </div>
                {customer.panCardUrl && (
                  <div className={styles.keyval}>
                    <span>PAN Card</span>
                    <a href={customer.panCardUrl} target="_blank" rel="noreferrer" className={styles.link}>View PAN</a>
                  </div>
                )}
              </>
            ) : (
              <p className={styles.muted}>Walk-in customer or KYC record missing.</p>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <RoutingModal 
          item={item} 
          onClose={() => setShowModal(false)} 
          onSuccess={() => {
            setShowModal(false);
            window.location.reload(); // Quick refresh to show updated state
          }} 
        />
      )}
    </div>
  );
}
