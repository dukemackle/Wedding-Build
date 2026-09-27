/** The two linked rings with the diamond, each ring fading through the logo golds. */
export function BrandRings({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 124" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="ydid-grad-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#c98a00" />
          <stop offset="1" stopColor="#f2b400" />
        </linearGradient>
        <linearGradient id="ydid-grad-b" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffc629" />
          <stop offset="1" stopColor="#ffe45c" />
        </linearGradient>
        <clipPath id="ydid-top">
          <rect x="60" y="28" width="40" height="36" />
        </clipPath>
        <mask id="ydid-a" maskUnits="userSpaceOnUse" x="0" y="0" width="160" height="124">
          <rect width="160" height="124" fill="white" />
          <circle cx="102" cy="80" r="38" fill="none" stroke="black" strokeWidth="17" />
          <rect x="60" y="28" width="40" height="36" fill="white" />
        </mask>
        <mask id="ydid-b" maskUnits="userSpaceOnUse" x="0" y="0" width="160" height="124">
          <rect width="160" height="124" fill="white" />
          <circle cx="58" cy="80" r="38" fill="none" stroke="black" strokeWidth="17" clipPath="url(#ydid-top)" />
        </mask>
      </defs>
      <circle cx="58" cy="80" r="38" fill="none" strokeWidth="11" stroke="url(#ydid-grad-a)" mask="url(#ydid-a)" />
      <circle cx="102" cy="80" r="38" fill="none" strokeWidth="11" stroke="url(#ydid-grad-b)" mask="url(#ydid-b)" />
      <path d="M102 3 Q105 13 114 17 Q105 21 102 31 Q99 21 90 17 Q99 13 102 3Z" fill="#f2a900" />
    </svg>
  );
}
