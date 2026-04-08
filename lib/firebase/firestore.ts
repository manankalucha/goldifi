import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  QueryConstraint,
  DocumentData,
  WithFieldValue,
} from 'firebase/firestore';
import { db } from './config';

export { serverTimestamp };

// ---- Read helpers ------------------------------------------------
export const getDocument = async <T>(collectionName: string, id: string): Promise<T | null> => {
  const ref = doc(db, collectionName, id);
  const snap = await getDoc(ref);
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as T) : null;
};

export const getCollection = async <T>(
  collectionName: string,
  ...constraints: QueryConstraint[]
): Promise<T[]> => {
  const ref = collection(db, collectionName);
  const q = query(ref, ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as T));
};

// ---- Write helpers -----------------------------------------------
export const addDocument = async <T extends WithFieldValue<DocumentData>>(
  collectionName: string,
  data: T
): Promise<string> => {
  const ref = await addDoc(collection(db, collectionName), data);
  return ref.id;
};

export const setDocument = async <T extends WithFieldValue<DocumentData>>(
  collectionName: string,
  id: string,
  data: T
): Promise<void> => {
  await setDoc(doc(db, collectionName, id), data);
};

export const updateDocument = async (
  collectionName: string,
  id: string,
  data: Partial<DocumentData>
): Promise<void> => {
  await updateDoc(doc(db, collectionName, id), data);
};

export const deleteDocument = async (collectionName: string, id: string): Promise<void> => {
  await deleteDoc(doc(db, collectionName, id));
};

// ---- Real-time listener ------------------------------------------
export const subscribeToDocument = <T>(
  collectionName: string,
  id: string,
  callback: (data: T | null) => void
) => {
  const ref = doc(db, collectionName, id);
  return onSnapshot(ref, (snap) => {
    callback(snap.exists() ? ({ id: snap.id, ...snap.data() } as T) : null);
  });
};

export const subscribeToCollection = <T>(
  collectionName: string,
  callback: (data: T[]) => void,
  ...constraints: QueryConstraint[]
) => {
  const ref = collection(db, collectionName);
  const q = query(ref, ...constraints);
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as T)));
  });
};

// Re-export query builders for use in other files
export { where, orderBy };
