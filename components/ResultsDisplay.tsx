import React, { useMemo, useState } from 'react';
import { Paper, ViabilityAnalysis, StructureSection, ViabilityStatus, ParsedAnalysis, TopicOverview } from '../types';

const parseMarkdown = (markdown: string): ParsedAnalysis => {
    const analysis: ParsedAnalysis = {
        papers: [],
        overview: { summary: 'Not found.', educationLevel: 'N/A', prerequisites: 'N/A' },
        viability: { status: 'UNKNOWN', reasoning: 'Not found.' },
        structure: []
    };

    const sections = markdown.split('### ').slice(1);

    sections.forEach(section => {
        if (section.startsWith('Topic Overview')) {
            const content = section.replace('Topic Overview\n\n', '').trim();
            const parts = content.split('\n- **');
            const summary = parts[0].trim() || 'No overview provided.';

            let educationLevel = 'N/A';
            let prerequisites = 'N/A';

            parts.slice(1).forEach(part => {
                if (part.startsWith('Education Level:')) {
                    educationLevel = part.replace(/Education Level:\*\* ?/, '').trim();
                } else if (part.startsWith('Prerequisites:')) {
                    prerequisites = part.replace(/Prerequisites:\*\* ?/, '').trim();
                }
            });
            
            analysis.overview = { summary, educationLevel, prerequisites };

        } else if (section.startsWith('Existing Research')) {
            const content = section.replace('Existing Research\n\n', '');
            const paperRegex = /-\s*\*\*Title:\*\*\s*(?<title>.*?)\n\s*-\s*\*\*Authors:\*\*\s*(?<authors>.*?)\n\s*-\s*\*\*Journal\/Conference:\*\*\s*(?<journal>.*?)\n\s*-\s*\*\*Year:\*\*\s*(?<year>.*)/g;
            
            const matches = content.matchAll(paperRegex);
            for (const match of matches) {
                if (match.groups) {
                    analysis.papers.push({
                        title: match.groups.title?.trim() || 'N/A',
                        authors: match.groups.authors?.trim() || 'N/A',
                        journal: match.groups.journal?.trim() || 'N/A',
                        year: match.groups.year?.trim() || 'N/A',
                    });
                }
            }
        } else if (section.startsWith('Topic Viability Analysis')) {
            const content = section.replace('Topic Viability Analysis\n\n', '').trim();
            const statusMatch = content.match(/(WISE_CHOICE|CAUTION_ADVISED|NOVEL_OPPORTUNITY)/);
            const status = statusMatch ? statusMatch[0] as ViabilityStatus : 'UNKNOWN';
            const reasoning = statusMatch ? content.replace(statusMatch[0], '').replace(/^[:\s*-]+/, '').trim() : content;
            
            analysis.viability = { status, reasoning };

        } else if (section.startsWith('Recommended Paper Structure')) {
            const content = section.replace('Recommended Paper Structure\n\n', '');
            
            const knownSections = ["Title", "Abstract", "Introduction", "Literature Review", "Methodology", "Experimentation/Data Collection", "Results", "Discussion", "Conclusion"];
            const titlesPattern = knownSections.map(s => s.replace(/[/]/g, '\\/')).join('|');
            const structureRegex = new RegExp(`\\s*(?:-|\\*|\\d+\\.)\\s+\\*\\*(?<title>${titlesPattern}):\\*\\*(?<details>[\\s\\S]*?)(?=\\n\\s*(?:-|\\*|\\d+\\.)\\s+\\*\\*(?:${titlesPattern}):\\*\\*|$)`, 'g');

            const matches = content.matchAll(structureRegex);
            for (const match of matches) {
                if (match.groups) {
                    const { title, details } = match.groups;
                    const coreContentMatch = details.match(/\*\*Core Content:\*\*\s*([\s\S]*?)(?=\n\s*-?\s*\*\*Guiding Questions:\*\*|\n\s*-?\s*\*\*Expert Tip:\*\*|$)/);
                    const guidingQuestionsMatch = details.match(/\*\*Guiding Questions:\*\*\s*([\s\S]*?)(?=\n\s*-?\s*\*\*Expert Tip:\*\*|$)/);
                    const expertTipMatch = details.match(/\*\*Expert Tip:\*\*\s*([\s\S]*?)$/);

                    analysis.structure.push({
                        title: title.trim(),
                        coreContent: coreContentMatch ? coreContentMatch[1].trim() : 'N/A',
                        guidingQuestions: guidingQuestionsMatch ? guidingQuestionsMatch[1].trim() : 'N/A',
                        expertTip: expertTipMatch ? expertTipMatch[1].trim() : 'N/A',
                    });
                }
            }
        }
    });

    return analysis;
};

