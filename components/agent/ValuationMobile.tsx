'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { ValuationFormData, Valuation, InventoryItem } from '@/types';
import { setDocument } from '@/lib/firebase/firestore';
import { computePayout } from '@/lib/pricing/pricingEngine';
import { useGoldRate } from '@/lib/hooks/useGoldRate';
import { MapPin, Briefcase, QrCode } from 'lucide-react';
import ScannerComponent from './ScannerComponent';
import styles from './ValuationMobile.module.css';

export default function ValuationMobile() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const customerId = searchParams.get('customerId') || '';
  const apptId = searchParams.get('apptId') || '';

  const { rates } = useGoldRate();
  
  // Geolocation state
  const [gps, setGps] = useState<{lat: number, lng: number} | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  
  // Scanner state
  const [showScanner, setShowScanner] = useState(false);
  const [smartBagId, setSmartBagId] = useState('');

  // Form state
  const [grossWeight, setGrossWeight] = useState('');
  const [deductions, setDeductions] = useState('0');
  const [xrfGoldPurity, setXrfGoldPurity] = useState('');
  const [xrfSilverPct, setXrfSilverPct] = useState('0');
  const [xrfCopperPct, setXrfCopperPct] = useState('0');
  const [diamondVerified, setDiamondVerified] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get location on mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => setGpsError('GPS required for off-site valuation. Please enable location.')
      );
    } else {
      setGpsError('Geolocation is not supported by this device.');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !rates || !customerId) return;
    if (!gps) {
      setError('Cannot proceed without GPS tracking coordinates.');
      return;
    }
    if (!smartBagId) {
      setError('A Smart Bag ID must be scanned.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const gWt = parseFloat(grossWeight);
      const dWt = parseFloat(deductions);
      const netWt = gWt - dWt;
      const purity = parseFloat(xrfGoldPurity) / 100;

      const payout = computePayout({
        netWeightGrams: netWt,
        xrfGoldPurity: purity,
        goldRate24kPerGram: rates.rate24k,
        spreadMarginPct: 0.04
      });

      const valuationId = `VAL-${Date.now().toString(36).toUpperCase()}`;
      
      const valuationData: Valuation = {
        id: valuationId,
        customerId,
        appointmentId: apptId,
        grossWeightGrams: gWt,
        deductionsGrams: dWt,
        netWeightGrams: netWt,
        xrfGoldPurity: purity,
        xrfSilverPct: parseFloat(xrfSilverPct),
        xrfCopperPct: parseFloat(xrfCopperPct),
        diamondVerified,
        gpsCoordinates: gps,
        ...payout,
        status: 'accepted',
        paymentStatus: 'pending',
        operatorId: user.uid,
        createdAt: new Date().toISOString()
      };

      const inventoryItem: InventoryItem = {
        id: `INV-${Date.now().toString(36).toUpperCase()}`,
        valuationId,
        customerId,
        customerName: 'Mobile Capture', 
        itemDescription: `Mobile Intake (${payout.karatage}K Gold)`,
        goldPurity: purity,
        netWeightGrams: netWt,
        finalOffer: payout.finalOffer,
        stream: diamondVerified ? 'cpo' : 'unassigned',
        acquisitionDate: new Date().toISOString(),
        diamondVerified,
        smartBagId,
        gpsCoordinates: gps
      };

      await setDocument('valuations', valuationId, valuationData);
      await setDocument('inventory', inventoryItem.id, inventoryItem);

      alert(`Success! Final Offer: ₹${payout.finalOffer.toLocaleString('en-IN')}\nBag ${smartBagId} secured.`);
      router.push('/agent');
    } catch (err: any) {
      setError(err.message || 'Error processing valuation.');
    } finally {
      setLoading(false);
    }
  };

  if (!customerId) {
    return <div className={styles.centered}>Missing Customer Reference. Select an appointment.</div>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>At-Home Valuation</h2>
      
      {/* Geolocation Notice */}
      <div className={styles.gpsBox}>
        <MapPin size={18} className={gpsError ? styles.errorTxt : styles.successTxt} />
        <div style={{flex: 1}}>
          <strong>GPS Verification</strong>
          {gpsError ? (
            <p className={styles.errorTxt}>{gpsError}</p>
          ) : gps ? (
            <p className={styles.successTxt}>Coordinate Lock: {gps.lat.toFixed(4)}, {gps.lng.toFixed(4)}</p>
          ) : (
            <p>Acquiring lock...</p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.errorPanel}>{error}</div>}

        <div className={styles.card}>
          <h3>Hardware Metrics</h3>
          <div className={styles.grid}>
            <div className="form-group">
              <label className="form-label">Gross Wt (g)</label>
              <input type="number" step="0.01" required value={grossWeight} onChange={e=>setGrossWeight(e.target.value)} className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Deductions (g)</label>
              <input type="number" step="0.01" value={deductions} onChange={e=>setDeductions(e.target.value)} className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">XRF Au (%)</label>
              <input type="number" step="0.01" max="100" required value={xrfGoldPurity} onChange={e=>setXrfGoldPurity(e.target.value)} placeholder="e.g. 91.6" className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">XRF Ag / Cu (%)</label>
              <div style={{display:'flex', gap: 8}}>
                <input type="number" step="0.01" value={xrfSilverPct} onChange={e=>setXrfSilverPct(e.target.value)} className="form-input" placeholder="Ag" />
                <input type="number" step="0.01" value={xrfCopperPct} onChange={e=>setXrfCopperPct(e.target.value)} className="form-input" placeholder="Cu" />
              </div>
            </div>
          </div>

          <label className={styles.checkboxLabel}>
            <input type="checkbox" checked={diamondVerified} onChange={(e) => setDiamondVerified(e.target.checked)} />
            <span>Natural Diamond Verified (iD100)</span>
          </label>
        </div>

        {/* Bag Scanning */}
        <div className={styles.card}>
          <h3>Chain of Custody</h3>
          {showScanner ? (
            <ScannerComponent 
              onScan={(id) => { setSmartBagId(id); setShowScanner(false); }} 
              onClose={() => setShowScanner(false)} 
            />
          ) : (
            <div className={styles.scannerPrompt}>
              <div className={styles.bagInputBox}>
                <Briefcase size={20} className={smartBagId ? styles.successTxt : ''} />
                <input 
                  type="text" 
                  readOnly 
                  value={smartBagId} 
                  placeholder="Scan Transit Bag Barcode..."
                  className={styles.bagInput}
                />
              </div>
              <button type="button" className={`btn ${smartBagId ? 'btn-ghost' : 'btn-primary'}`} onClick={() => setShowScanner(true)}>
                <QrCode size={18} /> {smartBagId ? 'Rescan Bag' : 'Scan Smart Bag'}
              </button>
            </div>
          )}
        </div>

        <button type="submit" disabled={loading || !gps || !smartBagId} className={`btn btn-primary btn-lg ${styles.submitBtn}`}>
          {loading ? <span className="spinner" /> : 'Log Valuation & Secure Inventory'}
        </button>
      </form>
    </div>
  );
}
