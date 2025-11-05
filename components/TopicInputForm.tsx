import React, { useState } from 'react';

interface TopicInputFormProps {
  onAnalyze: (topic: string) => void;
  isLoading: boolean;
}

export const TopicInputForm: React.FC<TopicInputFormProps> = ({ onAnalyze, isLoading }) => {
  const [topic, setTopic] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze(topic);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8">
      <div className="relative">
        <textarea
          id="topic-input"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g., The impact of machine learning on financial forecasting models"
          className="w-full h-32 p-4 text-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 focus:outline-none transition-all duration-300 resize-none shadow-sm focus:shadow-xl focus:shadow-purple-500/20"
          disabled={isLoading}
          rows={3}
        />
      </div>
      <div className="flex justify-center mt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto px-8 py-3 text-white font-semibold bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:shadow-lg hover:shadow-pink-500/50 hover:-translate-y-1 transform transition-all duration-300 ease-in-out disabled:from-slate-400 disabled:to-slate-400 dark:disabled:from-slate-600 dark:disabled:to-slate-600 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 dark:focus:ring-offset-slate-900 flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing...
            </>
          ) : (
            'Analyze Topic'
          )}
        </button>
      </div>
    </form>
  );
};