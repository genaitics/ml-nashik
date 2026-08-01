import React, { useState, useRef } from 'react';
import { DocumentUploadResponse } from '../types';
import { UploadCloud, FileText, CheckCircle2, Sparkles, AlertCircle, ArrowRight, RefreshCw, FileCode } from 'lucide-react';
import { api } from '../api/client';

interface UploadPageProps {
  onUploadSuccess: (docData: DocumentUploadResponse, fileObj?: File) => void;
  onGenerateQuiz: () => void;
  isGenerating: boolean;
  uploadedDoc: DocumentUploadResponse | null;
}

export const UploadPage: React.FC<UploadPageProps> = ({
  onUploadSuccess,
  onGenerateQuiz,
  isGenerating,
  uploadedDoc,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    setSelectedFile(file);
    setIsUploading(true);
    setProgress(15);

    const interval = setInterval(() => {
      setProgress((prev) => (prev < 85 ? prev + 15 : prev));
    }, 500);

    try {
      const response = await api.uploadSyllabus(file);
      clearInterval(interval);
      setProgress(100);
      
      setTimeout(() => {
        setIsUploading(false);
        onUploadSuccess(response, file);
      }, 500);
    } catch (err) {
      clearInterval(interval);
      setIsUploading(false);
      alert("Upload failed. Make sure your backend is running.");
      console.error("Upload error:", err);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };


  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      
      {/* Page Heading */}
      <div className="text-center space-y-3">
        <span className="text-xs font-mono uppercase tracking-widest text-ink-pencil bg-paper-container px-3 py-1 rounded-full border border-ink/10 inline-block font-semibold">
          Step 1 • Document Ingestion
        </span>
        <h1 className="font-serif font-bold text-3xl sm:text-4xl text-ink">
          Upload Syllabus & <span className="highlighter-effect">Generate Quiz</span>
        </h1>
        <p className="text-ink-muted max-w-xl mx-auto text-base">
          Drop your course syllabus, lecture notes, or PDF textbook. Pariksha AI extracts core concepts and builds an instant RAG-grounded quiz.
        </p>
      </div>


      {/* Main Upload Paper Card */}
      <div className="bg-paper-surface rounded-2xl border-2 border-ink shadow-paper-lg p-6 sm:p-8 paper-margin-left relative overflow-hidden">
        
        {/* Upload Zone */}
        <form 
          onDragEnter={handleDrag} 
          onDragLeave={handleDrag} 
          onDragOver={handleDrag} 
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center transition-all ${
            dragActive 
              ? 'border-ink bg-highlighter-soft/40 scale-[1.01]' 
              : uploadedDoc 
              ? 'border-sage-dark bg-sage/20' 
              : 'border-ink-pencil/40 bg-paper-low hover:border-ink hover:bg-paper-container'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.docx"
            onChange={handleFileChange}
            className="hidden"
          />

          {!isUploading && !uploadedDoc && (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-highlighter text-ink rounded-full flex items-center justify-center mx-auto border border-ink shadow-paper-sm">
                <UploadCloud className="w-8 h-8 text-ink" />
              </div>
              <div>
                <p className="font-serif font-semibold text-lg text-ink">
                  Drag and drop your syllabus file here
                </p>
                <p className="text-sm font-sans text-ink-pencil mt-1">
                  Supports PDF, TXT, DOCX (up to 25MB)
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-2.5 bg-ink text-paper rounded-lg font-medium text-sm hover:bg-ink-light transition shadow-paper-sm flex items-center space-x-2"
                >
                  <FileText className="w-4 h-4 text-highlighter" />
                  <span>Browse File</span>
                </button>
              </div>
            </div>
          )}

          {/* Progress Animation State (75% specification progress bar) */}
          {isUploading && (
            <div className="space-y-5 max-w-md mx-auto py-4">
              <div className="w-14 h-14 bg-highlighter text-ink rounded-full flex items-center justify-center mx-auto border border-ink animate-bounce">
                <RefreshCw className="w-7 h-7 animate-spin" />
              </div>
              <div>
                <h3 className="font-serif font-semibold text-lg text-ink">
                  Analyzing Syllabus Structure...
                </h3>
                <p className="text-xs font-mono text-ink-pencil mt-1">
                  Parsing topics & building vector embeddings ({progress}%)
                </p>
              </div>

              {/* Progress Bar Container */}
              <div className="w-full bg-paper-container rounded-full h-4 border border-ink/30 overflow-hidden p-0.5">
                <div 
                  className="bg-highlighter h-full rounded-full transition-all duration-300 relative"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
              </div>
            </div>
          )}

          {/* Upload Complete State */}
          {uploadedDoc && !isUploading && (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-sage text-sage-dark rounded-full flex items-center justify-center mx-auto border border-sage-dark shadow-paper-sm">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div>
                <span className="text-xs font-mono bg-sage text-sage-deep px-2.5 py-1 rounded font-bold uppercase tracking-wider border border-sage-dark/20">
                  Document Verified
                </span>
                <h3 className="font-serif font-bold text-xl text-ink mt-2">
                  {uploadedDoc.filename}
                </h3>
                <p className="text-xs font-mono text-ink-muted mt-1">
                  {uploadedDoc.word_count.toLocaleString()} words • {uploadedDoc.topics_detected.length} Modules Detected
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                    fileInputRef.current?.click();
                  }}
                  className="text-xs font-mono text-ink-pencil underline hover:text-ink"
                >
                  Replace with another file
                </button>
              </div>
            </div>
          )}

        </form>

        {/* Extracted Topics & Sticky Note Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          
          {/* Detected Topics List */}
          <div className="md:col-span-2 bg-paper-low p-5 rounded-xl border border-ink/15 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-serif font-semibold text-sm text-ink flex items-center space-x-2">
                <FileCode className="w-4 h-4 text-ink-muted" />
                <span>Detected Syllabus Topics</span>
              </h4>
              <span className="text-xs font-mono text-ink-pencil">RAG Indexing</span>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {(uploadedDoc?.topics_detected || []).map((topic, i) => (
                <span
                  key={i}
                  className="bg-paper-surface text-ink px-3 py-1.5 rounded-lg text-xs font-mono border border-ink/20 shadow-paper-sm flex items-center space-x-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-highlighter-hover" />
                  <span>{topic}</span>
                </span>
              ))}
              {(!uploadedDoc || uploadedDoc.topics_detected.length === 0) && (
                <p className="text-xs font-mono text-ink-pencil italic">Upload a syllabus to detect topics.</p>
              )}
            </div>
          </div>

          {/* Sticky Note Card (Design token specification) */}
          <div className="sticky-note p-5 rounded-xl relative">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="w-4 h-4 text-ink font-bold" />
              <span className="font-serif font-bold text-xs uppercase text-ink tracking-wider">
                Study Guide Tip
              </span>
            </div>
            <p className="text-xs font-sans text-ink leading-relaxed">
              Pariksha AI maps questions directly to course learning outcomes. Click <strong>"Generate Quiz"</strong> below to create your 5-question test.
            </p>
          </div>

        </div>

        {/* Action Bar */}
        <div className="mt-8 pt-6 border-t border-ink/15 flex items-center justify-between flex-wrap gap-4">
          <div className="text-xs font-mono text-ink-pencil">
            {uploadedDoc ? 'Ready to generate quiz' : 'Upload document to proceed'}
          </div>

          <button
            onClick={onGenerateQuiz}
            disabled={!uploadedDoc || isGenerating}
            className={`px-8 py-3.5 rounded-xl font-medium text-base transition-all flex items-center space-x-3 shadow-paper-md ${
              uploadedDoc && !isGenerating
                ? 'bg-highlighter hover:bg-highlighter-hover text-ink font-bold border-2 border-ink hover:scale-[1.02]'
                : 'bg-paper-container text-ink-pencil/50 border border-ink/20 cursor-not-allowed'
            }`}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin text-ink" />
                <span>Generating RAG Quiz...</span>
              </>
            ) : (
              <>
                <span>Generate Quiz</span>
                <ArrowRight className="w-5 h-5 text-ink" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
