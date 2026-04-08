'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, Gem } from 'lucide-react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
      <div className={`container ${styles.inner}`}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <Gem size={22} className={styles.logoIcon} />
          <span className={styles.logoText}>
            <span className="gold-text">Gold</span>ify
          </span>
        </Link>

        {/* Desktop Nav */}
        <ul className={styles.links} role="list">
          <li><Link href="/" className={styles.link}>Home</Link></li>
          <li><Link href="/estimator" className={styles.link}>Value Estimator</Link></li>
          <li><Link href="/book" className={styles.link}>Book Appointment</Link></li>
        </ul>

        {/* Right actions */}
        <div className={styles.actions}>
          <Link href="/login" className="btn btn-secondary btn-sm">
            Staff Login
          </Link>
          <button
            className={styles.menuToggle}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          <Link href="/" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Home</Link>
          <Link href="/estimator" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Value Estimator</Link>
          <Link href="/book" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Book Appointment</Link>
          <Link href="/login" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Staff Login</Link>
        </div>
      )}
    </nav>
  );
}
