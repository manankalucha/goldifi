'use client';
import { CheckCircle2, Ticket, MapPin, CalendarClock, Info } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { KIOSK_LOCATIONS } from './LocationSelector';
import styles from './BookingConfirmation.module.css';

interface Props {
  bookingId: string;
  customerName: string;
  serviceType: 'kiosk' | 'home';
  locationId?: string;
  customerAddress?: string;
  scheduledAt: string; // ISO string
}

export default function BookingConfirmation({ bookingId, customerName, serviceType, locationId, customerAddress, scheduledAt }: Props) {
  const location = locationId ? KIOSK_LOCATIONS.find((l) => l.id === locationId) : null;
  const dateObj = new Date(scheduledAt);
  const dateStr = dateObj.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const timeStr = dateObj.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={styles.wrapper}
    >
      <div className={styles.iconCircle}>
        <CheckCircle2 size={48} className={styles.successIcon} />
      </div>

      <h2 className={styles.title}>Booking Confirmed!</h2>
      <p className={styles.sub}>
        Thank you, {customerName}. Your valuation appointment has been securely scheduled.
      </p>

      {/* Ticket Card */}
      <div className={styles.ticket}>
        <div className={styles.ticketHeader}>
          <span className={styles.ticketLabel}>Booking Reference</span>
          <div className={styles.refCode}>
            <Ticket size={16} />
            {bookingId}
          </div>
        </div>
        
        <div className={styles.ticketBody}>
          <div className={styles.row}>
            <div className={styles.iconWrap}>
              <CalendarClock size={20} />
            </div>
            <div>
              <p className={styles.valLabel}>Date &amp; Time</p>
              <p className={styles.valText}>{dateStr}</p>
              <p className={styles.valTextGold}>{timeStr}</p>
            </div>
          </div>
          
          <div className={styles.divider} />
          
          <div className={styles.row}>
            <div className={styles.iconWrap}>
              <MapPin size={20} />
            </div>
            <div>
              <p className={styles.valLabel}>{serviceType === 'home' ? 'Home Pickup Address' : 'Kiosk Location'}</p>
              <p className={styles.valText}>{serviceType === 'home' ? 'At-Home Service' : location?.name}</p>
              <p className={styles.valSub}>{serviceType === 'home' ? customerAddress : location?.address}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className={styles.instructions}>
        <h4 className={styles.instTitle}>
          <Info size={16} /> What to bring
        </h4>
        <ul className={styles.instList}>
          <li>Your jewelry pieces (no cleaning required)</li>
          <li>Valid Government ID Proof (Aadhaar / Voter ID / Passport)</li>
          <li>PAN Card (Mandatory for transactions above limit)</li>
          <li>Bank account details for instant NEFT/IMPS payout</li>
        </ul>
      </div>

      <div className={styles.actions}>
        <Link href="/" className="btn btn-primary btn-lg" id="back-home-cta">
          Back to Home
        </Link>
        <Link href="/estimator" className="btn btn-secondary btn-lg" id="estimator-cta">
          Estimate Another Item
        </Link>
      </div>
    </motion.div>
  );
}
