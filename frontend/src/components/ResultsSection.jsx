import AtsScoreCard from "./AtsScoreCard";
import { RoastCard, StrengthCard, WeaknessCard, KeywordsCard, ImprovedBulletsCard, VerdictCard } from "./ResultCard";

const ResultsSection = ({ data }) => {
  if (!data) return null;

  return (
    <section id="results" className="relative py-24 sm:py-32">
      <div className="absolute inset-0 animated-gradient-bg opacity-30" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary mb-3">
            Your Resume Analysis
          </h2>
          <p className="text-text-secondary">
            Here&apos;s what the AI recruiters think — the good, the bad, and the roastable.
          </p>
        </div>

        <div className="space-y-6 stagger-fade-in">
          {/* Top Row: ATS Score + Roast */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <AtsScoreCard score={data.ats_score} />
            </div>
            <div className="lg:col-span-2">
              <RoastCard openingRoast={data.opening_roast} />
            </div>
          </div>

          {/* Summary */}
          {data.summary && (
            <div className="glass-card rounded-2xl p-6 sm:p-8">
              <h3 className="text-sm font-semibold text-text-tertiary uppercase tracking-wider mb-3">
                Summary
              </h3>
              <p className="text-text-secondary leading-relaxed">{data.summary}</p>
            </div>
          )}

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StrengthCard strengths={data.strengths} />
            <WeaknessCard weaknesses={data.weaknesses} />
          </div>

          {/* Missing Keywords */}
          <KeywordsCard keywords={data.missing_keywords} />

          {/* Improved Bullets */}
          <ImprovedBulletsCard bullets={data.improved_bullets} />

          {/* Final Verdict */}
          <VerdictCard verdict={data.final_verdict} roastLevel={data.roast_level} />
        </div>
      </div>
    </section>
  );
};

export default ResultsSection;
