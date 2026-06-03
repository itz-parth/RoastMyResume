const HeroSection = ({ onCtaClick }) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      <div className="absolute inset-0 animated-gradient-bg" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-purple/10 rounded-full blur-3xl animate-glow-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-accent-blue/8 rounded-full blur-3xl animate-float" style={{ animationDelay: '-2s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent-cyan/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '-4s' }} />
      </div>

      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 text-xs font-medium text-text-secondary bg-surface-elevated/80 backdrop-blur-sm rounded-full border border-border-subtle">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-purple animate-glow-pulse" />
          AI-Powered Resume Analysis
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
          <span className="text-text-primary">Your Resume</span>
          <br />
          <span className="glow-gradient-text">Deserves Better.</span>
        </h1>

        <p className="max-w-2xl mx-auto text-lg sm:text-xl text-text-secondary leading-relaxed mb-10">
          Upload your resume and get roasted by AI recruiters in seconds.
          ATS analysis, actionable feedback, and bullet rewrites — all in one place.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onCtaClick}
            className="btn-glow relative inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-white rounded-xl glow-gradient shadow-glow-md hover:shadow-glow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
            </svg>
            Roast My Resume
          </button>
          <button className="inline-flex items-center gap-2 px-8 py-4 text-base font-medium text-text-secondary bg-surface-elevated/80 backdrop-blur-sm border border-border-subtle rounded-xl hover:bg-surface-hover hover:text-text-primary transition-all duration-300">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Learn More
          </button>
        </div>

        <div className="mt-16 max-w-lg mx-auto animate-fade-in">
          <div className="glass-card rounded-2xl p-5 text-left">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent-green" />
                <span className="text-xs font-medium text-text-tertiary uppercase tracking-wider">Live Demo Analysis</span>
              </div>
              <span className="text-xs font-mono font-bold text-accent-purple">ATS 78</span>
            </div>
            <p className="text-sm text-text-secondary italic leading-relaxed mb-3">
              "This resume is like a plain bagel — gets the job done, but nobody's excited about it. Let's add some everything seasoning."
            </p>
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <span className="px-2 py-0.5 rounded-md bg-surface-elevated border border-border-subtle">3 strengths</span>
              <span className="px-2 py-0.5 rounded-md bg-surface-elevated border border-border-subtle">4 weaknesses</span>
              <span className="px-2 py-0.5 rounded-md bg-surface-elevated border border-border-subtle">5 keywords</span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
        <svg className="w-5 h-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
