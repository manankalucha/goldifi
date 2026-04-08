'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { uploadKYCDocument } from '@/lib/firebase/storage';
import { addDocument } from '@/lib/firebase/firestore';
import { Customer } from '@/types';
import { Upload, X, Check, ArrowRight } from 'lucide-react';
import styles from './IntakeForm.module.css';

interface Props {
  initialApptId?: string;
}

export default function IntakeForm({ initialApptId }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const [idFile, setIdFile] = useState<File | null>(null);
  const [panFile, setPanFile] = useState<File | null>(null);

  // Payment Preferences
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'bank_transfer'>('upi');
  const [vpa, setVpa] = useState('');
  const [accNum, setAccNum] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [bankName, setBankName] = useState('');
  const [holderName, setHolderName] = useState('');

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!idFile) {
      setError('ID Proof is mandatory.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Generate a draft customer ID for storage path
      const customerId = `CUST-${Date.now().toString(36).toUpperCase()}`;

      // 2. Upload ID proof
      setProgress(10);
      const idUrl = await uploadKYCDocument(idFile, customerId, 'id_proof', (p) => setProgress(10 + p * 0.4));

      // 3. Upload PAN if exists
      let panUrl = '';
      if (panFile) {
        panUrl = await uploadKYCDocument(panFile, customerId, 'pan_card', (p) => setProgress(50 + p * 0.4));
      } else {
        setProgress(90);
      }

      // 4. Create Firestore record
      const customerData: Omit<Customer, 'id'> = {
        fullName,
        phone,
        email,
        idProofUrl: idUrl,
        panCardUrl: panUrl,
        kycVerified: true, // Marked true by operator
        paymentInfo: {
          preferredMethod: paymentMethod,
          upi: paymentMethod === 'upi' ? { vpa } : undefined,
          bank: paymentMethod === 'bank_transfer' ? {
            accountNumber: accNum,
            ifscCode: ifsc,
            bankName: bankName,
            accountHolderName: holderName
          } : undefined
        },
        createdAt: new Date().toISOString(),
        createdBy: user.uid,
      };

      const docId = await addDocument('customers', customerData);
      setProgress(100);

      // Redirect to valuation with customerId
      router.push(`/dashboard/valuation?customerId=${docId}&apptId=${initialApptId || ''}`);

    } catch (err: any) {
      setError(err.message || 'Failed to complete intake process.');
      setLoading(false);
    }
  };

  const FileUploadArea = ({ 
    label, 
    file, 
    setFile, 
    required 
  }: { 
    label: string, 
    file: File | null, 
    setFile: (f: File | null) => void,
    required?: boolean 
  }) => (
    <div className={styles.uploadArea}>
      <p className={styles.uploadLabel}>
        {label} {required && <span className={styles.req}>*</span>}
      </p>
      {file ? (
        <div className={styles.fileCard}>
          <div className={styles.fileInfo}>
            <Check size={16} className={styles.fileCheck} />
            <span className={styles.fileName}>{file.name}</span>
            <span className={styles.fileSize}>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
          </div>
          <button type="button" onClick={() => setFile(null)} className={styles.removeBtn}>
            <X size={16} />
          </button>
        </div>
      ) : (
        <label className={styles.dropzone}>
          <input 
            type="file" 
            className={styles.fileInput} 
            accept="image/*,.pdf" 
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setFile(e.target.files[0]);
              }
            }}
          />
          <Upload size={24} className={styles.dropIcon} />
          <p className={styles.dropText}>Click to upload image or PDF</p>
          <p className={styles.dropHint}>Max size 5MB</p>
        </label>
      )}
    </div>
  );

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.grid}>
        <div className={styles.col}>
          <h3 className={styles.sectionTitle}>Customer Details</h3>
          <div className="form-group mb-4">
            <label className="form-label">Full Legal Name *</label>
            <input
              type="text"
              className="form-input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div className="form-group mb-4">
            <label className="form-label">Phone Number *</label>
            <input
              type="tel"
              className="form-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.col}>
          <h3 className={styles.sectionTitle}>KYC Documents</h3>
          <FileUploadArea label="Government ID Proof (Aadhaar / Passport)" file={idFile} setFile={setIdFile} required />
          <FileUploadArea label="PAN Card (Mandatory for > ₹2L)" file={panFile} setFile={setPanFile} />
        </div>
      </div>

      <div className={styles.paymentSection}>
        <h3 className={styles.sectionTitle}>Payment Disbursement Preference</h3>
        <div className={styles.methodToggle}>
          <button 
            type="button" 
            className={`btn ${paymentMethod === 'upi' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setPaymentMethod('upi')}
          >
            UPI (Instant)
          </button>
          <button 
            type="button" 
            className={`btn ${paymentMethod === 'bank_transfer' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setPaymentMethod('bank_transfer')}
          >
            Bank Transfer (IMPS/NEFT)
          </button>
        </div>

        {paymentMethod === 'upi' ? (
          <div className="form-group mb-4">
            <label className="form-label">UPI ID (VPA) *</label>
            <input
              type="text"
              className="form-input"
              value={vpa}
              onChange={(e) => setVpa(e.target.value)}
              placeholder="username@bank"
              required={paymentMethod === 'upi'}
            />
          </div>
        ) : (
          <div className={styles.bankGrid}>
            <div className="form-group">
              <label className="form-label">Account Number *</label>
              <input
                type="text"
                className="form-input"
                value={accNum}
                onChange={(e) => setAccNum(e.target.value)}
                required={paymentMethod === 'bank_transfer'}
              />
            </div>
            <div className="form-group">
              <label className="form-label">IFSC Code *</label>
              <input
                type="text"
                className="form-input"
                value={ifsc}
                onChange={(e) => setIfsc(e.target.value)}
                required={paymentMethod === 'bank_transfer'}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Bank Name *</label>
              <input
                type="text"
                className="form-input"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                required={paymentMethod === 'bank_transfer'}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Account Holder Name *</label>
              <input
                type="text"
                className="form-input"
                value={holderName}
                onChange={(e) => setHolderName(e.target.value)}
                required={paymentMethod === 'bank_transfer'}
              />
            </div>
          </div>
        )}
      </div>

      <div className={styles.footer}>
        {loading && (
          <div className={styles.progressWrap}>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>
            <span className={styles.progressText}>Uploading and encrypting... {Math.round(progress)}%</span>
          </div>
        )}
        
        <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
          {loading ? 'Processing...' : 'Complete Intake & Proceed'}
          {!loading && <ArrowRight size={18} />}
        </button>
      </div>
    </form>
  );
}
