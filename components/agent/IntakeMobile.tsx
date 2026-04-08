'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Appointment, Customer } from '@/types';
import { getDocument, setDocument, updateDocument } from '@/lib/firebase/firestore';
import { uploadFile } from '@/lib/firebase/storage';
import { useAuth } from '@/lib/hooks/useAuth';
import { Camera, CheckCircle, UploadCloud, User } from 'lucide-react';
import styles from './IntakeMobile.module.css';

export default function IntakeMobile() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const apptId = searchParams.get('apptId') || '';
  
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [panFile, setPanFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (apptId) {
      getDocument<Appointment>('appointments', apptId).then((data) => {
        setAppointment(data);
        setFetching(false);
      }).catch(() => {
        setError('Appointment not found.');
        setFetching(false);
      });
    } else {
      setFetching(false);
    }
  }, [apptId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointment || !user || !idFile) {
      setError('Missing appointment or ID document.');
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      // 1. Upload files
      const customerId = `CUST-${appointment.customerPhone}`;
      const idUrl = await uploadFile(idFile, `kyc/${customerId}/id_proof`);
      let panUrl = '';
      if (panFile) {
        panUrl = await uploadFile(panFile, `kyc/${customerId}/pan_card`);
      }

      // 2. Create customer record
      const customer: Customer = {
        id: customerId,
        fullName: appointment.customerName,
        phone: appointment.customerPhone,
        email: appointment.customerEmail,
        idProofUrl: idUrl,
        panCardUrl: panUrl,
        kycVerified: true,
        createdAt: new Date().toISOString(),
        createdBy: user.uid,
      };

      await setDocument('customers', customerId, customer);

      // 3. Update appointment
      await updateDocument('appointments', appointment.id, { status: 'completed' });

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to process intake.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className={styles.centered}><span className="spinner" /></div>
    );
  }

  if (success) {
    return (
      <div className={styles.successBox}>
        <CheckCircle size={48} className={styles.successIcon} />
        <h3>KYC Intake Complete</h3>
        <p>Customer identity verified successfully. You can now proceed to valuation.</p>
        <button className="btn btn-primary" onClick={() => router.push(`/agent/valuation?customerId=${`CUST-${appointment?.customerPhone}`}&apptId=${appointment?.id}`)}>
          Proceed to Valuation
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {error && <div className={styles.error}>{error}</div>}

      {!appointment ? (
        <div className={styles.empty}>
          <p>No appointment selected. Go back to your route to select a stop.</p>
          <button className="btn btn-ghost" onClick={() => router.push('/agent')}>View Route</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.customerBox}>
            <div className={styles.avatar}><User size={20} /></div>
            <div>
              <h3>{appointment.customerName}</h3>
              <p>{appointment.customerPhone}</p>
            </div>
          </div>

          <div className={styles.captureSection}>
            <div className={styles.fieldGroup}>
              <label>Official ID Proof (Aadhaar / DL)</label>
              <div className={styles.uploadBtn}>
                <Camera size={20} />
                <span>{idFile ? idFile.name : 'Tap to Scan ID'}</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment" 
                  onChange={(e) => { if (e.target.files) setIdFile(e.target.files[0]) }}
                />
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label>PAN Card (Optional for &lt; ₹2 Lakhs)</label>
              <div className={styles.uploadBtn}>
                <UploadCloud size={20} />
                <span>{panFile ? panFile.name : 'Tap to Scan PAN'}</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment" 
                  onChange={(e) => { if (e.target.files) setPanFile(e.target.files[0]) }}
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            className={`btn btn-primary btn-lg ${styles.submitBtn}`}
            disabled={loading || !idFile}
          >
            {loading ? <span className="spinner" style={{width: 16, height: 16}} /> : 'Verify Customer & Secure Intake'}
          </button>
        </form>
      )}
    </div>
  );
}
