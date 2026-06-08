import { useRef, useCallback } from "react";

const STAGES = [
  { id: "extract", label: "Parsing resume structure..." },
  { id: "analyze", label: "Analyzing content & scoring..." },
  { id: "roast", label: "Crafting your roast..." },
];

const DropZone = ({ file, loading, dragActive, uploadProgress, fileError, onDrop, onDragOver, onDragLeave, onFileSelect }) => {
  const inputRef = useRef(null);

  const handleClick = useCallback(() => {
    if (!loading) inputRef.current?.click();
  }, [loading]);

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
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
        accept=".pdf, .docx, .txt"
        onChange={onFileSelect}
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

          <div className="max-w-sm mx-auto space-y-3">
            {STAGES.map((stage, i) => {
              const stageProgress = uploadProgress / 100;
              const stageStart = i / STAGES.length;
              const stageEnd = (i + 1) / STAGES.length;
              const isActive = stageProgress >= stageStart && stageProgress < stageEnd;
              const isComplete = stageProgress >= stageEnd;
              return (
                <div key={stage.id} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isComplete
                      ? "bg-accent-green/20 text-accent-green"
                      : isActive
                      ? "bg-accent-purple/20 text-accent-purple"
                      : "bg-surface-elevated text-text-muted"
                  }`}>
                    {isComplete ? (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    ) : (
                      <span className="text-xs font-bold">{i + 1}</span>
                    )}
                  </div>
                  <span className={`text-sm transition-colors duration-300 ${
                    isComplete
                      ? "text-text-primary"
                      : isActive
                      ? "text-text-primary font-medium"
                      : "text-text-muted"
                  }`}>
                    {stage.label}
                  </span>
                </div>
              );
            })}
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
                : "Supports PDF, DOCX, and TXT files"}
            </p>
          </div>
          {!file && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-accent-purple bg-accent-purple/10 rounded-full">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75l3 3m0 0l3-3m-3 3v-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              PDF, DOCX, or TXT only
            </span>
          )}

          {fileError && (
            <p className="mt-3 text-sm text-accent-red flex items-center justify-center gap-1.5">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              {fileError}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default DropZone;