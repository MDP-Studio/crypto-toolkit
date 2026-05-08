import { cn } from '@/lib/utils';

export function CryptoLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={cn('h-8 w-8 shrink-0', className)}
    >
      <rect width="32" height="32" rx="8" fill="var(--card)" />
      <rect x="1.5" y="1.5" width="29" height="29" rx="7" fill="none" stroke="var(--primary)" strokeOpacity="0.9" strokeWidth="2" />
      <path
        d="M22.2 10.2a7.2 7.2 0 1 0 0 11.6"
        fill="none"
        stroke="var(--primary)"
        strokeLinecap="round"
        strokeWidth="2.4"
      />
      <circle cx="13.2" cy="16" r="2.35" fill="none" stroke="var(--foreground)" strokeOpacity="0.82" strokeWidth="1.8" />
      <path
        d="M15.7 16h6.4m-2.2 0v-2.2m2.2 2.2v2.2"
        stroke="var(--foreground)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity="0.82"
        strokeWidth="1.8"
      />
    </svg>
  );
}
