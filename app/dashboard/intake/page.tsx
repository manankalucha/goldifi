'use client';
import { useSearchParams } from 'next/navigation';
import IntakeForm from '@/components/dashboard/IntakeForm';
import { UserCheck } from 'lucide-react';
import styles from './intake.module.css';

export default function IntakePage() {
  const searchParams = useSearchParams();
  const apptId = searchParams.get('apptId');

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleWrap}>
          <div className={styles.iconWrap}>
            <UserCheck size={28} />
          </div>
          <div>
            <h1 className={styles.title}>Customer KYC Intake</h1>
            <p className={styles.subtitle}>
              {apptId ? `Processing Appointment: ${apptId}` : 'New Walk-In Customer'}
            </p>
          </div>
        </div>
      </header>

      <div className={styles.content}>
        <IntakeForm initialApptId={apptId || undefined} />
      </div>
    </div>
  );
}
