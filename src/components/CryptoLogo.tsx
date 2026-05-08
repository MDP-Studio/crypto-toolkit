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
        d="M7.8 17.2a8.2 8.2 0 0 1 16.4 0"
        fill="none"
        stroke="var(--primary)"
        strokeLinecap="round"
        strokeWidth="2.1"
      />
      <path
        d="M8.8 21.4a8.2 8.2 0 0 0 14.4 0"
        fill="none"
        stroke="var(--primary)"
        strokeLinecap="round"
        strokeOpacity="0.55"
        strokeWidth="1.8"
      />
      <path
        d="M12.4 14.6v-1.7a3.6 3.6 0 0 1 7.2 0v1.7"
        fill="none"
        stroke="var(--foreground)"
        strokeLinecap="round"
        strokeOpacity="0.9"
        strokeWidth="1.7"
      />
      <rect x="10.5" y="14.2" width="11" height="8.4" rx="2" fill="var(--foreground)" fillOpacity="0.9" />
      <circle cx="16" cy="18.2" r="1.1" fill="var(--card)" />
      <path
        d="M16 19.2v1.5"
        stroke="var(--card)"
        strokeLinecap="round"
        strokeWidth="1.1"
      />
      <path
        d="M6.3 16h3.2m13 0h3.2M16 6.3v3.2M16 22.5v3.2"
        stroke="var(--primary)"
        strokeLinecap="round"
        strokeOpacity="0.8"
        strokeWidth="1.7"
      />
    </svg>
  );
}
