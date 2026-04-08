'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from '@/lib/firebase/auth';
import {
  LayoutDashboard, UserCheck, Microscope, Package, LogOut, Gem, Settings, ChevronRight
} from 'lucide-react';
import styles from './Sidebar.module.css';

interface NavItem {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: string;
}

interface SidebarProps {
  role?: 'operator' | 'admin';
}

const operatorNav: NavItem[] = [
  { href: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { href: '/dashboard/intake', icon: <UserCheck size={18} />, label: 'KYC Intake' },
  { href: '/dashboard/valuation', icon: <Microscope size={18} />, label: 'Valuation' },
];

const adminNav: NavItem[] = [
  { href: '/admin', icon: <Package size={18} />, label: 'Inventory', badge: 'Admin' },
];

export default function Sidebar({ role = 'operator' }: SidebarProps) {
  const pathname = usePathname();
  const navItems = role === 'admin' ? [...operatorNav, ...adminNav] : operatorNav;

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/login';
  };

  return (
    <aside className={styles.sidebar}>
      {/* Brand */}
      <div className={styles.brand}>
        <Link href="/" className={styles.logo}>
          <Gem size={18} className={styles.logoIcon} />
          <span className={styles.logoText}>
            <span className="gold-text">Gold</span>ify
          </span>
        </Link>
        <span className={styles.roleBadge}>
          {role === 'admin' ? '🔐 Admin' : '🏪 Operator'}
        </span>
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        <p className={styles.navLabel}>Navigation</p>
        <ul className={styles.navList}>
          {navItems.map((item) => {
            const active = pathname === item.href ||
              (item.href !== '/dashboard' && item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`${styles.navItem} ${active ? styles.active : ''}`}
                >
                  <span className={styles.navIcon}>{item.icon}</span>
                  <span className={styles.navLabel2}>{item.label}</span>
                  {item.badge && (
                    <span className={styles.adminBadge}>{item.badge}</span>
                  )}
                  {active && <ChevronRight size={14} className={styles.activeArrow} />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom actions */}
      <div className={styles.bottom}>
        <Link href="/login?settings=true" className={styles.settingsBtn}>
          <Settings size={16} />
          <span>Settings</span>
        </Link>
        <button onClick={handleSignOut} className={styles.signOutBtn}>
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
