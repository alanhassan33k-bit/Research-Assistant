import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { auth, isConfigured } from './firebaseConfig';

const provider = new GoogleAuthProvider();

export const signInWithGoogle = async (): Promise<User | null> => {
    if (!isConfigured || !auth) {
        console.error("Firebase Auth is not configured.");
        return null;
    }
    try {
        const result = await signInWithPopup(auth, provider);
        return result.user;
    } catch (error) {
        console.error("Error during sign in with Google: ", error);
        return null;
    }
};

export const logout = async (): Promise<void> => {
    if (!isConfigured || !auth) return;
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error signing out: ", error);
    }
};

export const onAuthChange = (callback: (user: User | null) => void): (() => void) => {
    if (!isConfigured || !auth) {
        // Immediately call back with null and return an empty unsubscribe function
        // if auth is not configured, to prevent the app from hanging in a loading state.
        callback(null);
        return () => {};
    }
    return onAuthStateChanged(auth, callback);
};