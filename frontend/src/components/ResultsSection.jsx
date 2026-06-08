import AtsScoreCard from "./AtsScoreCard";
import ScoreBreakdown from "./ScoreBreakdown";
import SectionFeedback from "./SectionFeedback";
import QuickWinsCard from "./QuickWinsCard";
import {
  RoastCard,
  StrengthCard,
  WeaknessCard,
  KeywordsCard,
  ImprovedBulletsCard,
  VerdictCard,
} from "./ResultCard";

const ResultsSection = ({ data, onReset }) => {
  if (!data) return null;

  // backend sends missing_keywords as an object, but the card needs a flat array
  const keywordList = data.missing_keywords
    ? typeof data.missing_keywords === "object" && !Array.isArray(data.missing_keywords)
      ? [
          ...(data.missing_keywords.technical || []),
          ...(data.missing_keywords.soft_skills || []),
          ...(data.missing_keywords.domain_specific || []),
        ]
      : data.missing_keywords
    : [];

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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <AtsScoreCard score={data.ats_score} />
            </div>
            <div className="lg:col-span-2">
              <RoastCard openingRoast={data.opening_roast} />
            </div>
          </div>

          <ScoreBreakdown breakdown={data.score_breakdown} />

          {data.summary && (
            <div className="glass-card rounded-2xl p-6 sm:p-8">
              <h3 className="text-sm font-semibold text-text-tertiary uppercase tracking-wider mb-3">
                Summary
              </h3>
              <p className="text-text-secondary leading-relaxed">{data.summary}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StrengthCard strengths={data.strengths} />
            <WeaknessCard weaknesses={data.weaknesses} />
          </div>

          <SectionFeedback sectionFeedback={data.section_feedback} />

          <KeywordsCard keywords={keywordList} />

          <ImprovedBulletsCard bullets={data.improved_bullets} />

          <QuickWinsCard quickWins={data.quick_wins} />

          <VerdictCard verdict={data.final_verdict} roastLevel={data.roast_level} />

          <div className="text-center pt-4">
            <button
              onClick={onReset}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-accent-purple bg-accent-purple/10 border border-accent-purple/20 rounded-xl hover:bg-accent-purple/20 hover:border-accent-purple/30 transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
              </svg>
              Analyze Another Resume
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResultsSection;
