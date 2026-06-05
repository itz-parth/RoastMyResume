const JobDescriptionCard = ({ jobDescription, showJobField, onToggle, onChange }) => (
  <div className="mt-6">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm text-text-secondary bg-surface-card border border-border-subtle rounded-xl hover:bg-surface-elevated hover:text-text-primary transition-all duration-200"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
      </svg>
      {showJobField ? "Hide job description" : "Add a job description (optional)"}
      <svg className={`w-4 h-4 transition-transform duration-200 ${showJobField ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
      </svg>
    </button>

    {showJobField && (
      <div className="mt-3 animate-fade-in">
        <div className="glass-card rounded-2xl p-5">
          <label className="block text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">
            Job Description
          </label>
          <textarea
            value={jobDescription}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Paste the job description here to get a targeted analysis..."
            rows={6}
            className="w-full bg-surface-elevated border border-border-subtle rounded-xl p-4 text-sm text-text-primary placeholder-text-muted resize-y focus:outline-none focus:border-accent-purple/50 focus:ring-1 focus:ring-accent-purple/20 transition-all duration-200"
          />
          <p className="mt-2 text-xs text-text-muted">
            The AI will compare your resume against this job and tailor the feedback.
          </p>
        </div>
      </div>
    )}
  </div>
);

export default JobDescriptionCard;