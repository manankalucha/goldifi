'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useRole } from '@/lib/hooks/useRole';
import Link from 'next/link';
import { Home, Scan, QrCode, ClipboardList, LogOut } from 'lucide-react';
import { signOut } from '@/lib/firebase/auth';
import styles from './agent.module.css';

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  const { role, isAgent, isAdmin, loading } = useRole();
  const router = useRouter();
  const pathname = usePathname();

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  // Allow admins or specific agents
  if (!isAgent && !isAdmin) {
    if (typeof window !== 'undefined') router.push('/dashboard');
    return null;
  }

  const navItems = [
    { href: '/agent', label: 'Route', icon: Home },
    { href: '/agent/intake', label: 'Intake', icon: ClipboardList },
    { href: '/agent/valuation', label: 'Valuation', icon: QrCode },
  ];

  return (
    <div className={styles.layout}>
      <header className={styles.mobileHeader}>
        <div className={styles.headerTitle}>Field Agent</div>
        <button onClick={() => signOut().then(() => router.push('/login'))} className={styles.logoutBtn}>
          <LogOut size={18} />
        </button>
      </header>

      <main className={styles.mainContent}>
        {children}
      </main>

      <nav className={styles.bottomNav}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className={`${styles.navItem} ${isActive ? styles.active : ''}`}>
              <Icon size={20} className={styles.navIcon} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
