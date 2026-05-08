import { useId } from 'react';
import { cn } from '@/lib/utils';

export function CryptoLogo({ className }: { className?: string }) {
  const gradientId = `${useId().replace(/:/g, '')}-ct-logo-fill`;

  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={cn('h-8 w-8 shrink-0', className)}
    >
      <defs>
        <linearGradient id={gradientId} x1="6" x2="26" y1="5" y2="27" gradientUnits="userSpaceOnUse">
          <stop stopColor="#22d3ee" />
          <stop offset="0.48" stopColor="#8b5cf6" />
          <stop offset="1" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill={`url(#${gradientId})`} />
      <rect x="3.5" y="3.5" width="25" height="25" rx="7" fill="hsl(var(--background))" fillOpacity="0.88" />
      <path
        d="M8.5 19.5c2.2-7.2 5.1-10.8 8.6-10.8 2.1 0 3.8 1.2 5.1 3.6"
        fill="none"
        stroke="#22d3ee"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <path
        d="M9.8 21.7h12.4"
        stroke="#f59e0b"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <circle cx="9.4" cy="20" r="2" fill="#f59e0b" />
      <circle cx="16.9" cy="8.8" r="2" fill="#22d3ee" />
      <circle cx="22.4" cy="13.1" r="2" fill="#8b5cf6" />
      <path
        d="M12 17.5h8"
        stroke="#c4b5fd"
        strokeDasharray="1.5 2.5"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}
