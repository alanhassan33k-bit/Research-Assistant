import React from 'react';

interface ErrorDisplayProps {
    message: string | null;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => {
    if (!message) return null;

    return (
        <div className="mt-4 flex items-start gap-3 p-4 text-red-800 dark:text-red-200 bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 rounded-r-lg shadow-md animate-fade-in" role="alert">
            <div className="flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <div className="flex-1">
                <p className="font-semibold">Oops! Something went wrong.</p>
                <p className="text-sm">{message}</p>
            </div>
        </div>
    );
};
