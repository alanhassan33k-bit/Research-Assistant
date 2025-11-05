import React, { useState, useCallback } from 'react';
import { AcademicLevel } from '../types';

interface PaperFeedbackFormProps {
  onGetFeedback: (file: File, level: AcademicLevel, criteriaFile: File | null) => void;
  isLoading: boolean;
}

const academicLevels: AcademicLevel[] = ["High School", "Undergraduate", "Postgraduate", "Professional"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_FILE_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'text/plain'];

export const PaperFeedbackForm: React.FC<PaperFeedbackFormProps> = ({ onGetFeedback, isLoading }) => {
  const [file, setFile] = useState<File | null>(null);
  const [criteriaFile, setCriteriaFile] = useState<File | null>(null);
  const [level, setLevel] = useState<AcademicLevel>(academicLevels[1]);
  const [error, setError] = useState<string | null>(null);
  const [criteriaError, setCriteriaError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isCriteriaDragging, setIsCriteriaDragging] = useState(false);
  const [showCriteriaUpload, setShowCriteriaUpload] = useState(false);

  const handleFileChange = (files: FileList | null) => {
    setError(null);
    setFile(null);
    if (files && files.length > 0) {
      const selectedFile = files[0];
      if (selectedFile.size > MAX_FILE_SIZE) {
        setError(`File is too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024} MB.`);
        return;
      }
      if (!ACCEPTED_FILE_TYPES.includes(selectedFile.type) && !selectedFile.name.endsWith('.doc')) {
        setError('Invalid file type. Please upload a PDF, DOCX, DOC, or TXT file.');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleCriteriaFileChange = (files: FileList | null) => {
    setCriteriaError(null);
    setCriteriaFile(null);
    if (files && files.length > 0) {
        const selectedFile = files[0];
        if (selectedFile.size > MAX_FILE_SIZE) {
            setCriteriaError(`Criteria file is too large. Max ${MAX_FILE_SIZE / 1024 / 1024} MB.`);
            return;
        }
        if (!ACCEPTED_FILE_TYPES.includes(selectedFile.type) && !selectedFile.name.endsWith('.doc')) {
            setCriteriaError('Invalid file type. Please upload a PDF, DOCX, DOC, or TXT file.');
            return;
        }
        setCriteriaFile(selectedFile);
    }
  };

  const createDragHandler = (setter: React.Dispatch<React.SetStateAction<boolean>>) => (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
        setter(true);
    } else if (e.type === 'dragleave') {
        setter(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  };

  const handleCriteriaDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsCriteriaDragging(false);
    handleCriteriaFileChange(e.dataTransfer.files);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (file && !isLoading) {
      onGetFeedback(file, level, criteriaFile);
    } else if (!file) {
      setError("Please upload a paper to get feedback.");
    }
  };

  const Dropzone: React.FC<{
    id: string;
    onFileChange: (files: FileList | null) => void;
    onDrag: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
    isDragging: boolean;
    mainText: React.ReactNode;
    subText: string;
    selectedFile: File | null;
    errorText: string | null;
  }> = ({ id, onFileChange, onDrag, onDrop, isDragging, mainText, subText, selectedFile, errorText }) => (
    <div
      onDragEnter={onDrag} onDragOver={onDrag} onDragLeave={onDrag} onDrop={onDrop}
      className={`relative block w-full border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors duration-300 ${isDragging ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-slate-300 dark:border-slate-600 hover:border-purple-400'}`}
    >
      <input id={id} type="file" className="sr-only" onChange={(e) => onFileChange(e.target.files)} accept={ACCEPTED_FILE_TYPES.join(',')} disabled={isLoading} />
      <label htmlFor={id} className="cursor-pointer">
        <svg className="mx-auto h-10 w-10 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        <p className="mt-2 block text-sm font-medium text-slate-700 dark:text-slate-300">{mainText}</p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{subText}</p>
        {selectedFile && <p className="mt-3 text-sm font-semibold text-green-600 dark:text-green-400">Selected: {selectedFile.name}</p>}
        {errorText && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errorText}</p>}
      </label>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      <Dropzone
        id="file-upload"
        onFileChange={handleFileChange}
        onDrag={createDragHandler(setIsDragging)}
        onDrop={handleDrop}
        isDragging={isDragging}
        mainText={<><span className="text-purple-600 dark:text-purple-400">Upload your paper</span> or drag and drop</>}
        subText="PDF, DOCX, DOC, or TXT (Max 5MB)"
        selectedFile={file}
        errorText={error}
      />
      
      {/* Optional Criteria Section */}
      {!showCriteriaUpload && (
        <div className="text-center">
            <button type="button" onClick={() => setShowCriteriaUpload(true)} className="text-sm font-semibold text-purple-600 dark:text-purple-400 hover:underline">
                + Add Rubric / Criteria (Optional)
            </button>
        </div>
      )}

      {showCriteriaUpload && (
        <div className="space-y-2 animate-fade-in">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Grading Criteria (Optional)
            </label>
             <Dropzone
                id="criteria-upload"
                onFileChange={handleCriteriaFileChange}
                onDrag={createDragHandler(setIsCriteriaDragging)}
                onDrop={handleCriteriaDrop}
                isDragging={isCriteriaDragging}
                mainText={<><span className="text-purple-600 dark:text-purple-400">Upload rubric</span> or drag and drop</>}
                subText="PDF, DOCX, DOC, or TXT (Max 5MB)"
                selectedFile={criteriaFile}
                errorText={criteriaError}
            />
        </div>
      )}
      
      {/* Academic Level */}
      <div>
        <label htmlFor="academic-level" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Intended Academic Level
        </label>
        <select
          id="academic-level"
          value={level}
          onChange={(e) => setLevel(e.target.value as AcademicLevel)}
          disabled={isLoading}
          className="w-full p-3 text-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 focus:outline-none transition-all duration-300 shadow-sm"
        >
          {academicLevels.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center pt-2">
        <button
          type="submit"
          disabled={isLoading || !file}
          className="w-full sm:w-auto px-8 py-3 text-white font-semibold bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:shadow-lg hover:shadow-pink-500/50 hover:-translate-y-1 transform transition-all duration-300 ease-in-out disabled:from-slate-400 disabled:to-slate-400 dark:disabled:from-slate-600 dark:disabled:to-slate-600 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 dark:focus:ring-offset-slate-900 flex items-center justify-center"
        >
          {isLoading ? 'Getting Feedback...' : 'Get Feedback'}
        </button>
      </div>
    </form>
  );
};