const BoldRenderer: React.FC<{ text: string; strongClassName?: string }> = ({ text, strongClassName = '' }) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return (
        <>
            {parts.map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <span key={i} className={`font-bold ${strongClassName}`}>{part.slice(2, -2)}</span>;
                }
                return part;
            })}
        </>
    );
};

const ViabilityCard: React.FC<{ analysis: ViabilityAnalysis }> = ({ analysis }) => {
    const formatStatusToTitle = (status: ViabilityStatus): string => {
        switch (status) {
            case 'WISE_CHOICE': return 'Wise Choice';
            case 'CAUTION_ADVISED': return 'Caution Advised';
            case 'NOVEL_OPPORTUNITY': return 'Novel Opportunity';
            default: return 'Analysis';
        }
    };

    const config = {
        WISE_CHOICE: {
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
            iconBg: 'bg-green-500',
            borderColor: 'border-green-500',
            bgColor: 'bg-green-50 dark:bg-green-900/20',
            titleColor: 'text-green-700 dark:text-green-300',
        },
        CAUTION_ADVISED: {
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
            iconBg: 'bg-yellow-500',
            borderColor: 'border-yellow-500',
            bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
            titleColor: 'text-yellow-700 dark:text-yellow-300',
        },
        NOVEL_OPPORTUNITY: {
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
            iconBg: 'bg-purple-500',
            borderColor: 'border-purple-500',
            bgColor: 'bg-purple-50 dark:bg-purple-900/20',
            titleColor: 'text-purple-700 dark:text-purple-300',
        },
        UNKNOWN: {
           icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
           iconBg: 'bg-slate-400 dark:bg-slate-500',
           borderColor: 'border-slate-300 dark:border-slate-600',
           bgColor: 'bg-slate-100 dark:bg-slate-800/20',
           titleColor: 'text-slate-600 dark:text-slate-300',
        },
    }[analysis.status];

    return (
        <div className={`p-5 rounded-lg border-l-4 ${config.borderColor} ${config.bgColor}`}>
            <div className="flex items-start space-x-4">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full ${config.iconBg} flex items-center justify-center`}>
                    {config.icon}
                </div>
                <div className="flex-1">
                    <h3 className={`text-xl font-bold ${config.titleColor}`}>{formatStatusToTitle(analysis.status)}</h3>
                    <div className="mt-3 text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed prose prose-sm dark:prose-invert max-w-none">
                        <BoldRenderer text={analysis.reasoning} strongClassName={config.titleColor} />
                    </div>
                </div>
            </div>
        </div>
    );
};

const ShareButton: React.FC<{ analysis: ParsedAnalysis; topic: string }> = ({ analysis, topic }) => {
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        const { overview, viability } = analysis;
        const formattedStatus = viability.status
            .replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());

        const shareText = `Check out my research topic analysis for: "${topic}"\n\n- Viability: ${formattedStatus}\n- Overview: ${overview.summary}\n\nGenerated by the AI Research Assistant.`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Research Analysis: ${topic}`,
                    text: shareText,
                });
            } catch (error) {
                console.error('Error sharing:', error);
            }
        } else {
            try {
                await navigator.clipboard.writeText(shareText);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (error) {
                console.error('Error copying to clipboard:', error);
                alert('Failed to copy results to clipboard.');
            }
        }
    };

    return (
        <button
            onClick={handleShare}
            className="p-2 rounded-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm text-slate-500 dark:text-slate-400 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 hover:text-purple-500 dark:hover:text-purple-400 transition-all duration-200"
            aria-label="Share analysis"
        >
            {copied ? (
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                 </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367 2.684z" />
                </svg>
            )}
        </button>
    );
};


const StructureContent: React.FC<{ content: string }> = ({ content }) => {
    return (
      <div
        className="whitespace-pre-wrap text-slate-600 dark:text-slate-300 prose prose-sm dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{
          __html: content
            .replace(/^- /gm, '&bull; ')
            .replace(/\n/g, '<br />'),
        }}
      />
    );
};

