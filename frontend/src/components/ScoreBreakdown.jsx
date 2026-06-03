const CATEGORIES = [
  { key: "content_and_metrics", label: "Content & Metrics", max: 30, color: "bg-accent-purple" },
  { key: "keyword_optimization", label: "Keyword Optimization", max: 25, color: "bg-accent-blue" },
  { key: "formatting_and_structure", label: "Formatting & Structure", max: 15, color: "bg-accent-cyan" },
  { key: "experience_quality", label: "Experience Quality", max: 20, color: "bg-accent-amber" },
  { key: "education_and_skills", label: "Education & Skills", max: 10, color: "bg-accent-green" },
];

const ScoreBreakdown = ({ breakdown }) => {
  if (!breakdown) return null;

  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8">
      <h3 className="text-sm font-semibold text-text-tertiary uppercase tracking-wider mb-4">
        Score Breakdown
      </h3>
      <div className="space-y-3">
        {CATEGORIES.map((cat) => {
          const score = breakdown[cat.key] ?? 0;
          const percentage = (score / cat.max) * 100;
          return (
            <div key={cat.key}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-text-secondary">{cat.label}</span>
                <span className="text-text-primary font-mono font-medium">
                  {score}/{cat.max}
                </span>
              </div>
              <div className="h-2 bg-surface-elevated rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${cat.color}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScoreBreakdown;
