'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Appointment } from '@/types';
import { subscribeToCollection, where } from '@/lib/firebase/firestore';
import { MapPin, Navigation, Clock, UserCheck } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import styles from './page.module.css';

export default function AgentDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    // Fetch home service appointments assigned to this agent (or unassigned for demo purposes)
    const unsub = subscribeToCollection<Appointment>(
      'appointments',
      (data) => {
        // Mock filtering: in production, we would filter by `agentId: user.uid`
        const homeAppts = data
          .filter(a => a.serviceType === 'home' && a.status === 'pending')
          .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
        setAppointments(homeAppts);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [user]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Today&apos;s Route</h2>
        <span className="badge badge-pending">{appointments.length} Stops</span>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <span className="spinner" style={{ width: 24, height: 24 }} />
        </div>
      ) : appointments.length === 0 ? (
        <div className={styles.empty}>
          <MapPin size={32} className={styles.emptyIcon} />
          <p>No stops remaining for today.</p>
        </div>
      ) : (
        <div className={styles.routeList}>
          {appointments.map((appt, idx) => {
            const time = new Date(appt.scheduledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
            
            return (
              <div key={appt.id} className={styles.stopCard}>
                <div className={styles.stopHeader}>
                  <div className={styles.stopNum}>{idx + 1}</div>
                  <div className={styles.stopTime}>
                    <Clock size={14} /> {time}
                  </div>
                </div>
                
                <div className={styles.stopBody}>
                  <div className={styles.customerName}>{appt.customerName}</div>
                  <div className={styles.customerPhone}>{appt.customerPhone}</div>
                  <div className={styles.addressBox}>
                    <MapPin size={16} className={styles.pinIcon} />
                    <span>{appt.customerAddress || 'Address not provided'}</span>
                  </div>
                </div>
                
                <div className={styles.stopActions}>
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(appt.customerAddress || '')}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="btn btn-ghost"
                  >
                    <Navigation size={16} /> Navigate
                  </a>
                  <Link href={`/agent/intake?apptId=${appt.id}`} className="btn btn-primary">
                    <UserCheck size={16} /> Arrive & Intake
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
