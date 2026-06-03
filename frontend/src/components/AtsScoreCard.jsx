const getScoreColor = (score) => {
  if (score >= 90) return "text-accent-green";
  if (score >= 75) return "text-accent-blue";
  if (score >= 60) return "text-accent-amber";
  return "text-accent-red";
};

const getScoreRingColor = (score) => {
  if (score >= 90) return "#22c55e";
  if (score >= 75) return "#3b82f6";
  if (score >= 60) return "#f59e0b";
  return "#ef4444";
};

const getScoreLabel = (score) => {
  if (score >= 90) return "Exceptional";
  if (score >= 75) return "Strong";
  if (score >= 60) return "Average";
  return "Needs Work";
};

const AtsScoreCard = ({ score }) => {
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = getScoreRingColor(score);

  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold text-text-tertiary uppercase tracking-wider">
          ATS Score
        </h3>
        <span className="text-xs font-medium text-text-muted bg-surface-elevated px-2.5 py-1 rounded-full border border-border-subtle">
          ATS Compatibility
        </span>
      </div>

      <div className="flex flex-col items-center">
        <div className="relative w-36 h-36 sm:w-40 sm:h-40 mb-4">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 128 128">
            <circle
              cx="64"
              cy="64"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-border-subtle"
            />
            <circle
              cx="64"
              cy="64"
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="ats-ring-fill"
              style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-4xl sm:text-5xl font-bold font-mono ${getScoreColor(score)}`}>
              {score}
            </span>
            <span className="text-xs text-text-muted mt-0.5">/ 100</span>
          </div>
        </div>

        <span className={`text-sm font-semibold ${getScoreColor(score)}`}>
          {getScoreLabel(score)}
        </span>

        <div className="w-full mt-6 grid grid-cols-4 gap-1">
          {[
            { range: "0-59", label: "Poor", color: "bg-accent-red" },
            { range: "60-74", label: "Avg", color: "bg-accent-amber" },
            { range: "75-89", label: "Strong", color: "bg-accent-blue" },
            { range: "90-100", label: "Excel", color: "bg-accent-green" },
          ].map((segment) => (
            <div key={segment.label} className="text-center">
              <div
                className={`h-1 rounded-full mb-1 transition-opacity duration-500 ${
                  segment.color
                } ${score >= parseInt(segment.range.split("-")[0]) ? "opacity-100" : "opacity-20"}`}
              />
              <span className="text-[10px] text-text-muted">{segment.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AtsScoreCard;
