'use client';
import { useRouter } from 'next/navigation';
import { useRole } from '@/lib/hooks/useRole';
import Sidebar from '@/components/layout/Sidebar';
import styles from './admin.module.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { role, isAdmin, loading } = useRole();
  const router = useRouter();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  // Admin routing guard
  if (!isAdmin) {
    if (typeof window !== 'undefined') router.push('/dashboard');
    return null;
  }

  return (
    <div className={styles.layout}>
      <Sidebar role="admin" />
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}
