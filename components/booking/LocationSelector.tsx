'use client';
import { useState } from 'react';
import { KioskLocation } from '@/types';
import { MapPin, Clock } from 'lucide-react';
import styles from './LocationSelector.module.css';

export const KIOSK_LOCATIONS: KioskLocation[] = [
  {
    id: 'dlf-moi-noida',
    name: 'DLF Mall of India',
    address: 'Plot A-2, Sector 18, Noida',
    city: 'Noida, Uttar Pradesh',
    timings: 'Mon–Sun: 11:00 AM – 9:30 PM',
  },
  {
    id: 'wave-one-noida',
    name: 'Wave One, Sector 18',
    address: 'Wave One Tower, Sector 18, Noida',
    city: 'Noida, Uttar Pradesh',
    timings: 'Mon–Sat: 10:00 AM – 8:00 PM',
  },
];

interface Props {
  selected: string;
  onSelect: (id: string) => void;
}

export default function LocationSelector({ selected, onSelect }: Props) {
  return (
    <div className={styles.grid}>
      {KIOSK_LOCATIONS.map((loc) => (
        <button
          key={loc.id}
          className={`${styles.card} ${selected === loc.id ? styles.selected : ''}`}
          onClick={() => onSelect(loc.id)}
          id={`location-${loc.id}`}
          type="button"
        >
          <div className={styles.topRow}>
            <MapPin size={16} className={styles.pin} />
            <span className={styles.city}>{loc.city}</span>
            {selected === loc.id && <span className={styles.check}>✓</span>}
          </div>
          <h4 className={styles.name}>{loc.name}</h4>
          <p className={styles.address}>{loc.address}</p>
          <div className={styles.timing}>
            <Clock size={12} />
            {loc.timings}
          </div>
        </button>
      ))}
    </div>
  );
}
