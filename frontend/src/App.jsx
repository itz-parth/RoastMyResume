import { useState, useRef } from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import UploadSection from "./components/UploadSection";
import ResultsSection from "./components/ResultsSection";

const App = () => {
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const uploadRef = useRef(null);

  const scrollToUpload = () => {
    uploadRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleFileAnalyzed = (data) => {
    setResponse(data);
    setError(null);
    setTimeout(() => {
      document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-surface-base text-text-primary antialiased">
      <Navbar />
      <HeroSection onCtaClick={scrollToUpload} />

      <div ref={uploadRef}>
        <UploadSection onFileAnalyzed={handleFileAnalyzed} setError={setError} />
      </div>

      {error && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-8">
          <div className="glass-card rounded-2xl p-6 border-accent-red/20">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-accent-red/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-accent-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-accent-red mb-1">Analysis Failed</h4>
                <p className="text-sm text-text-secondary">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-text-muted hover:text-text-primary transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {response && <ResultsSection data={response} />}

      <footer className="relative border-t border-border-subtle py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md glow-gradient flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
              </svg>
            </div>
            <span className="text-sm font-medium text-text-muted">RoastMyResume</span>
          </div>
          <p className="text-xs text-text-muted">
            Built with AI. Powered by Groq. Not affiliated with any actual recruiters. Probably.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
