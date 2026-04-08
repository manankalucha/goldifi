import styles from './TrustBadges.module.css';

const badges = [
  { icon: '🔬', title: 'XRF Spectrometry', desc: 'Non-destructive elemental purity analysis' },
  { icon: '💎', title: 'GIA iD100', desc: 'Natural diamond verification sensor' },
  { icon: '⚖️', title: 'NABL Certified Scales', desc: 'Calibrated digital weight measurement' },
  { icon: '📋', title: 'KYC Compliant', desc: 'Fully compliant with PMLA & RBI guidelines' },
  { icon: '🏦', title: 'MCX-Linked Rates', desc: 'Real-time domestic market pricing' },
  { icon: '🔐', title: 'Data Secure', desc: 'AES-256 encrypted KYC storage' },
];

export default function TrustBadges() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <span className={styles.label}>Why Trust Goldify?</span>
          <h2 className={styles.title}>Built for Transparency &amp; Trust</h2>
        </div>
        <div className={styles.grid}>
          {badges.map((b) => (
            <div key={b.title} className={styles.badge}>
              <span className={styles.icon}>{b.icon}</span>
              <div>
                <h4 className={styles.badgeTitle}>{b.title}</h4>
                <p className={styles.badgeDesc}>{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
