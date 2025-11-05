import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const handleApiError = (error: unknown, context: string): Error => {
    console.error(`Error during Gemini API call for ${context}:`, error);

    let userMessage = `Failed to get ${context}. An unexpected error occurred. Please try again later.`;

    if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        if (errorMessage.includes('api key') || errorMessage.includes('permission denied')) {
            userMessage = `API Error: Could not authenticate. Please ensure your API key is correct and has the necessary permissions.`;
        } else if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
            userMessage = `Network Error: Could not connect to the AI service. Please check your internet connection and try again.`;
        } else if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
            userMessage = `Rate Limit Exceeded: You've made too many requests in a short period. Please wait a moment before trying again.`;
        } else if (errorMessage.includes('content has been blocked') || errorMessage.includes('safety')) {
            userMessage = `Content Safety: Your request was blocked due to safety settings. Please modify your input and try again.`;
        } else {
             userMessage = `An error occurred while fetching the ${context}: ${error.message}`;
        }
    }
    
    return new Error(userMessage);
};

const analysisSystemInstruction = "You are an expert academic research advisor. Your task is to provide a comprehensive analysis of a given research paper topic, formatted in Markdown as requested in the user prompt.";
const analysisPromptContent = (topic: string): string => `
Analyze the following research paper topic: "${topic}".

Please provide a comprehensive analysis in four distinct sections, formatted in Markdown.

### Topic Overview
Provide a brief, one-paragraph overview of the topic. Following the overview, use these exact labels on new lines:
- **Education Level:** [Specify minimum level, e.g., High School, Undergraduate, Postgraduate, Expert]
- **Prerequisites:** [List any prerequisite materials or knowledge required]

### Existing Research
Perform a deep search using Google Search for existing academic papers on this or very similar topics. List between 5 and 10 of the most relevant ones. For each paper, provide only the following details:
- **Title:** [Title of the paper]
- **Authors:** [List of authors]
- **Journal/Conference:** [Name of the journal or conference]
- **Year:** [Year of publication]

### Topic Viability Analysis
Based on your deep search, provide a **strict and critical** recommendation on the viability of this topic for a research paper. Your evaluation should be rigorous. Start the recommendation with one of three labels: "WISE_CHOICE", "CAUTION_ADVISED", or "NOVEL_OPPORTUNITY".

Use the following strict criteria for your classification:
- **NOVEL_OPPORTUNITY**: Reserve this classification *only* for topics that are genuinely groundbreaking, with minimal to no direct pre-existing research found. The potential for a completely new contribution must be exceptionally high and clearly demonstrable. Be highly critical before assigning this.
- **WISE_CHOICE**: This applies to topics with a solid foundation of existing research that also present a *clear, specific, and achievable* gap for a novel contribution. Do not assign this label if the field is oversaturated or if the potential contribution is merely incremental. The path to a meaningful contribution should be obvious.
- **CAUTION_ADVISED**: This should be your default classification for topics that are very broad, heavily saturated with existing research, or where a novel contribution would be extremely difficult to achieve. If there is any significant challenge, saturation, or ambiguity, choose this label.

After the label, provide detailed reasoning for your recommendation, using bullet points to highlight key arguments regarding research saturation, existing gaps, and the *difficulty* of making a novel contribution.

### Recommended Paper Structure
Provide a highly detailed, expert-level guide on how to structure a paper on this topic. For each standard academic section, provide the following three elements:
1.  **Core Content:** A clear description of what this section should contain.
2.  **Guiding Questions:** 2-3 key questions the author should answer within this section to ensure it's comprehensive.
3.  **Expert Tip:** A "pro-tip" or a common pitfall to avoid for this specific section, tailored to the research topic.

Structure your response for each section using markdown, for example:
- **Title:**
  - **Core Content:** [Description]
  - **Guiding Questions:**
    - [Question 1?]
    - [Question 2?]
  - **Expert Tip:** [Tip or Pitfall]
- **Abstract:**
  - **Core Content:** [Description]
  - **Guiding Questions:**
    - [Question 1?]
    - [Question 2?]
  - **Expert Tip:** [Tip or Pitfall]

...and so on for all standard sections including Introduction, Literature Review, Methodology, Experimentation/Data Collection (provide detailed, actionable ideas for experiments or data sources here), Results, Discussion, and Conclusion.
`;

