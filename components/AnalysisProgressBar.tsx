import React from 'react';

interface AnalysisProgressBarProps {
  progress: number;
}

export const AnalysisProgressBar: React.FC<AnalysisProgressBarProps> = ({ progress }) => {
  return (
    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4 overflow-hidden border border-slate-300 dark:border-slate-600">
      <div
        className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-300 ease-out relative overflow-hidden"
        style={{ width: `${progress}%` }}
      >
        <div className="shimmer-effect"></div>
      </div>
    </div>
  );
};
