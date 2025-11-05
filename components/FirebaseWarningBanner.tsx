import React from 'react';

interface FirebaseWarningBannerProps {
    onClose: () => void;
}

export const FirebaseWarningBanner: React.FC<FirebaseWarningBannerProps> = ({ onClose }) => {
    return (
        <div className="mb-4 flex items-start gap-3 p-4 text-amber-800 dark:text-amber-200 bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-600 rounded-lg shadow-md animate-fade-in" role="alert">
            <div className="flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
            <div className="flex-1">
                <p className="font-semibold">Firebase Not Configured</p>
                <p className="text-sm">History will not be saved across sessions. To enable persistence, please set up your Firebase environment variables.</p>
            </div>
            <div className="flex-shrink-0">
                <button onClick={onClose} className="p-1 rounded-full hover:bg-amber-200 dark:hover:bg-amber-800 transition-colors" aria-label="Dismiss warning">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
        </div>
    );
};