export const analyzeTopic = async (topic: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: analysisPromptContent(topic),
      config: {
        systemInstruction: analysisSystemInstruction,
        tools: [{ googleSearch: {} }],
        temperature: 0.3,
      },
    });
    
    if (!response.text) {
        throw new Error("The AI returned an empty response. This might be due to a content safety filter. Please adjust your topic and try again.");
    }

    return response.text;
  } catch (error) {
    throw handleApiError(error, "analysis");
  }
};

const inspirationSystemInstruction = "You are an expert academic research advisor. Your task is to generate innovative research paper topics based on a field and education level, formatted in Markdown as requested in the user prompt.";
const inspirationPromptContent = (field: string, educationLevel: string): string => `
Generate a list of 5 to 7 innovative and suitable research paper topics for a student with the following profile:

- **Field of Research:** ${field}
- **Education Level:** ${educationLevel}

For each topic, provide a compelling title and a 2-3 sentence description explaining the topic's significance, potential research questions, and why it's a good fit for the specified education level.

Format the response in Markdown with each topic as a distinct section. Use the following structure for each topic, and nothing else:

### [Topic Title]
**Description:** [Your detailed description here]
`;


export const inspireTopics = async (field: string, educationLevel: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: inspirationPromptContent(field, educationLevel),
            config: {
                systemInstruction: inspirationSystemInstruction,
                tools: [{ googleSearch: {} }],
                temperature: 0.7,
            },
        });

        if (!response.text) {
            throw new Error("The AI returned an empty response. This might be due to a content safety filter. Please adjust your field of research and try again.");
        }

        return response.text;
    } catch (error) {
        throw handleApiError(error, "inspiration");
    }
};

const feedbackSystemInstruction = "You are a PhD-level academic reviewer. Your task is to provide a rigorous, in-depth critique of a research paper based on its text and the intended academic level. Format your feedback strictly in Markdown as requested.";

const feedbackPromptContent = (text: string, level: string, criteria?: string): string => `
Please provide a rigorous, PhD-level critique of the following research paper text. The paper is intended for the **${level}** academic level.
${criteria ? `
**Grading Criteria/Rubric:**
You MUST use the following criteria as the primary basis for your grade and feedback.
---
${criteria}
---
` : ''}
*Important: The provided text has been automatically extracted from a document and may contain formatting artifacts (e.g., broken words, strange spacing). Please do your best to interpret the text and provide feedback despite these potential issues.*

**Paper Text:**
---
${text.substring(0, 30000)}
---

**Your Task:**
Analyze the text and provide feedback in three distinct sections, formatted strictly in Markdown. If a rubric or criteria was provided, explicitly reference it in your feedback.

### Predicted Grade
Provide a single numerical grade out of 100. Be critical and base the grade on the standards for the specified academic level ${criteria ? 'and the provided rubric' : ''}.
- **Grade:** [Your numerical grade here]

### General Feedback
Provide high-level, constructive feedback on the paper's overall quality. Comment on the clarity of the thesis, the strength of the argument, the logical flow, the structure, and the writing style. Use bullet points for your main comments. ${criteria ? 'Relate your feedback to the provided criteria where applicable.' : ''}

### Specific Feedback
Identify specific areas for improvement directly from the text. For each point, provide a direct quote from the paper and your specific comment on how to improve it. List at least 5-10 specific points. Format each point as follows:
- **Quote:** "[The exact quote from the paper text]"
  - **Comment:** [Your detailed comment and suggestion for improvement]
`;

export const generateFeedback = async (text: string, level: string, criteria?: string): Promise<string> => {
  if (!text || text.trim().length < 50) {
    throw new Error("The document does not contain enough text to analyze. Please upload a valid paper.");
  }
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: feedbackPromptContent(text, level, criteria),
      config: {
        systemInstruction: feedbackSystemInstruction,
        temperature: 0.2, // Lower temperature for more focused, critical feedback
      },
    });
    
    if (!response.text) {
        throw new Error("The AI returned an empty response. This might be due to a content safety filter or an issue with the provided text.");
    }

    return response.text;
  } catch (error) {
    throw handleApiError(error, "paper feedback");
  }
};