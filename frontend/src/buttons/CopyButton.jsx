import { useState } from "react";
import { FaCopy, FaCheck } from "react-icons/fa";

export default function CopyButton({ text }) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border transition-all duration-200 ${
        isCopied
          ? "bg-accent-green/10 text-accent-green border-accent-green/20"
          : "bg-surface-elevated text-text-tertiary border-border-subtle hover:bg-surface-hover hover:text-text-secondary hover:border-border-strong"
      }`}
    >
      {isCopied ? (
        <>
          <FaCheck className="w-3 h-3" />
          Copied
        </>
      ) : (
        <>
          <FaCopy className="w-3 h-3" />
          Copy
        </>
      )}
    </button>
  );
}