import { useState, useEffect } from 'react';
import { subscribeToNotifications } from '../services/firestoreService';

export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;
    const unsubscribe = subscribeToNotifications(userId, (data) => {
      setNotifications(data);
      setUnreadCount(data.filter((n: any) => !n.is_read).length);
    });
    return () => unsubscribe();
  }, [userId]);

  return { notifications, unreadCount };
}
