'use client';
import { useState, useEffect } from 'react';
import { subscribeToCollection, where } from '@/lib/firebase/firestore';
import { Appointment, InventoryItem } from '@/types';
import { MapPin, Navigation, Package, CheckCircle } from 'lucide-react';
import styles from './FieldOpsTable.module.css';

export default function FieldOpsTable() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Tracking active field operations (appointments that are home service)
    const unsubAppts = subscribeToCollection<Appointment>(
      'appointments',
      (data) => setAppointments(data.filter(a => a.serviceType === 'home'))
    );

    const unsubInv = subscribeToCollection<InventoryItem>(
      'inventory',
      (data) => setInventory(data.filter(i => i.smartBagId))
    );

    setLoading(false);

    return () => {
      unsubAppts();
      unsubInv();
    };
  }, []);

  if (loading) return <div className="spinner" />;

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.sectionTitle}>Active Field Units</h3>
      <div className={styles.tableBox}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Status</th>
              <th>Customer</th>
              <th>Location</th>
              <th>Smart Bag ID</th>
              <th>Valuation Drop</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0 ? (
              <tr>
                <td colSpan={5} className={styles.empty}>No active field operations.</td>
              </tr>
            ) : (
              appointments.map(appt => {
                const acquiredBag = inventory.find(i => i.customerId === `CUST-${appt.customerPhone}` || i.valuationId.includes(appt.id));
                const isComplete = appt.status === 'completed' && acquiredBag;
                
                return (
                  <tr key={appt.id} className={isComplete ? styles.rowComplete : ''}>
                    <td>
                      {isComplete ? (
                        <span className={`badge ${styles.badgeSuccess}`}><CheckCircle size={12}/> Secured</span>
                      ) : (
                        <span className="badge badge-pending">In Transit</span>
                      )}
                    </td>
                    <td>
                      <div className={styles.mainText}>{appt.customerName}</div>
                      <div className={styles.subText}>{appt.customerPhone}</div>
                    </td>
                    <td>
                      <div className={styles.mainText} style={{maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                        {appt.customerAddress}
                      </div>
                      <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(appt.customerAddress || '')}`} target="_blank" rel="noreferrer" className={styles.link}>
                        <MapPin size={12}/> View Map
                      </a>
                    </td>
                    <td>
                      {acquiredBag ? (
                        <div className={styles.bagTag}>
                          <Package size={14}/> {acquiredBag.smartBagId}
                        </div>
                      ) : (
                        <span className={styles.subText}>Pending...</span>
                      )}
                    </td>
                    <td>
                      {acquiredBag?.gpsCoordinates ? (
                        <a href={`https://www.google.com/maps/search/?api=1&query=${acquiredBag.gpsCoordinates.lat},${acquiredBag.gpsCoordinates.lng}`} target="_blank" rel="noreferrer" className={styles.link}>
                          <Navigation size={12}/> {acquiredBag.gpsCoordinates.lat.toFixed(4)}, {acquiredBag.gpsCoordinates.lng.toFixed(4)}
                        </a>
                      ) : (
                        <span className={styles.subText}>-</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
