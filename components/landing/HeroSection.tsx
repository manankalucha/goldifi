'use client';
import Link from 'next/link';
import { ArrowRight, Shield, Zap, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './HeroSection.module.css';

const floatingOrbs = [
  { size: 320, top: '10%', left: '60%', delay: 0 },
  { size: 200, top: '55%', left: '75%', delay: 0.5 },
  { size: 150, top: '20%', left: '10%', delay: 1 },
];

export default function HeroSection() {
  return (
    <section className={styles.hero}>
      {/* Ambient glow orbs */}
      {floatingOrbs.map((orb, i) => (
        <div
          key={i}
          className={styles.orb}
          style={{
            width: orb.size,
            height: orb.size,
            top: orb.top,
            left: orb.left,
            animationDelay: `${orb.delay}s`,
          }}
        />
      ))}

      <div className={`container ${styles.content}`}>
        {/* Trust pill */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={styles.pill}
        >
          <span className={styles.pillDot} />
          India&apos;s First XRF-Verified Jewelry Liquidation Platform
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className={styles.headline}
        >
          Sell Your Gold at
          <br />
          <span className="gold-text">True Market Value</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={styles.sub}
        >
          Hardware-verified purity. Live MCX-linked rates. Zero wastage deductions.
          <br />
          Visit a Goldify kiosk and receive a transparent, certified offer in minutes.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className={styles.ctas}
        >
          <Link href="/estimator" className="btn btn-primary btn-lg" id="hero-cta-estimator">
            Get an Estimate
            <ArrowRight size={18} />
          </Link>
          <Link href="/book" className="btn btn-secondary btn-lg" id="hero-cta-book">
            Book Appointment
          </Link>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className={styles.stats}
        >
          {[
            { icon: <Shield size={16} />, label: 'XRF Verified', sub: '99.9% accuracy' },
            { icon: <Zap size={16} />, label: 'Instant Pricing', sub: 'Live market rates' },
            { icon: <TrendingUp size={16} />, label: 'No Wastage', sub: '0% hidden deductions' },
          ].map((stat) => (
            <div key={stat.label} className={styles.stat}>
              <span className={styles.statIcon}>{stat.icon}</span>
              <div>
                <p className={styles.statLabel}>{stat.label}</p>
                <p className={styles.statSub}>{stat.sub}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
