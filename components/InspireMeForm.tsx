import React, { useState } from 'react';

interface InspireMeFormProps {
  onInspire: (field: string, educationLevel: string) => void;
  isLoading: boolean;
}

const educationLevels = ['High School', 'Undergraduate', 'Postgraduate', 'Expert'];

export const InspireMeForm: React.FC<InspireMeFormProps> = ({ onInspire, isLoading }) => {
  const [field, setField] = useState('');
  const [educationLevel, setEducationLevel] = useState(educationLevels[1]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!field.trim()) return;
    onInspire(field, educationLevel);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      <div>
        <label htmlFor="field-input" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Field of Research
        </label>
        <input
          id="field-input"
          type="text"
          value={field}
          onChange={(e) => setField(e.target.value)}
          placeholder="e.g., Quantum Computing, Renaissance Art, Behavioral Economics"
          className="w-full p-3 text-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 focus:outline-none transition-all duration-300 shadow-sm focus:shadow-xl focus:shadow-purple-500/20"
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="education-level" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Your Education Level
        </label>
        <select
          id="education-level"
          value={educationLevel}
          onChange={(e) => setEducationLevel(e.target.value)}
          disabled={isLoading}
          className="w-full p-3 text-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 focus:outline-none transition-all duration-300 shadow-sm focus:shadow-xl focus:shadow-purple-500/20"
        >
          {educationLevels.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-center pt-2">
        <button
          type="submit"
          disabled={isLoading || !field.trim()}
          className="w-full sm:w-auto px-8 py-3 text-white font-semibold bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:shadow-lg hover:shadow-pink-500/50 hover:-translate-y-1 transform transition-all duration-300 ease-in-out disabled:from-slate-400 disabled:to-slate-400 dark:disabled:from-slate-600 dark:disabled:to-slate-600 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 dark:focus:ring-offset-slate-900 flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating Ideas...
            </>
          ) : (
            'Inspire Me'
          )}
        </button>
      </div>
    </form>
  );
};