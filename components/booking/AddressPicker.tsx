'use client';
import { useEffect, useRef, useState } from 'react';
import { MapPin, LocateFixed, CheckCircle } from 'lucide-react';
import styles from './AddressPicker.module.css';

interface Props {
  value: string;
  onChange: (address: string) => void;
}

declare global {
  interface Window {
    google: any;
    initGoogleMaps: () => void;
  }
}

export default function AddressPicker({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const autocompleteRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [loaded, setLoaded] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    // Load the Google Maps JS API (Places)
    if (window.google?.maps) {
      setLoaded(true);
      return;
    }

    window.initGoogleMaps = () => setLoaded(true);

    const existingScript = document.getElementById('gmaps-script');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'gmaps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&libraries=places&callback=initGoogleMaps`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (!loaded || !inputRef.current || !mapRef.current) return;

    // Default center: Delhi NCR
    const defaultCenter = { lat: 28.6139, lng: 77.209 };

    // Init map
    const map = new window.google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: 11,
      disableDefaultUI: true,
      zoomControl: true,
      styles: [
        { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
        { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a2e' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#a0a0b0' }] },
        { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2d2d4e' }] },
        { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1a1a2e' }] },
        { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#d4a017' }] },
        { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0d0d1f' }] },
        { featureType: 'poi', stylers: [{ visibility: 'off' }] },
      ],
    });
    mapInstanceRef.current = map;

    // Gold marker
    const marker = new window.google.maps.Marker({
      map,
      visible: false,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#D4A017',
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: '#fff',
      },
    });
    markerRef.current = marker;

    // Places Autocomplete — restrict to Delhi NCR
    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: 'IN' },
      fields: ['formatted_address', 'geometry', 'name'],
      types: ['geocode', 'establishment'],
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (!place.geometry) return;

      const addr = place.formatted_address || place.name || '';
      onChange(addr);
      setConfirmed(true);

      const loc = place.geometry.location;
      map.panTo(loc);
      map.setZoom(16);
      marker.setPosition(loc);
      marker.setVisible(true);
    });

    autocompleteRef.current = autocomplete;
  }, [loaded, onChange]);

  const handleLocateMe = () => {
    if (!navigator.geolocation) return;
    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latlng = { lat: pos.coords.latitude, lng: pos.coords.longitude };

        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: latlng }, (results: any[], status: string) => {
          if (status === 'OK' && results[0]) {
            const addr = results[0].formatted_address;
            onChange(addr);
            setConfirmed(true);
            if (inputRef.current) inputRef.current.value = addr;

            mapInstanceRef.current?.panTo(latlng);
            mapInstanceRef.current?.setZoom(16);
            markerRef.current?.setPosition(latlng);
            markerRef.current?.setVisible(true);
          }
          setLocating(false);
        });
      },
      () => setLocating(false)
    );
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.inputRow}>
        <MapPin size={16} className={styles.inputIcon} />
        <input
          ref={inputRef}
          type="text"
          className={styles.input}
          placeholder={loaded ? 'Search your address or landmark...' : 'Loading maps...'}
          defaultValue={value}
          onChange={(e) => {
            setConfirmed(false);
            onChange(e.target.value);
          }}
          disabled={!loaded}
          id="address-autocomplete"
          autoComplete="off"
        />
        {confirmed && <CheckCircle size={16} className={styles.checkIcon} />}
        <button
          type="button"
          className={styles.locateBtn}
          onClick={handleLocateMe}
          disabled={!loaded || locating}
          title="Use my current location"
        >
          <LocateFixed size={16} className={locating ? styles.spin : ''} />
          {locating ? 'Locating...' : 'Use My Location'}
        </button>
      </div>

      <div ref={mapRef} className={styles.map} />

      {confirmed && value && (
        <div className={styles.confirmedBadge}>
          <CheckCircle size={14} />
          <span>{value}</span>
        </div>
      )}
    </div>
  );
}
