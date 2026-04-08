'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRole } from '@/lib/hooks/useRole';
import { useAuth } from '@/lib/hooks/useAuth';
import Sidebar from '@/components/layout/Sidebar';
import styles from './dashboard.module.css';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { role, isOperator, loading: roleLoading } = useRole();
  const router = useRouter();
  const loading = authLoading || roleLoading;

  useEffect(() => {
    if (loading) return;
    // Not logged in at all → go to login
    if (!user) {
      router.push('/login');
      return;
    }
    // Logged in but wrong role → go to home
    if (!isOperator) {
      router.push('/');
    }
  }, [loading, user, isOperator, router]);

  if (loading || !user || !isOperator) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
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
