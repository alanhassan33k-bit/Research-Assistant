import React, { useMemo } from 'react';
import { FeedbackAnalysis } from '../types';

const BoldRenderer: React.FC<{ text: string }> = ({ text }) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return (
        <>
            {parts.map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={i}>{part.slice(2, -2)}</strong>;
                }
                return part;
            })}
        </>
    );
};

const parseFeedbackMarkdown = (markdown: string): FeedbackAnalysis => {
    const analysis: FeedbackAnalysis = {
        grade: 0,
        generalFeedback: 'Not found.',
        specificFeedback: []
    };
    
    const sections = markdown.split('### ').slice(1);

    sections.forEach(section => {
        if (section.startsWith('Predicted Grade')) {
            const gradeMatch = section.match(/Grade:\D*(\d+)/);
            if (gradeMatch) {
                analysis.grade = parseInt(gradeMatch[1], 10);
            }
        } else if (section.startsWith('General Feedback')) {
            analysis.generalFeedback = section.replace('General Feedback\n\n', '').trim();
        } else if (section.startsWith('Specific Feedback')) {
            const content = section.replace('Specific Feedback\n\n', '');
            // This regex is more robust: it captures the quote content regardless of the type of quotation marks used (or if they are omitted).
            const feedbackRegex = /- \*\*Quote:\*\*\s*(?<quote>[\s\S]+?)\s*-\s*\*\*Comment:\*\*\s*(?<comment>[\s\S]+?)(?=\n- \*\*Quote:\*\*|$)/g;
            const matches = content.matchAll(feedbackRegex);
            
            for (const match of matches) {
                if (match.groups) {
                    let quoteText = match.groups.quote.trim();
                    
                    // Clean up potential surrounding quotes of various types from the captured text.
                    if ((quoteText.startsWith('"') && quoteText.endsWith('"')) ||
                        (quoteText.startsWith('“') && quoteText.endsWith('”')) ||
                        (quoteText.startsWith("'") && quoteText.endsWith("'")) ||
                        (quoteText.startsWith('‘') && quoteText.endsWith('’'))) {
                        quoteText = quoteText.slice(1, -1);
                    }

                    analysis.specificFeedback.push({
                        quote: quoteText,
                        comment: match.groups.comment.trim(),
                    });
                }
            }
        }
    });

    return analysis;
};

const Section: React.FC<{title: string; children: React.ReactNode; icon: React.ReactNode}> = ({title, children, icon}) => (
    <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-slate-200/80 dark:border-slate-700/80 border-t-4 border-purple-500">
       <div className="flex items-center mb-4">
           <span className="text-purple-500">{icon}</span>
           <h2 className="ml-3 text-2xl font-semibold text-slate-800 dark:text-white">{title}</h2>
       </div>
       <div>{children}</div>
   </div>
 );

const GradeDisplay: React.FC<{ grade: number }> = ({ grade }) => {
    const getGradeColor = (g: number) => {
        if (g >= 90) return 'text-green-500';
        if (g >= 80) return 'text-sky-500';
        if (g >= 70) return 'text-yellow-500';
        if (g >= 60) return 'text-orange-500';
        return 'text-red-500';
    };
    return (
        <div className="text-center p-6 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">Predicted Grade</p>
            <p className={`text-7xl font-extrabold ${getGradeColor(grade)}`}>{grade}<span className="text-4xl text-slate-400 dark:text-slate-500">/100</span></p>
        </div>
    );
};

export const FeedbackDisplay: React.FC<{ markdownContent: string }> = ({ markdownContent }) => {
    const analysis = useMemo(() => parseFeedbackMarkdown(markdownContent), [markdownContent]);

    return (
        <div className="space-y-8 animate-fade-in">
            <div style={{animationDelay: '100ms'}} className="animate-fade-in">
                <Section title="Overall Score" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}>
                    <GradeDisplay grade={analysis.grade} />
                </Section>
            </div>
            
            <div style={{animationDelay: '200ms'}} className="animate-fade-in">
                <Section title="General Feedback" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V7a2 2 0 012-2h6l2-2h2l-2 2z" /></svg>}>
                    <div className="prose prose-sm dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
                         {analysis.generalFeedback.split('\n').map((line, index) => (
                            <p key={index} className="my-1">
                                <BoldRenderer text={line.replace(/^- /gm, '• ')} />
                            </p>
                        ))}
                    </div>
                </Section>
            </div>

            <div style={{animationDelay: '300ms'}} className="animate-fade-in">
                 <Section title="Specific Feedback" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>}>
                    <div className="space-y-4">
                        {analysis.specificFeedback.length > 0 ? analysis.specificFeedback.map((fb, index) => (
                            <div key={index} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border-l-4 border-purple-400">
                                <blockquote className="border-l-4 border-slate-300 dark:border-slate-500 pl-4 italic text-slate-500 dark:text-slate-400">
                                    “{fb.quote}”
                                </blockquote>
                                <p className="mt-2 text-slate-700 dark:text-slate-200">
                                    <BoldRenderer text={fb.comment} />
                                </p>
                            </div>
                        )) : <p className="text-slate-500 dark:text-slate-400">No specific feedback was found. The AI might have had trouble parsing the document.</p>}
                    </div>
                 </Section>
            </div>
        </div>
    );
};