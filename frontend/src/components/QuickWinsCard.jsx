const QuickWinsCard = ({ quickWins }) => {
  if (!quickWins || quickWins.length === 0) return null;

  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8 border-accent-green/20">
      <div className="flex items-center gap-2.5 mb-4">
        <svg className="w-4 h-4 text-accent-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-sm font-semibold text-text-tertiary uppercase tracking-wider">Quick Wins</h3>
      </div>
      <ul className="space-y-2">
        {quickWins.map((win, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
            <span className="mt-0.5 w-5 h-5 rounded-full bg-accent-green/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-3 h-3 text-accent-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </span>
            {win}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QuickWinsCard;
