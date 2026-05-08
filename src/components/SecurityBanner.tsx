import { useState, useEffect } from 'react';
import { CircleAlert, TriangleAlert, X } from 'lucide-react';

const STORAGE_KEY = 'crypto-toolkit-banner-dismissed';

export function SecurityBanner() {
  const [dismissed, setDismissed] = useState(() => {
    try { return sessionStorage.getItem(STORAGE_KEY) === 'true'; }
    catch { return false; }
  });
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    // Only persist on actual dismissal — skip the initial false → false no-op.
    if (dismissed) {
      try { sessionStorage.setItem(STORAGE_KEY, 'true'); }
      catch { /* ignore quota errors in private mode */ }
    }
  }, [dismissed]);

  if (dismissed) return null;

  return (
    <div className="bg-amber-500/8 border border-amber-500/20 rounded-lg mb-4 overflow-hidden transition-all">
      <div className="flex items-center gap-2 px-3 py-2">
        <TriangleAlert className="h-[18px] w-[18px] text-amber-500 shrink-0" strokeWidth={2.4} />
        <span className="text-xs font-medium text-amber-600 dark:text-amber-400 flex-1">
          Educational Tool - BigInt arithmetic is not constant-time
        </span>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-[10px] text-amber-500/70 hover:text-amber-400 shrink-0"
        >
          {expanded ? 'Less' : 'More'}
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-500/50 hover:text-amber-400 shrink-0 ml-1"
          aria-label="Dismiss"
        >
          <X className="h-[15px] w-[15px]" strokeWidth={2} />
        </button>
      </div>
      {expanded && (
        <div className="px-3 pb-2.5 text-[11px] text-amber-600/70 dark:text-amber-400/60 leading-relaxed border-t border-amber-500/10 pt-2">
          Operations like <code className="text-[10px] bg-amber-500/10 px-1 rounded">modPow</code>,{' '}
          <code className="text-[10px] bg-amber-500/10 px-1 rounded">modInverse</code>, and EC{' '}
          <code className="text-[10px] bg-amber-500/10 px-1 rounded">scalarMultiply</code> have
          data-dependent branching that leaks key bits via timing side-channels.
          This tool uses <code className="text-[10px] bg-amber-500/10 px-1 rounded">crypto.getRandomValues()</code> (CSPRNG)
          for randomness. Never use this code for production cryptography.
        </div>
      )}
    </div>
  );
}

// Inline warning for specific pages
export function InlineWarning({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2 text-xs text-red-600 dark:text-red-400 flex items-start gap-2">
      <CircleAlert className="h-[15px] w-[15px] shrink-0 mt-0.5" strokeWidth={2.2} />
      <span>{children}</span>
    </div>
  );
}
