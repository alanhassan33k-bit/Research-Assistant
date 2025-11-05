import React, { useState, useCallback, useEffect, useRef } from 'react';
import { TopicInputForm } from './components/TopicInputForm';
import { ResultsDisplay } from './components/ResultsDisplay';
import { analyzeTopic, inspireTopics, generateFeedback } from './services/geminiService';
import { InspireMeForm } from './components/InspireMeForm';
import { InspirationDisplay } from './components/InspirationDisplay';
import { PaperFeedbackForm } from './components/PaperFeedbackForm';
import { FeedbackDisplay } from './components/FeedbackDisplay';
import { ErrorDisplay } from './components/ErrorDisplay';
import { HistoryPanel } from './components/HistoryPanel';
import { AnalysisProgressBar } from './components/AnalysisProgressBar';
import { HistoryItem, AcademicLevel } from './types';
import { readFileContent } from './utils/fileReader';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ThemeToggle } from './components/ThemeToggle';

type ActiveTab = 'analyzer' | 'inspirer' | 'feedback';
type Theme = 'light' | 'dark';

const getInitialTheme = (): Theme => {
    try {
        const item = localStorage.getItem('researchAnalyzerTheme');
        if (item === 'light' || item === 'dark') {
            return item;
        }
    } catch (error) {
         console.warn('Could not read theme from localStorage', error);
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const Header: React.FC<{ 
    theme: Theme; 
    onThemeToggle: () => void;
}> = ({ theme, onThemeToggle }) => (
    <header className="relative text-center p-4 md:p-6 mb-4">
      <div className="absolute top-1/2 right-0 -translate-y-1/2">
        <ThemeToggle theme={theme} onToggle={onThemeToggle} />
      </div>
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 pb-2" style={{ textShadow: '0 0 25px rgba(192, 132, 252, 0.4)' }}>
        Alan's Research Assistant
      </h1>
      <p className="mt-2 text-lg text-slate-500 dark:text-slate-400">
        Analyze topics, get paper feedback, and find inspiration.
      </p>
    </header>
);

const TabButton: React.FC<{
    label: string;
    isActive: boolean;
    onClick: () => void;
    icon: React.ReactNode;
}> = ({ label, isActive, onClick, icon }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-6 py-3 font-semibold rounded-t-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 border-b-4 transform hover:-translate-y-1 ${
        isActive
          ? 'bg-white dark:bg-slate-800/60 border-purple-500 text-purple-600 dark:text-purple-400 scale-105'
          : 'bg-transparent border-transparent text-slate-500 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 hover:text-slate-800 dark:hover:text-slate-200'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
);

const AnalyzerWelcomeMessage: React.FC = () => (
    <div className="text-center p-8 bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 border-t-4 border-purple-500">
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242z" />
        </svg>
        <h2 className="mt-4 text-2xl font-semibold text-slate-800 dark:text-white">Discover Your Research Potential</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
            Enter a topic to receive a detailed analysis, including existing literature, viability assessment, and a structural guide to kickstart your writing process.
        </p>
    </div>
);

const InspirerWelcomeMessage: React.FC = () => (
    <div className="text-center p-8 bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 border-t-4 border-purple-500">
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-pink-500 animate-pulse-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <h2 className="mt-4 text-2xl font-semibold text-slate-800 dark:text-white">Feeling Stuck? Find Inspiration.</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
            Tell us your field of interest and education level, and we'll generate novel research paper topics to spark your creativity.
        </p>
    </div>
);

const FeedbackWelcomeMessage: React.FC = () => (
    <div className="text-center p-8 bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 border-t-4 border-purple-500">
       <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
       </svg>
        <h2 className="mt-4 text-2xl font-semibold text-slate-800 dark:text-white">Get Expert Paper Feedback</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
            Upload your paper (PDF, DOCX, or TXT) and select the intended academic level to receive a detailed critique and a predicted grade from our AI reviewer.
        </p>
    </div>
);

const APP_STATE_KEY = 'researchAnalyzerState';

const getInitialState = () => {
  try {
    const savedState = localStorage.getItem(APP_STATE_KEY);
    if (savedState) {
      return JSON.parse(savedState);
    }
  } catch (error) {
    console.warn('Could not load saved state from localStorage', error);
  }
  return {
    activeTab: 'analyzer',
    analysis: null,
    analyzedTopic: '',
    inspiration: null,
    feedback: null,
    history: [],
  };
};

const App: React.FC = () => {
  const initialState = getInitialState();
  const [activeTab, setActiveTab] = useState<ActiveTab>(initialState.activeTab);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  
  // State for Topic Analyzer
  const [analysis, setAnalysis] = useState<string | null>(initialState.analysis);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analyzerError, setAnalyzerError] = useState<string | null>(null);
  const [analyzedTopic, setAnalyzedTopic] = useState<string>(initialState.analyzedTopic);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  // State for Inspire Me
  const [inspiration, setInspiration] = useState<string | null>(initialState.inspiration);
  const [isInspiring, setIsInspiring] = useState<boolean>(false);
  const [inspirerError, setInspirerError] = useState<string | null>(null);
  
  // State for Paper Feedback
  const [feedback, setFeedback] = useState<string | null>(initialState.feedback);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState<boolean>(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [feedbackProgress, setFeedbackProgress] = useState(0);
  
  // State for progress simulation
  const progressAnimationRef = useRef<number | null>(null);

  // State for History
  const [history, setHistory] = useState<HistoryItem[]>(initialState.history);
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState<boolean>(false);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);

  // Effect for saving state to localStorage
  useEffect(() => {
    try {
      const stateToSave = {
        activeTab,
        analysis,
        analyzedTopic,
        inspiration,
        feedback,
        history,
      };
      localStorage.setItem(APP_STATE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
      console.warn('Could not save state to localStorage', error);
    }
  }, [activeTab, analysis, analyzedTopic, inspiration, feedback, history]);

  // Effect for Theme
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'dark' ? 'light' : 'dark');
    root.classList.add(theme);
    try {
        localStorage.setItem('researchAnalyzerTheme', theme);
    } catch (error) {
        console.warn(`Could not save theme to localStorage`, error);
    }
  }, [theme]);
  
  const handleThemeToggle = useCallback(() => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  }, []);

  const startProgressSimulation = useCallback((setProgress: React.Dispatch<React.SetStateAction<number>>) => {
    setProgress(0);
    if (progressAnimationRef.current) {
        cancelAnimationFrame(progressAnimationRef.current);
    }

    let startTime: number | null = null;
    const totalSimulatedDuration = 10000; // 10 seconds to reach 90%
    const stallPoint = 90;

    const animate = (timestamp: number) => {
        if (startTime === null) {
            startTime = timestamp;
            // Set initial progress to 1% immediately for instant feedback
            setProgress(1);
        }
        const elapsedTime = timestamp - startTime;
        
        // Linear progress from 1% to 90% over the duration
        const progress = 1 + (elapsedTime / totalSimulatedDuration) * (stallPoint - 1);

        const cappedProgress = Math.min(stallPoint, progress);
        
        setProgress(cappedProgress);

        if (cappedProgress < stallPoint) {
            progressAnimationRef.current = requestAnimationFrame(animate);
        }
    };

    progressAnimationRef.current = requestAnimationFrame(animate);

  }, []);

  const finishProgressSimulation = useCallback((setProgress: React.Dispatch<React.SetStateAction<number>>, onFinish: () => void) => {
    if (progressAnimationRef.current) {
        cancelAnimationFrame(progressAnimationRef.current);
    }
    setProgress(100);
    setTimeout(() => {
        onFinish();
        setProgress(0);
    }, 500);
  }, []);

  const handleAnalyze = useCallback(async (topic: string) => {
    if (!topic.trim()) {
      setAnalyzerError("Please enter a research topic.");
      return;
    }
    setAnalyzedTopic(topic);
    setIsAnalyzing(true);
    setAnalyzerError(null);
    setAnalysis(null);
    startProgressSimulation(setAnalysisProgress);

    try {
      const result = await analyzeTopic(topic);
      setAnalysis(result);
      
      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        topic,
        analysis: result,
        timestamp: Date.now(),
      };
      
      setHistory(prevHistory => {
          const filteredHistory = prevHistory.filter(item => item.topic.toLowerCase() !== topic.toLowerCase());
          const updatedHistory = [newHistoryItem, ...filteredHistory];
          if (updatedHistory.length > 50) {
              updatedHistory.pop();
          }
          return updatedHistory;
      });
      setSelectedHistoryId(newHistoryItem.id);

    } catch (err) {
      setAnalyzerError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      finishProgressSimulation(setAnalysisProgress, () => setIsAnalyzing(false));
    }
  }, [startProgressSimulation, finishProgressSimulation]);

  const handleInspire = useCallback(async (field: string, educationLevel: string) => {
    if (!field.trim()) {
      setInspirerError("Please enter a field of research.");
      return;
    }
    setIsInspiring(true);
    setInspirerError(null);
    setInspiration(null);

    try {
      const result = await inspireTopics(field, educationLevel);
      setInspiration(result);
    } catch (err) {
      setInspirerError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsInspiring(false);
    }
  }, []);

  const handleAnalyzeInspiredTopic = useCallback((topic: string) => {
    setActiveTab('analyzer');
    handleAnalyze(topic);
  }, [handleAnalyze]);

  const handleGetFeedback = useCallback(async (file: File, level: AcademicLevel, criteriaFile: File | null) => {
    setIsGeneratingFeedback(true);
    setFeedbackError(null);
    setFeedback(null);
    startProgressSimulation(setFeedbackProgress);

    try {
      const textContent = await readFileContent(file);
      let criteriaContent: string | undefined = undefined;
      if (criteriaFile) {
        criteriaContent = await readFileContent(criteriaFile);
      }
      const result = await generateFeedback(textContent, level, criteriaContent);
      setFeedback(result);
    } catch (err) {
      setFeedbackError(err instanceof Error ? err.message : "An unknown error occurred during feedback generation.");
    } finally {
      finishProgressSimulation(setFeedbackProgress, () => setIsGeneratingFeedback(false));
    }
  }, [startProgressSimulation, finishProgressSimulation]);

  const handleSelectFromHistory = useCallback((item: HistoryItem) => {
    setActiveTab('analyzer');
    setAnalyzedTopic(item.topic);
    setAnalysis(item.analysis);
    setSelectedHistoryId(item.id);
    setAnalyzerError(null);
    setInspiration(null);
    setInspirerError(null);
    setFeedback(null);
    setFeedbackError(null);
    setIsHistoryPanelOpen(false);
  }, []);

  const handleClearHistory = useCallback(async () => {
    setHistory([]);
    setSelectedHistoryId(null);
  }, []);

  const toggleHistoryPanel = useCallback(() => {
    setIsHistoryPanelOpen(prev => !prev);
  }, []);

  return (
    <div className="min-h-screen font-sans">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Header theme={theme} onThemeToggle={handleThemeToggle} />
        
        <div className="flex justify-center border-b border-slate-300 dark:border-slate-700">
            <TabButton 
                label="Topic Analyzer" 
                isActive={activeTab === 'analyzer'} 
                onClick={() => setActiveTab('analyzer')}
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>}
            />
            <TabButton 
                label="Inspire Me" 
                isActive={activeTab === 'inspirer'} 
                onClick={() => setActiveTab('inspirer')} 
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>}
            />
            <TabButton 
                label="Paper Feedback" 
                isActive={activeTab === 'feedback'} 
                onClick={() => setActiveTab('feedback')} 
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>}
            />
        </div>

        <div className="mt-6">
          {activeTab === 'analyzer' && (
              <div className="animate-fade-in" key="analyzer">
                  <TopicInputForm onAnalyze={handleAnalyze} isLoading={isAnalyzing} />
                  <ErrorDisplay message={analyzerError} />
                  <div className="mt-8">
                      {isAnalyzing && (
                          <div className="flex flex-col items-center justify-center p-10 bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
                              <p className="mb-4 text-slate-600 dark:text-slate-300 text-lg">Analyzing your topic...</p>
                              <AnalysisProgressBar progress={analysisProgress} />
                              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">The AI is scanning the web and assessing viability.</p>
                          </div>
                      )}
                      {!isAnalyzing && !analysis && !analyzerError && <AnalyzerWelcomeMessage />}
                      {analysis && <ResultsDisplay markdownContent={analysis} topic={analyzedTopic} />}
                  </div>
              </div>
          )}

          {activeTab === 'inspirer' && (
              <div className="animate-fade-in" key="inspirer">
                  <InspireMeForm onInspire={handleInspire} isLoading={isInspiring} />
                  <ErrorDisplay message={inspirerError} />
                  <div className="mt-8">
                      {isInspiring && <LoadingSpinner title="Generating ideas..." subtitle="The AI is exploring novel concepts for you." />}
                      {!isInspiring && !inspiration && !inspirerError && <InspirerWelcomeMessage />}
                      {inspiration && <InspirationDisplay markdownContent={inspiration} onAnalyzeTopic={handleAnalyzeInspiredTopic} />}
                  </div>
              </div>
          )}

          {activeTab === 'feedback' && (
              <div className="animate-fade-in" key="feedback">
                  <PaperFeedbackForm onGetFeedback={handleGetFeedback} isLoading={isGeneratingFeedback} />
                  <ErrorDisplay message={feedbackError} />
                  <div className="mt-8">
                      {isGeneratingFeedback && (
                          <div className="flex flex-col items-center justify-center p-10 bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
                              <p className="mb-4 text-slate-600 dark:text-slate-300 text-lg">Critiquing your paper...</p>
                              <AnalysisProgressBar progress={feedbackProgress} />
                              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">The AI is performing a deep analysis of your work.</p>
                          </div>
                      )}
                      {!isGeneratingFeedback && !feedback && !feedbackError && <FeedbackWelcomeMessage />}
                      {feedback && <FeedbackDisplay markdownContent={feedback} />}
                  </div>
              </div>
          )}
        </div>
      </main>
      
      <HistoryPanel
        isOpen={isHistoryPanelOpen}
        history={history}
        onSelect={handleSelectFromHistory}
        onClear={handleClearHistory}
        onToggle={toggleHistoryPanel}
        selectedId={selectedHistoryId}
      />
      
      <footer className="text-center p-6 text-sm text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700 mt-8">
        Powered by Gemini API
      </footer>
    </div>
  );
};

export default App;