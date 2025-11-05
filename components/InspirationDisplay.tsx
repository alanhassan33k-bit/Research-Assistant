import React, { useMemo } from 'react';
import { InspirationTopic } from '../types';

interface InspirationDisplayProps {
  markdownContent: string;
  onAnalyzeTopic: (topic: string) => void;
}

const parseInspirationMarkdown = (markdown: string): InspirationTopic[] => {
    const topics: InspirationTopic[] = [];
    const topicBlocks = markdown.split('### ').slice(1);

    topicBlocks.forEach(block => {
        const titleMatch = block.match(/^(.*?)\n/);
        const descriptionMatch = block.match(/\*\*Description:\*\* ([\s\S]*)/);
        
        if (titleMatch && descriptionMatch) {
            topics.push({
                title: titleMatch[1].trim().replace(/\[|\]/g, ''),
                description: descriptionMatch[1].trim()
            });
        }
    });

    return topics;
};

export const InspirationDisplay: React.FC<InspirationDisplayProps> = ({ markdownContent, onAnalyzeTopic }) => {
  const topics = useMemo(() => parseInspirationMarkdown(markdownContent), [markdownContent]);

  return (
    <div className="animate-fade-in">
        <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-slate-200/80 dark:border-slate-700/80 border-t-4 border-purple-500">
            <div className="flex items-center mb-4">
                <span className="text-purple-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                </span>
                <h2 className="ml-3 text-2xl font-semibold text-slate-800 dark:text-white">Generated Research Ideas</h2>
            </div>
            <div className="space-y-4">
                {topics.length > 0 ? topics.map((topic, index) => (
                    <div key={index} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600 transition-all duration-200 hover:shadow-md hover:border-purple-300 dark:hover:border-purple-500 hover:-translate-y-1">
                        <button
                            onClick={() => onAnalyzeTopic(topic.title)}
                            className="w-full text-left font-semibold text-lg text-purple-700 dark:text-purple-400 hover:underline focus:outline-none focus:ring-2 focus:ring-purple-400 rounded-sm"
                        >
                            {topic.title}
                        </button>
                        <p className="mt-2 text-slate-600 dark:text-slate-300">{topic.description}</p>
                    </div>
                )) : (
                     <p className="text-slate-500 dark:text-slate-400">Could not generate any topics. You could try rephrasing your research field.</p>
                )}
            </div>
        </div>
    </div>
  );
};
