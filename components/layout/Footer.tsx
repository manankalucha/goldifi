import Link from 'next/link';
import { Gem, MapPin, Phone, Mail } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        {/* Brand */}
        <div className={styles.brand}>
          <div className={styles.logo}>
            <Gem size={20} className={styles.logoIcon} />
            <span className={styles.logoText}>
              <span className="gold-text">Gold</span>ify
            </span>
          </div>
          <p className={styles.tagline}>
            India&apos;s most transparent phygital jewelry liquidation platform.
            Powered by XRF spectrometry and GIA-certified diamond verification.
          </p>
          <div className={styles.simBadge}>
            🔴 Live rates are simulated in this environment
          </div>
        </div>

        {/* Nav columns */}
        <div className={styles.columns}>
          <div className={styles.col}>
            <h4 className={styles.colTitle}>Services</h4>
            <ul className={styles.colLinks}>
              <li><Link href="/estimator">Value Estimator</Link></li>
              <li><Link href="/book">Book Appointment</Link></li>
              <li><Link href="/#how-it-works">How It Works</Link></li>
            </ul>
          </div>
          <div className={styles.col}>
            <h4 className={styles.colTitle}>Kiosk Locations</h4>
            <ul className={styles.colLinks}>
              <li>
                <MapPin size={12} style={{ display: 'inline', marginRight: 4 }} />
                DLF Mall of India, Noida
              </li>
              <li>
                <MapPin size={12} style={{ display: 'inline', marginRight: 4 }} />
                Wave One, Sector 18, Noida
              </li>
            </ul>
          </div>
          <div className={styles.col}>
            <h4 className={styles.colTitle}>Contact</h4>
            <ul className={styles.colLinks}>
              <li>
                <Phone size={12} style={{ display: 'inline', marginRight: 4 }} />
                1800‑XXX‑GOLD
              </li>
              <li>
                <Mail size={12} style={{ display: 'inline', marginRight: 4 }} />
                hello@goldify.in
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className={styles.bottom}>
        <p>© {new Date().getFullYear()} Goldify. All rights reserved.</p>
        <p>Regulated valuations. No hidden wastage deductions.</p>
      </div>
    </footer>
  );
}
