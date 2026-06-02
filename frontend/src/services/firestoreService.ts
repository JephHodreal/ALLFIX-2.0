import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  DocumentData,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Firestore service — direct client-side reads for real-time data.
 * Write operations should go through the Spring Boot API for validation.
 */

// ─── Generic Helpers ─────────────────────────────────────────────────────────

export async function getDocument<T = DocumentData>(
  collectionName: string,
  docId: string
): Promise<T | null> {
  const docRef = doc(db, collectionName, docId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as T;
}

export async function getCollection<T = DocumentData>(
  collectionName: string,
  ...constraints: QueryConstraint[]
): Promise<T[]> {
  const q = query(collection(db, collectionName), ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as T);
}

// ─── Real-time Listeners ────────────────────────────────────────────────────

export function subscribeToCollection<T = DocumentData>(
  collectionName: string,
  callback: (data: T[]) => void,
  ...constraints: QueryConstraint[]
) {
  const q = query(collection(db, collectionName), ...constraints);
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as T);
    callback(data);
  });
}

export function subscribeToDocument<T = DocumentData>(
  collectionName: string,
  docId: string,
  callback: (data: T | null) => void
) {
  const docRef = doc(db, collectionName, docId);
  return onSnapshot(docRef, (docSnap) => {
    if (!docSnap.exists()) {
      callback(null);
      return;
    }
    callback({ id: docSnap.id, ...docSnap.data() } as T);
  });
}

// ─── Notifications ──────────────────────────────────────────────────────────

export function subscribeToNotifications(
  userId: string,
  callback: (notifications: DocumentData[]) => void
) {
  return subscribeToCollection(
    'notifications',
    callback,
    where('user_id', '==', userId),
    orderBy('created_at', 'desc'),
    limit(50)
  );
}

// ─── Re-exports for convenience ─────────────────────────────────────────────

export { where, orderBy, limit, Timestamp };