const StructureAccordionItem: React.FC<{
    section: StructureSection;
    isOpen: boolean;
    onToggle: () => void;
}> = ({ section, isOpen, onToggle }) => {
    const [isAnimating, setIsAnimating] = useState(false);

    const handleToggleClick = () => {
        // If it's already open, just close it without animation.
        if (isOpen) {
            onToggle();
            return;
        }
        // If it's closed and not already animating, start the animation.
        if (!isAnimating) {
            setIsAnimating(true);
        }
    };

    const handleAnimationEnd = () => {
        setIsAnimating(false);
        // After the animation finishes, if the section isn't open yet,
        // call the parent to open it.
        if (!isOpen) {
            onToggle();
        }
    };

    return (
        <div
            className={`bg-slate-50 dark:bg-slate-700/50 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 transition-all duration-300 ${isAnimating ? 'animate-fall-wobble' : ''}`}
            onAnimationEnd={handleAnimationEnd}
        >
            <button
                onClick={handleToggleClick}
                className="w-full flex justify-between items-center p-4 text-left font-semibold text-indigo-800 dark:text-indigo-200 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
                <span>{section.title}</span>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                    />
                </svg>
            </button>
            <div
                className={`transition-all duration-500 ease-in-out grid ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
            >
                <div className="overflow-hidden">
                    <div className="p-4 border-t border-slate-200 dark:border-slate-600 space-y-4">
                        <div>
                            <h5 className="font-bold text-pink-600 dark:text-pink-400">Core Content</h5>
                            <StructureContent content={section.coreContent} />
                        </div>
                         <div>
                            <h5 className="font-bold text-pink-600 dark:text-pink-400">Guiding Questions</h5>
                            <StructureContent content={section.guidingQuestions} />
                        </div>
                         <div>
                            <h5 className="font-bold text-pink-600 dark:text-pink-400">Expert Tip</h5>
                            <StructureContent content={section.expertTip} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


interface ResultsDisplayProps {
  markdownContent: string;
  topic: string;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ markdownContent, topic }) => {
  const parsedAnalysis = useMemo(() => parseMarkdown(markdownContent), [markdownContent]);
  const { papers, overview, viability, structure } = parsedAnalysis;
  const [openSection, setOpenSection] = useState<number | null>(null);

  const toggleSection = (index: number) => {
    setOpenSection(prevIndex => prevIndex === index ? null : index);
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

  return (
    <div className="relative">
      <div className="absolute top-0 right-0 z-10">
        <ShareButton analysis={parsedAnalysis} topic={topic} />
      </div>
      <div className="space-y-8">
        <div className="animate-fade-in" style={{animationDelay: '100ms'}}>
          <Section title="Topic Overview" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>}>
              <div className="space-y-4">
                  <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{overview.summary}</p>
                  <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                          <h4 className="font-semibold text-slate-800 dark:text-slate-100">Education Level</h4>
                          <p className="mt-1 text-slate-600 dark:text-slate-300">{overview.educationLevel}</p>
                      </div>
                       <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                          <h4 className="font-semibold text-slate-800 dark:text-slate-100">Prerequisites</h4>
                          <p className="mt-1 text-slate-600 dark:text-slate-300">{overview.prerequisites}</p>
                      </div>
                  </div>
              </div>
          </Section>
        </div>

        <div className="animate-fade-in" style={{animationDelay: '200ms'}}>
          <Section title="Topic Viability Analysis" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>}>
            <ViabilityCard analysis={viability} />
          </Section>
        </div>
        
        <div className="animate-fade-in" style={{animationDelay: '300ms'}}>
          <Section title="Existing Research" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>}>
              <div className="space-y-4">
                  {papers.length > 0 ? papers.map((paper, index) => (
                      <div key={index} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600 transition-all duration-300 hover:shadow-md hover:border-purple-300 dark:hover:border-purple-500 hover:-translate-y-1">
                          <h4 className="font-semibold text-purple-700 dark:text-purple-400">
                             {paper.title}
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1"><span className="font-medium">Authors:</span> {paper.authors}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-300"><span className="font-medium">Publication:</span> {paper.journal} ({paper.year})</p>
                      </div>
                  )) : <p className="text-slate-500 dark:text-slate-400">No existing research papers were found based on the analysis.</p>}
              </div>
          </Section>
        </div>
          
        <div className="animate-fade-in" style={{animationDelay: '400ms'}}>
            <Section title="Recommended Paper Structure" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}>
                <div className="space-y-3">
                    {structure.length > 0 ? structure.map((item, index) => (
                        <StructureAccordionItem
                            key={index}
                            section={item}
                            isOpen={openSection === index}
                            onToggle={() => toggleSection(index)}
                        />
                    )) : <p className="text-slate-500 dark:text-slate-400">No recommended paper structure was found based on the analysis.</p>}
                </div>
            </Section>
        </div>
      </div>
    </div>
  );
};