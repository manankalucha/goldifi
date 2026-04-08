'use client';
import { useRouter } from 'next/navigation';
import { useRole } from '@/lib/hooks/useRole';
import Sidebar from '@/components/layout/Sidebar';
import styles from './dashboard.module.css';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { role, isOperator, loading } = useRole();
  const router = useRouter();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  // Double-check auth boundary. Middleware handles redirect, but client state 
  // confirms role. If not an operator/admin, redirect them to home.
  if (!isOperator) {
    if (typeof window !== 'undefined') router.push('/');
    return null;
  }

  return (
    <div className={styles.layout}>
      <Sidebar role={role as 'operator' | 'admin'} />
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}
