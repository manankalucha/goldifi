import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import EstimatorForm from '@/components/estimator/EstimatorForm';
import styles from './estimator.module.css';

export const metadata: Metadata = {
  title: 'Value Estimator',
  description: 'Get a quick estimate of your gold jewelry payout based on live market rates. Enter weight and karatage to see your approximate offer range.',
};

export default function EstimatorPage() {
  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={`container-sm ${styles.inner}`}>
          <div className={styles.header}>
            <span className={styles.label}>Free Tool</span>
            <h1 className={styles.title}>
              Gold Value <span className="gold-text">Estimator</span>
            </h1>
            <p className={styles.sub}>
              Enter your jewelry&apos;s approximate weight and karatage to see a preliminary payout range.
              Final offers are based on hardware-verified readings at our kiosk.
            </p>
          </div>
          <div className={styles.card}>
            <EstimatorForm />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
