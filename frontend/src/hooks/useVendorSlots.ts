import { useState, useEffect } from 'react';
import api from '../services/apiService';

export function useVendorSlots(vendorId?: string) {
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!vendorId) { setLoading(false); return; }
    api.get(`/api/slots/vendor/${vendorId}`)
      .then((r) => setSlots(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [vendorId]);

  const refresh = () => {
    if (!vendorId) return;
    setLoading(true);
    api.get(`/api/slots/vendor/${vendorId}`).then((r) => setSlots(r.data || [])).finally(() => setLoading(false));
  };

  return { slots, loading, refresh };
}
