import React from 'react';
import { HistoryItem } from '../types';

interface HistoryPanelProps {
  history: HistoryItem[];
  isOpen: boolean;
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
  onToggle: () => void;
  selectedId: string | null;
}

const timeSince = (timestamp: number) => {
    const seconds = Math.floor((new Date().getTime() - timestamp) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
};

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, isOpen, onSelect, onClear, onToggle, selectedId }) => {
    return (
        <>
            {/* Floating Toggle Button */}
            <button
                onClick={onToggle}
                className="fixed bottom-6 right-6 z-40 w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-lg hover:scale-110 transform transition-all duration-300 flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-purple-300 dark:focus:ring-purple-800"
                aria-label="Toggle search history"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </button>
            
            {/* History Panel */}
            <div className={`fixed top-0 right-0 h-full w-full md:w-96 bg-white dark:bg-slate-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Search History</h3>
                        <button onClick={onToggle} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" aria-label="Close history panel">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-grow overflow-y-auto p-4 space-y-3">
                        {history.length > 0 ? (
                            history.map(item => {
                                const isSelected = item.id === selectedId;
                                return (
                                <button
                                    key={item.id}
                                    onClick={() => onSelect(item)}
                                    className={`w-full text-left p-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                                        isSelected 
                                        ? 'bg-purple-100 dark:bg-purple-900/50 border-l-4 border-purple-500' 
                                        : 'bg-slate-50 hover:bg-purple-100 dark:bg-slate-800 dark:hover:bg-purple-900/40 border border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-600'
                                    }`}
                                >
                                    <p className="font-semibold text-slate-700 dark:text-slate-200 truncate">{item.topic}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{timeSince(item.timestamp)}</p>
                                </button>
                                );
                            })
                        ) : (
                            <div className="text-center py-10">
                                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6M9 17h6m-9-4h18M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" /></svg>
                                <p className="mt-4 text-slate-500 dark:text-slate-400">Your search history is empty.</p>
                                <p className="text-sm text-slate-400">Analyses will appear here after you search.</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {history.length > 0 && (
                        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                            <button
                                onClick={onClear}
                                className="w-full py-2 px-4 text-sm font-semibold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                Clear History
                            </button>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Overlay */}
            {isOpen && <div onClick={onToggle} className="fixed inset-0 bg-black/40 z-40 transition-opacity duration-300"></div>}
        </>
    );
};