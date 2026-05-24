const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="absolute inset-0 bg-surface-base/80 backdrop-blur-xl border-b border-border-subtle" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg glow-gradient flex items-center justify-center shadow-glow-sm">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
            </svg>
          </div>
          <span className="font-semibold text-lg tracking-tight text-text-primary">
            RoastMyResume
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-text-secondary bg-surface-elevated rounded-full border border-border-subtle">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-glow-pulse" />
            AI Powered
          </span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
