'use client';
import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X } from 'lucide-react';
import styles from './ScannerComponent.module.css';

interface Props {
  onScan: (decodedText: string) => void;
  onClose?: () => void;
}

export default function ScannerComponent({ onScan, onClose }: Props) {
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const initScanner = async () => {
      try {
        const hasCameras = await Html5Qrcode.getCameras();
        if (hasCameras && hasCameras.length > 0) {
          scannerRef.current = new Html5Qrcode("reader");
          await scannerRef.current.start(
            { facingMode: "environment" },
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
            },
            (decodedText) => {
              if (scannerRef.current) {
                scannerRef.current.stop().then(() => onScan(decodedText));
              }
            },
            (err) => {
              // ignore silent scanning errors
            }
          );
        } else {
          setError('No cameras found on this device.');
        }
      } catch (err: any) {
        setError(err.message || 'Camera permission denied or unavailable.');
      }
    };

    initScanner();

    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [onScan]);

  return (
    <div className={styles.scannerWrapper}>
      <div className={styles.header}>
        <h3><Camera size={18} /> Scan Smart Bag Barcode</h3>
        {onClose && (
          <button onClick={onClose} className={styles.closeBtn}>
            <X size={20} />
          </button>
        )}
      </div>
      
      {error ? (
        <div className={styles.error}>{error}</div>
      ) : (
        <div className={styles.readerContainer}>
          <div id="reader" className={styles.reader} />
          <p className={styles.hint}>Align the barcode or QR code within the frame.</p>
        </div>
      )}
    </div>
  );
}
