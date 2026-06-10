export function MagnoliaLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
      <defs>
        <linearGradient id="mgl" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="oklch(0.78 0.18 28)" />
          <stop offset="1" stopColor="oklch(0.55 0.15 25)" />
        </linearGradient>
      </defs>
      <path
        d="M16 3c2.6 3.1 4 6.2 4 9.3 0 .9-.1 1.7-.3 2.5 1.5-1 3.1-1.5 4.7-1.5 2.4 0 4.6 1.2 5.6 3-3 .9-5.1 2.7-6.2 5.3-.6 1.4-.9 2.9-.9 4.4-1.7-1.4-3.7-2.1-5.9-2.1-2.2 0-4.2.7-5.9 2.1 0-1.5-.3-3-.9-4.4C9.1 18.7 7 16.9 4 16c1-1.8 3.2-3 5.6-3 1.6 0 3.2.5 4.7 1.5-.2-.8-.3-1.6-.3-2.5 0-3.1 1.4-6.2 4-9.3z"
        fill="url(#mgl)"
      />
    </svg>
  );
}
