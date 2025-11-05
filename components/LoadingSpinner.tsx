import React from 'react';

interface LoadingSpinnerProps {
    title?: string;
    subtitle?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    title = "Analyzing your topic...",
    subtitle = "This may take a moment as we scan the web."
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
      <svg className="h-10 w-10 text-sky-600" style={{ animation: 'spinner-rotate 2s linear infinite' }} viewBox="25 25 50 50">
        <circle className="spinner-path" cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="4" />
      </svg>
      <p className="mt-4 text-slate-600 dark:text-slate-300 text-lg">{title}</p>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
    </div>
  );
};