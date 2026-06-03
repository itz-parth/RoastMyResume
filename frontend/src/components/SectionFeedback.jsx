const SectionFeedback = ({ sectionFeedback }) => {
  if (!sectionFeedback || sectionFeedback.length === 0) return null;

  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8">
      <h3 className="text-sm font-semibold text-text-tertiary uppercase tracking-wider mb-4">
        Section-by-Section Feedback
      </h3>
      <div className="space-y-4">
        {sectionFeedback.map((sf, i) => (
          <div key={i} className="p-4 rounded-xl bg-surface-elevated border border-border-subtle">
            <p className="text-sm font-semibold text-text-primary mb-1">{sf.role}</p>
            <p className="text-sm text-text-secondary">{sf.feedback}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SectionFeedback;
