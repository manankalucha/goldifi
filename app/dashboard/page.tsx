'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Appointment } from '@/types';
import { subscribeToCollection, where, orderBy } from '@/lib/firebase/firestore';
import { Calendar, UserPlus, Microscope, Search, ArrowRight } from 'lucide-react';
import { KIOSK_LOCATIONS } from '@/components/booking/LocationSelector';
import styles from './page.module.css';

export default function DashboardHome() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, we'd query by kioskLocation based on the operator's assigned location
    // and where scheduledAt >= startOfToday
    const unsub = subscribeToCollection<Appointment>(
      'appointments',
      (data) => {
        // Sort manually if not using a composite index
        const sorted = data.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
        setAppointments(sorted.slice(0, 10)); // Just top 10 for dashboard
        setLoading(false);
      },
      where('status', '==', 'pending')
    );

    return () => unsub();
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Operator Dashboard</h1>
          <p className={styles.subtitle}>Manage today&apos;s queue and valuations</p>
        </div>
        <div className={styles.actions}>
          <div className={styles.searchBox}>
            <Search size={16} className={styles.searchIcon} />
            <input type="text" placeholder="Search by Appt ID or Phone..." className={styles.searchInput} />
          </div>
        </div>
      </header>

      {/* Quick Actions */}
      <section className={styles.quickActions}>
        <Link href="/dashboard/intake" className={styles.actionCard}>
          <div className={styles.actionIconWrap}>
            <UserPlus size={24} className={styles.actionIcon} />
          </div>
          <div>
            <h3>Start KYC Intake</h3>
            <p>Register a new walk-in or appointment.</p>
          </div>
          <ArrowRight size={18} className={styles.actionArrow} />
        </Link>
        
        <Link href="/dashboard/valuation" className={styles.actionCard}>
          <div className={styles.actionIconWrap} style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--info)' }}>
            <Microscope size={24} />
          </div>
          <div>
            <h3>New Valuation</h3>
            <p>Enter XRF and weight data for an offer.</p>
          </div>
          <ArrowRight size={18} className={styles.actionArrow} />
        </Link>
      </section>

      {/* Upcoming Appointments */}
      <section className={styles.queueSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <Calendar size={20} /> Today&apos;s Appointments
          </h2>
          <span className="badge badge-pending">{appointments.length} Pending</span>
        </div>

        <div className={styles.queue}>
          {loading ? (
            <div className={styles.loadingQueue}>Loading queue...</div>
          ) : appointments.length === 0 ? (
            <div className={styles.emptyQueue}>
              <p>No pending appointments for today.</p>
            </div>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Customer Name</th>
                    <th>Contact</th>
                    <th>Type & Location</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appt) => {
                    const time = new Date(appt.scheduledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
                    return (
                      <tr key={appt.id}>
                        <td className={styles.timeCol}>{time}</td>
                        <td className={styles.nameCol}>{appt.customerName}</td>
                        <td className={styles.contactCol}>{appt.customerPhone}</td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span 
                              className={`badge ${appt.serviceType === 'kiosk' ? 'badge-primary' : 'badge-info'}`} 
                              style={{ width: 'fit-content' }}
                            >
                              {appt.serviceType === 'kiosk' ? 'Visit Kiosk' : 'At-Home Service'}
                            </span>
                            {appt.serviceType === 'kiosk' ? (
                              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                                {KIOSK_LOCATIONS.find((k) => k.id === appt.kioskLocation)?.name || appt.kioskLocation}
                              </span>
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span 
                                  style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                                  title={appt.customerAddress}
                                >
                                  {appt.customerAddress}
                                </span>
                                <a 
                                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(appt.customerAddress || '')}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="btn btn-ghost"
                                  style={{ padding: '2px 8px', fontSize: '11px', height: '24px', minHeight: '24px', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(212, 160, 23, 0.1)', color: 'var(--gold)', border: '1px solid rgba(212, 160, 23, 0.2)' }}
                                >
                                  Map <ArrowRight size={10} />
                                </a>
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-pending">Pending</span>
                        </td>
                        <td>
                          <Link href={`/dashboard/intake?apptId=${appt.id}`} className="btn btn-secondary btn-sm">
                            Start Intake
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
