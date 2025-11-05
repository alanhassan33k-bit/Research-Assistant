import * as pdfjsLib from 'pdfjs-dist/build/pdf.mjs';
import mammoth from 'mammoth';

// Required for pdf.js to work in a web environment. The URL points to the CDN specified in index.html.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://aistudiocdn.com/pdfjs-dist@^4.6.155/build/pdf.worker.mjs`;

const cleanExtractedText = (text: string): string => {
    let cleaned = text;

    // 1. Re-join words broken by hyphenation and a newline
    cleaned = cleaned.replace(/(\w)-(\s*\n\s*)(\w)/g, '$1$3');
    
    // 2. Normalize excessive whitespace but preserve paragraph breaks
    cleaned = cleaned.replace(/[ \t]{2,}/g, ' '); // Collapse horizontal whitespace (spaces, tabs)
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n'); // Collapse multiple newlines into a maximum of two
    
    // 3. Remove leading/trailing whitespace from each line, which can help with odd formatting
    cleaned = cleaned.split('\n').map(line => line.trim()).join('\n');
    
    return cleaned.trim();
};

export const readFileContent = async (file: File): Promise<string> => {
    let rawText: string;
    if (file.type === 'application/pdf') {
        rawText = await readPdfContent(file);
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.type === 'application/msword' || file.name.endsWith('.doc')) {
        rawText = await readDocxContent(file);
    } else if (file.type === 'text/plain') {
        rawText = await readTextContent(file);
    } else {
        throw new Error(`Unsupported file type: ${file.type}. Please upload a PDF, DOCX, DOC, or TXT file.`);
    }
    return cleanExtractedText(rawText);
};

const readPdfContent = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const numPages = pdf.numPages;
    let fullText = '';
    for (let i = 1; i <= numPages; i++) {
        try {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            // The item is of type TextItem, which has a 'str' property.
            fullText += textContent.items.map(item => 'str' in item ? item.str : '').join(' ') + '\n';
        } catch (error) {
            console.error(`Error processing page ${i}:`, error);
        }
    }
    return fullText;
};

const readDocxContent = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
};

const readTextContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result) {
                resolve(event.target.result as string);
            } else {
                reject(new Error('Failed to read text file.'));
            }
        };
        reader.onerror = () => {
            reject(new Error('Error reading text file.'));
        };
        reader.readAsText(file);
    });
};