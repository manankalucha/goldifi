'use client';
import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import LocationSelector from '@/components/booking/LocationSelector';
import AddressPicker from '@/components/booking/AddressPicker';
import DateTimePicker from '@/components/booking/DateTimePicker';
import BookingConfirmation from '@/components/booking/BookingConfirmation';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { setHours, setMinutes, format } from 'date-fns';
import styles from './book.module.css';

type Step = 1 | 2 | 3 | 4;

export default function BookPage() {
  const [step, setStep] = useState<Step>(1);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [serviceType, setServiceType] = useState<'kiosk' | 'home'>('kiosk');
  const [locationId, setLocationId] = useState('');
  const [address, setAddress] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationData, setConfirmationData] = useState<any>(null);

  const handleNext = () => {
    if (step === 1) {
      if (!name || phone.length !== 10 || !email) {
        setError('Please fill all fields correctly. Phone must be 10 digits.');
        return;
      }
      setError(null);
      setStep(2);
    } else if (step === 2) {
      if (serviceType === 'kiosk' && !locationId) {
        setError('Please select a kiosk location.');
        return;
      }
      if (serviceType === 'home' && address.trim().length < 10) {
        setError('Please provide a complete home address.');
        return;
      }
      setError(null);
      setStep(3);
    }
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) {
      setError('Please select both date and time.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Parse time string 'hh:mm a' to combine with selectedDate
      const timeParts = selectedTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
      let hours = parseInt(timeParts![1], 10);
      const minutes = parseInt(timeParts![2], 10);
      if (timeParts![3].toUpperCase() === 'PM' && hours < 12) hours += 12;
      if (timeParts![3].toUpperCase() === 'AM' && hours === 12) hours = 0;

      const scheduledAt = setMinutes(setHours(selectedDate, hours), minutes).toISOString();

      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name,
          customerPhone: phone,
          customerEmail: email,
          serviceType,
          kioskLocation: serviceType === 'kiosk' ? locationId : undefined,
          customerAddress: serviceType === 'home' ? address : undefined,
          scheduledAt,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Booking failed');

      setConfirmationData({
        bookingId: data.id,
        customerName: name,
        serviceType,
        locationId: serviceType === 'kiosk' ? locationId : undefined,
        customerAddress: serviceType === 'home' ? address : undefined,
        scheduledAt,
      });
      setStep(4);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={`container-sm ${styles.inner}`}>
          
          {step < 4 && (
            <div className={styles.header}>
              <h1 className={styles.title}>Book Appointment</h1>
              <div className={styles.progress}>
                <div className={`${styles.dot} ${step >= 1 ? styles.active : ''}`} />
                <div className={`${styles.line} ${step >= 2 ? styles.active : ''}`} />
                <div className={`${styles.dot} ${step >= 2 ? styles.active : ''}`} />
                <div className={`${styles.line} ${step >= 3 ? styles.active : ''}`} />
                <div className={`${styles.dot} ${step >= 3 ? styles.active : ''}`} />
              </div>
              <p className={styles.stepTitle}>
                {step === 1 && 'Step 1: Your Details'}
                {step === 2 && 'Step 2: Choose Kiosk'}
                {step === 3 && 'Step 3: Pick Date & Time'}
              </p>
            </div>
          )}

          <div className={styles.card}>
            {error && <div className={styles.errorBanner}>{error}</div>}

            {/* STEP 1: details */}
            {step === 1 && (
              <div className={styles.stepContent}>
                <div className="form-group">
                  <label className="form-label" htmlFor="b-name">Full Name</label>
                  <input
                    id="b-name"
                    type="text"
                    className="form-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="E.g. Ayesha Sharma"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="b-phone">Phone Number</label>
                  <div style={{ display: 'flex' }}>
                    <div className={styles.prefix}>+91</div>
                    <input
                      id="b-phone"
                      type="tel"
                      className="form-input"
                      style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="9876543210"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="b-email">Email Address</label>
                  <input
                    id="b-email"
                    type="email"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ayesha@example.com"
                  />
                </div>
                <div className={styles.actions}>
                  <button className="btn btn-primary btn-lg" onClick={handleNext}>
                    Next: Choose Location
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: location / service type */}
            {step === 2 && (
              <div className={styles.stepContent}>
                <div className={styles.serviceToggle}>
                  <button 
                    className={`btn ${serviceType === 'kiosk' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setServiceType('kiosk')}
                  >
                    Visit Kiosk
                  </button>
                  <button 
                    className={`btn ${serviceType === 'home' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setServiceType('home')}
                  >
                    At-Home Pickup (Delhi NCR)
                  </button>
                </div>
                
                {serviceType === 'kiosk' ? (
                  <LocationSelector selected={locationId} onSelect={setLocationId} />
                ) : (
                  <div className="form-group slideDown">
                    <label className="form-label">Exact Home Address</label>
                    <AddressPicker value={address} onChange={setAddress} />
                  </div>
                )}
                
                <div className={styles.actionsBox}>
                  <button className="btn btn-ghost" onClick={() => setStep(1)}>
                    <ArrowLeft size={18} /> Back
                  </button>
                  <button 
                    className="btn btn-primary btn-lg" 
                    onClick={handleNext} 
                    disabled={serviceType === 'kiosk' ? !locationId : address.length < 10}
                  >
                    Next: Pick Time
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: date/time */}
            {step === 3 && (
              <div className={styles.stepContent}>
                <DateTimePicker
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  onSelect={(d, t) => {
                    setSelectedDate(d);
                    setSelectedTime(t);
                  }}
                />
                <div className={styles.actionsBox}>
                  <button className="btn btn-ghost" onClick={() => setStep(2)}>
                    <ArrowLeft size={18} /> Back
                  </button>
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={handleSubmit}
                    disabled={!selectedDate || !selectedTime || loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner" style={{ width: 16, height: 16 }} />
                        Confirming...
                      </>
                    ) : (
                      <>Confirm Booking</>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: confirmation */}
            {step === 4 && confirmationData && (
              <BookingConfirmation {...confirmationData} />
            )}
          </div>
        </div>
      </main>
      {step < 4 && <Footer />}
    </>
  );
}
