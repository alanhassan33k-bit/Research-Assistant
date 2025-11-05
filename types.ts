
export interface Paper {
  title: string;
  authors: string;
  journal: string;
  year: string;
}

export interface TopicOverview {
    summary: string;
    educationLevel: string;
    prerequisites: string;
}

export type ViabilityStatus = "WISE_CHOICE" | "CAUTION_ADVISED" | "NOVEL_OPPORTUNITY" | "UNKNOWN";

export interface ViabilityAnalysis {
  status: ViabilityStatus;
  reasoning: string;
}

export interface StructureSection {
    title: string;
    coreContent: string;
    guidingQuestions: string;
    expertTip: string;
}

export interface ParsedAnalysis {
  papers: Paper[];
  overview: TopicOverview;
  viability: ViabilityAnalysis;
  structure: StructureSection[];
}

export interface InspirationTopic {
    title: string;
    description: string;
}

export interface HistoryItem {
  id: string;
  topic: string;
  analysis: string;
  timestamp: number;
}

// Types for Paper Feedback Feature
export type AcademicLevel = "High School" | "Undergraduate" | "Postgraduate" | "Professional";

export interface UploadedFile {
  name: string;
  size: number;
  type: string;
  content: string; // The extracted text content
}

export interface SpecificFeedback {
  quote: string;
  comment: string;
}

export interface FeedbackAnalysis {
  grade: number;
  generalFeedback: string;
  specificFeedback: SpecificFeedback[];
}
