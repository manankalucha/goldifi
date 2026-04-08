'use client';
import { useState, useMemo } from 'react';
import {
  addDays,
  format,
  isSameDay,
  startOfToday,
  isSunday,
  parse,
  isBefore,
  setHours,
  setMinutes,
} from 'date-fns';
import { Calendar, Clock } from 'lucide-react';
import styles from './DateTimePicker.module.css';

interface Props {
  selectedDate: Date | null;
  selectedTime: string | null;
  onSelect: (date: Date, time: string) => void;
}

const generateTimeSlots = (date: Date) => {
  // Simulated available slots: 11 AM to 7 PM, 30-min intervals
  const slots: string[] = [];
  let currentTime = setMinutes(setHours(date, 11), 0);
  const endTime = setMinutes(setHours(date, 19), 0);
  const now = new Date();

  while (isBefore(currentTime, endTime)) {
    // Only show future slots if today
    if (!isSameDay(date, now) || isBefore(now, currentTime)) {
      slots.push(format(currentTime, 'hh:mm a'));
    }
    currentTime = new Date(currentTime.getTime() + 30 * 60000);
  }
  return slots;
};

export default function DateTimePicker({ selectedDate, selectedTime, onSelect }: Props) {
  const today = startOfToday();
  const [activeDate, setActiveDate] = useState<Date>(selectedDate || today);

  // Generate next 14 days, excluding Sundays
  const availableDates = useMemo(() => {
    const dates: Date[] = [];
    let d = today;
    while (dates.length < 14) {
      if (!isSunday(d)) dates.push(d);
      d = addDays(d, 1);
    }
    return dates;
  }, [today]);

  const availableSlots = useMemo(() => generateTimeSlots(activeDate), [activeDate]);

  const handleDateSelect = (d: Date) => {
    setActiveDate(d);
    // Don't auto-select time, wait for user
  };

  return (
    <div className={styles.wrapper}>
      {/* Date Selection */}
      <div className={styles.section}>
        <h4 className={styles.label}>
          <Calendar size={14} /> Select Date
        </h4>
        <div className={styles.dateScroll}>
          {availableDates.map((d) => {
            const isSelected = selectedDate ? isSameDay(d, selectedDate) : false;
            return (
              <button
                key={d.toISOString()}
                type="button"
                className={`${styles.dateBtn} ${isSelected ? styles.selected : ''}`}
                onClick={() => handleDateSelect(d)}
                id={`date-${format(d, 'yyyy-MM-dd')}`}
              >
                <span className={styles.dayStr}>{format(d, 'EEE')}</span>
                <span className={styles.dateNum}>{format(d, 'd')}</span>
                <span className={styles.monthStr}>{format(d, 'MMM')}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Selection */}
      <div className={styles.section}>
        <h4 className={styles.label}>
          <Clock size={14} /> Select Time
        </h4>
        {availableSlots.length === 0 ? (
          <p className={styles.noSlots}>No slots available for this date. Please choose another.</p>
        ) : (
          <div className={styles.timeGrid}>
            {availableSlots.map((time) => {
              const isSelected = selectedTime === time && selectedDate && isSameDay(activeDate, selectedDate);
              return (
                <button
                  key={time}
                  type="button"
                  className={`${styles.timeBtn} ${isSelected ? styles.selected : ''}`}
                  onClick={() => onSelect(activeDate, time)}
                >
                  {time}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
