import { useState, useEffect } from 'react';
import api from '../services/apiService';

export function useBookings(userId?: string, role?: string) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || !role) { setLoading(false); return; }
    const endpoint = role === 'admin' ? '/api/bookings' : `/api/bookings/${role}/${userId}`;
    api.get(endpoint)
      .then((r) => setBookings(r.data || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [userId, role]);

  const refresh = () => {
    if (!userId || !role) return;
    setLoading(true);
    const endpoint = role === 'admin' ? '/api/bookings' : `/api/bookings/${role}/${userId}`;
    api.get(endpoint).then((r) => setBookings(r.data || [])).finally(() => setLoading(false));
  };

  return { bookings, loading, error, refresh };
}
