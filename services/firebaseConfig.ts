import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration from your project settings.
const firebaseConfig = {
  apiKey: "AIzaSyAONV9NucNnQLUwB0VWc6RuVdU2NH-Vwrw",
  authDomain: "alan-s-research-assistant.firebaseapp.com",
  projectId: "alan-s-research-assistant",
  storageBucket: "alan-s-research-assistant.firebasestorage.app",
  messagingSenderId: "329770685185",
  appId: "1:329770685185:web:604c411c7d76a139fcc100",
  measurementId: "G-VHD3HM1Q04"
};

// A basic check to see if the config is populated.
const isConfigured = !!(firebaseConfig.apiKey && firebaseConfig.projectId);

let db;
let analytics;
let auth;

if (isConfigured) {
    try {
        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        // Initialize Cloud Firestore and get a reference to the service
        db = getFirestore(app);
        // Initialize Firebase Analytics
        analytics = getAnalytics(app);
        // Initialize Firebase Authentication
        auth = getAuth(app);
    } catch (error) {
        console.error("Firebase initialization failed:", error);
    }
} else {
    console.warn("Firebase config is not set. Firestore features will be disabled. Please set up your environment variables in the project settings.");
}

export { db, auth, isConfigured };