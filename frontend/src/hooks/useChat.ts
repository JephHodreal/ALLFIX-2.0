import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface ChatMessage {
  id: string;
  sender_id: string;
  sender_role: 'customer' | 'vendor' | 'technician' | 'system';
  text: string;
  created_at: any;
  is_logistics?: boolean;
  delivery_status?: 'sending' | 'failed';
  sender_avatar?: string;
  is_read?: boolean;
}

export interface ChatThread {
  id: string; // usually booking_id
  booking_id?: string;
  customer_id: string;
  customer_name?: string;
  service_type?: string;
  vendor_id: string;
  vendor_name?: string;
  status: 'active' | 'archived';
  updated_at: any;
  personnel_name?: string; // For hq_ threads
  vendor_avatar?: string;
  customer_avatar?: string;
  technician_avatar?: string;
}

export function useChatThreads(participants: (string | undefined)[], role: 'customer' | 'vendor' | 'technician') {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validParticipants = participants.filter(Boolean) as string[];
    if (validParticipants.length === 0) {
      setLoading(false);
      return;
    }

    let q;
    if (role === 'customer') {
      q = query(collection(db, 'chat_threads'), where('customer_id', 'in', validParticipants));
    } else if (role === 'vendor') {
      q = query(collection(db, 'chat_threads'), where('vendor_id', 'in', validParticipants));
    } else {
      q = query(collection(db, 'chat_threads'), where('technician_id', 'in', validParticipants));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedThreads = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ChatThread[];
      // Sort by updated_at descending
      fetchedThreads.sort((a, b) => {
        const timeA = a.updated_at?.toDate?.()?.getTime() || 0;
        const timeB = b.updated_at?.toDate?.()?.getTime() || 0;
        return timeB - timeA;
      });
      setThreads(fetchedThreads);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching threads:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [JSON.stringify(participants), role]);

  return { threads, loading };
}

export function useChatMessages(threadId: string | null, userId?: string) {
  const [firestoreMessages, setFirestoreMessages] = useState<ChatMessage[]>([]);
  const [optimisticMessages, setOptimisticMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (firestoreMessages.length > 0 && userId && threadId) {
      const unreadMsgs = firestoreMessages.filter(m => m.sender_id !== userId && !m.is_read);
      if (unreadMsgs.length > 0) {
        unreadMsgs.forEach(m => {
          const msgRef = doc(db, 'chat_threads', threadId, 'messages', m.id);
          updateDoc(msgRef, { is_read: true }).catch(console.error);
        });
      }
    }
  }, [firestoreMessages, userId, threadId]);

  useEffect(() => {
    if (!threadId) {
      setFirestoreMessages([]);
      setOptimisticMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(
      collection(db, 'chat_threads', threadId, 'messages'),
      orderBy('created_at', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ChatMessage[];
      setFirestoreMessages(fetchedMessages);
      
      // Clear out optimistic messages that match the texts we just fetched
      // (a very basic reconciliation)
      setOptimisticMessages(prev => prev.filter(opt => 
        !fetchedMessages.some(fm => fm.text === opt.text && fm.sender_id === opt.sender_id)
      ));
      
      setLoading(false);
    }, (error) => {
      console.error("Error fetching messages:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [threadId]);

  const sendMessage = async (senderId: string, senderRole: 'customer' | 'vendor' | 'technician' | 'system', text: string, isLogistics = false, senderAvatar?: string) => {
    if (!threadId || !text.trim()) return;
    
    const tempId = 'temp_' + Date.now() + Math.random().toString(36).substr(2, 9);
    const optMsg: ChatMessage = {
      id: tempId,
      sender_id: senderId,
      sender_role: senderRole,
      text: text.trim(),
      created_at: new Date(),
      is_logistics: isLogistics,
      delivery_status: 'sending',
      sender_avatar: senderAvatar
    };
    
    setOptimisticMessages(prev => [...prev, optMsg]);
    
    try {
      // Use API instead of direct Firestore write for server-side validation
      const { default: api } = await import('../services/apiService');
      await api.post('/api/messages', {
        thread_id: threadId,
        sender_id: senderId,
        sender_role: senderRole,
        text: text.trim(),
        is_logistics: isLogistics,
        sender_avatar: senderAvatar
      });
      // On success, the firestore listener will pick it up and our reconciliation will remove the optimistic one
      // But we can also proactively clear it here if it's still 'sending'
    } catch (error) {
      console.error("Failed to send message:", error);
      setOptimisticMessages(prev => prev.map(m => m.id === tempId ? { ...m, delivery_status: 'failed' } : m));
      throw error;
    }
  };

  const retryMessage = async (msg: ChatMessage) => {
    // Remove the failed one and try sending again
    setOptimisticMessages(prev => prev.filter(m => m.id !== msg.id));
    await sendMessage(msg.sender_id, msg.sender_role, msg.text, msg.is_logistics, msg.sender_avatar);
  };

  const messages = [...firestoreMessages, ...optimisticMessages];

  return { messages, loading, sendMessage, retryMessage };
}
