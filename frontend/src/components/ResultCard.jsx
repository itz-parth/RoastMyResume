const ResultCard = ({ title, icon, children, variant = "default" }) => {
  const variantStyles = {
    default: "glass-card",
    roast: "glass-card border-accent-purple/20",
    verdict: "glass-card border-accent-cyan/20",
  };

  return (
    <div className={`rounded-2xl p-6 sm:p-8 ${variantStyles[variant]} stagger-fade-in`}>
      <div className="flex items-center gap-2.5 mb-4">
        {icon && (
          <span className="text-accent-purple">{icon}</span>
        )}
        <h3 className="text-sm font-semibold text-text-tertiary uppercase tracking-wider">
          {title}
        </h3>
      </div>
      <div className="text-text-primary leading-relaxed">
        {children}
      </div>
    </div>
  );
};

export const StrengthCard = ({ strengths }) => (
  <ResultCard
    title="Strengths"
    icon={
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    }
  >
    <ul className="space-y-3">
      {strengths.map((s, i) => (
        <li key={i} className="flex items-start gap-3">
          <span className="mt-1 w-5 h-5 rounded-full bg-accent-green/10 flex items-center justify-center flex-shrink-0">
            <svg className="w-3 h-3 text-accent-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </span>
          <span className="text-text-secondary">{s}</span>
        </li>
      ))}
    </ul>
  </ResultCard>
);

export const WeaknessCard = ({ weaknesses }) => (
  <ResultCard
    title="Weaknesses"
    icon={
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
    }
  >
    <ul className="space-y-3">
      {weaknesses.map((w, i) => (
        <li key={i} className="flex items-start gap-3">
          <span className="mt-1 w-5 h-5 rounded-full bg-accent-rose/10 flex items-center justify-center flex-shrink-0">
            <svg className="w-3 h-3 text-accent-rose" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </span>
          <span className="text-text-secondary">{w}</span>
        </li>
      ))}
    </ul>
  </ResultCard>
);

export const KeywordsCard = ({ keywords }) => (
  <ResultCard
    title="Missing Keywords"
    icon={
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    }
  >
    {keywords.length > 0 ? (
      <div className="flex flex-wrap gap-2">
        {keywords.map((k, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-accent-purple bg-accent-purple/10 rounded-full border border-accent-purple/10"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
            </svg>
            {k}
          </span>
        ))}
      </div>
    ) : (
      <p className="text-text-secondary">No missing keywords found. Great job!</p>
    )}
  </ResultCard>
);

export const ImprovedBulletsCard = ({ bullets }) => (
  <ResultCard
    title="Improved Bullets"
    icon={
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
      </svg>
    }
  >
    {bullets.length > 0 ? (
      <ul className="space-y-4">
        {bullets.map((b, i) => (
          <li key={i} className="space-y-2">
            <div className="p-3 rounded-xl bg-accent-rose/5 border border-accent-rose/10">
              <span className="text-xs font-medium text-accent-rose/70 uppercase tracking-wider mb-1 block">Before</span>
              <p className="text-sm text-text-secondary line-through opacity-70">{b.original}</p>
            </div>
            <div className="p-3 rounded-xl bg-accent-green/5 border border-accent-green/10">
              <span className="text-xs font-medium text-accent-green/70 uppercase tracking-wider mb-1 block">After</span>
              <p className="text-sm text-text-primary font-medium">{b.improved}</p>
            </div>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-text-secondary">No improvements suggested.</p>
    )}
  </ResultCard>
);

export const RoastCard = ({ openingRoast }) => (
  <ResultCard
    title="Opening Roast"
    variant="roast"
    icon={
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.55.335-3.54.873.146.792.572 1.485 1.147 2.002M12 8.25c1.355 0 2.55.335 3.54.873-.146.792-.572 1.485-1.147 2.002M12 14.25v1.5m0 0c-1.355 0-2.55-.335-3.54-.873a3.737 3.737 0 001.147-2.002M12 14.25c1.355 0 2.55.335 3.54.873a3.737 3.737 0 01-1.147 2.002M12 20.25v-1.5m0 1.5c-1.355 0-2.55-.335-3.54-.873M12 20.25c1.355 0 2.55.335 3.54.873" />
      </svg>
    }
  >
    <p className="text-lg italic text-text-primary/90 leading-relaxed font-medium">
      "{openingRoast}"
    </p>
  </ResultCard>
);

export const VerdictCard = ({ verdict, roastLevel }) => (
  <ResultCard
    title="Final Verdict"
    variant="verdict"
    icon={
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    }
  >
    <p className="text-lg font-medium text-text-primary leading-relaxed mb-3">
      {verdict}
    </p>
    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-accent-purple bg-accent-purple/10 rounded-full">
      Roast level: {roastLevel}
    </span>
  </ResultCard>
);

export default ResultCard;
