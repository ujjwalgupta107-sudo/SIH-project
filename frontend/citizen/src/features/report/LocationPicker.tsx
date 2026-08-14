import { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';

export interface LocationData {
  lat: number;
  lng: number;
  accuracy: number | null;
  address: string;
}

export function LocationPicker({ onLocationSelected }: { onLocationSelected: (loc: LocationData) => void }) {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = () => {
    setLoading(true);
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          address: 'Auto-detected location' // Ideally reverse geocoded
        };
        setLocation(loc);
        onLocationSelected(loc);
        setLoading(false);
      },
      (err) => {
        setError('Unable to retrieve your location');
        setLoading(false);
        // Fallback location for Lucknow
        const fallback = { lat: 26.8467, lng: 80.9462, accuracy: null, address: 'Hazratganj, Lucknow (Fallback)' };
        setLocation(fallback);
        onLocationSelected(fallback);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  return (
    <div className="location-picker">
      <p className="location-box">
        <MapPin size={16} style={{ display: 'inline', marginRight: '4px' }} />
        {loading ? 'Detecting location...' : location?.address || error || 'Location unknown'}
      </p>
    </div>
  );
}
