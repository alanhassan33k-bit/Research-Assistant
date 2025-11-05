import { collection, getDocs, addDoc, writeBatch, orderBy, query, limit } from 'firebase/firestore';
import { db, isConfigured } from './firebaseConfig';
import { HistoryItem } from '../types';

const USERS_COLLECTION = 'users';
const HISTORY_COLLECTION = 'analysisHistory';

const getHistoryCollectionRef = (userId: string) => {
    if (!db) throw new Error("Firestore is not initialized.");
    return collection(db, USERS_COLLECTION, userId, HISTORY_COLLECTION);
};

export const getHistory = async (userId: string): Promise<HistoryItem[]> => {
    if (!isConfigured || !userId) return [];
    try {
        const historyCollection = getHistoryCollectionRef(userId);
        const q = query(historyCollection, orderBy('timestamp', 'desc'), limit(50));
        const historySnapshot = await getDocs(q);
        const historyList = historySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as HistoryItem[];
        return historyList;
    } catch (error) {
        console.error("Error fetching history from Firestore: ", error);
        return [];
    }
};

export const addHistoryItem = async (userId: string, item: Omit<HistoryItem, 'id'>): Promise<HistoryItem | null> => {
    if (!isConfigured || !userId) return null;
    try {
        const historyCollection = getHistoryCollectionRef(userId);
        const docRef = await addDoc(historyCollection, item);
        return { ...item, id: docRef.id };
    } catch (error) {
        console.error("Error adding history item to Firestore: ", error);
        return null;
    }
};

export const clearHistory = async (userId: string): Promise<void> => {
    if (!isConfigured || !userId) return;
    try {
        const historyCollection = getHistoryCollectionRef(userId);
        const historySnapshot = await getDocs(historyCollection);

        if (historySnapshot.empty) return;

        const batch = writeBatch(db);
        historySnapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();
    } catch (error) {
        console.error("Error clearing history in Firestore: ", error);
    }
};