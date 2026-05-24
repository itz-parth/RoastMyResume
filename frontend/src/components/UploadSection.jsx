import { useState, useRef, useCallback } from "react";
import axios from "axios";

const UploadSection = ({ onFileAnalyzed, setError }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const inputRef = useRef(null);

  const simulateProgress = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 300);
    return interval;
  };

  const handleAnalyze = useCallback(async (fileToUpload) => {
    if (!fileToUpload) return;

    const formData = new FormData();
    formData.append("file", fileToUpload);

    try {
      setLoading(true);
      setError(null);
      setUploadProgress(0);

      const progressInterval = simulateProgress();

      const res = await axios.post("http://localhost:8000/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      setTimeout(() => {
        onFileAnalyzed(res.data);
        setLoading(false);
        setUploadProgress(0);
      }, 400);
    } catch (e) {
      setLoading(false);
      setUploadProgress(0);
      const message =
        e.response?.data?.detail ||
        "Failed to analyze resume. Make sure the backend server is running.";
      setError(message);
    }
  }, [onFileAnalyzed, setError]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const droppedFile = e.dataTransfer?.files?.[0];
    if (droppedFile?.type === "application/pdf") {
      setFile(droppedFile);
      handleAnalyze(droppedFile);
    }
  }, [handleAnalyze]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleFileSelect = useCallback((e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      handleAnalyze(selected);
    }
  }, [handleAnalyze]);

  const handleClick = useCallback(() => {
    if (!loading) inputRef.current?.click();
  }, [loading]);

  return (
    <section id="upload" className="relative py-24 sm:py-32">
      <div className="absolute inset-0 animated-gradient-bg opacity-50" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary mb-4">
            Upload Your Resume
          </h2>
          <p className="text-text-secondary text-lg max-w-xl mx-auto">
            Drop your PDF below and let the AI recruiters work their magic.
          </p>
        </div>

        {/* Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
          className={`drop-zone relative cursor-pointer rounded-2xl border-2 border-dashed p-12 sm:p-16 text-center transition-all duration-300 ${
            dragActive
              ? "border-accent-purple bg-accent-purple/5"
              : loading
              ? "border-border-strong bg-surface-card"
              : "border-border-default bg-surface-card hover:border-border-strong hover:bg-surface-elevated"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
          />

          {loading ? (
            <div className="space-y-6">
              <div className="relative w-16 h-16 mx-auto">
                <svg className="w-16 h-16 animate-spin-slow" viewBox="0 0 64 64" fill="none">
                  <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="3" className="text-border-subtle" />
                  <circle cx="32" cy="32" r="28" stroke="url(#gradient)" strokeWidth="3" strokeDasharray="176" strokeDashoffset={176 - (uploadProgress / 100) * 176} className="ats-ring-fill" />
                  <defs>
                    <linearGradient id="gradient" x1="0" y1="0" x2="64" y2="64">
                      <stop stopColor="#8b5cf6" />
                      <stop offset="1" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div>
                <p className="text-text-primary font-medium mb-1">Analyzing your resume...</p>
                <p className="text-text-muted text-sm">AI recruiters are roasting it right now</p>
              </div>
              <div className="max-w-xs mx-auto bg-surface-elevated rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full rounded-full glow-gradient transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="w-16 h-16 mx-auto rounded-2xl glow-gradient/10 bg-surface-elevated border border-border-subtle flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-accent-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              <div>
                <p className="text-text-primary font-medium mb-1">
                  {file ? file.name : "Drop your PDF here or click to browse"}
                </p>
                <p className="text-text-muted text-sm">
                  {file
                    ? `Ready for analysis (${(file.size / 1024).toFixed(0)} KB)`
                    : "Supports PDF files only"}
                </p>
              </div>
              {!file && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-accent-purple bg-accent-purple/10 rounded-full">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75l3 3m0 0l3-3m-3 3v-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  PDF only
                </span>
              )}
            </div>
          )}
        </div>

        {/* Trust indicators */}
        <div className="flex items-center justify-center gap-6 mt-8 text-xs text-text-muted">
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            No data stored
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" />
            </svg>
            AI-powered analysis
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Takes ~10 seconds
          </span>
        </div>
      </div>
    </section>
  );
};

export default UploadSection;
