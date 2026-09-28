/**
 * The two linked rings with the diamond, drawn to the logo's geometry: the
 * colour flows as one sweep from deep gold (left ring, bottom-left) through
 * gold to pale sunshine yellow (right ring, bottom-right). The left ring passes
 * over at the top crossing and under at the bottom, each tuck shaded, and the
 * diamond's point sits in a notch cut into the top of the right ring.
 */
export function BrandRings({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 125" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="ydid-grad-a" gradientUnits="userSpaceOnUse" x1="92" y1="30" x2="12" y2="120">
          <stop offset="0" stopColor="#efb000" />
          <stop offset="0.55" stopColor="#c98a00" />
          <stop offset="1" stopColor="#8f5d00" />
        </linearGradient>
        <linearGradient id="ydid-grad-b" gradientUnits="userSpaceOnUse" x1="72" y1="32" x2="150" y2="120">
          <stop offset="0" stopColor="#efb000" />
          <stop offset="0.5" stopColor="#ffcc2e" />
          <stop offset="1" stopColor="#ffe278" />
        </linearGradient>
        <linearGradient id="ydid-grad-d" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffc21a" />
          <stop offset="1" stopColor="#eba600" />
        </linearGradient>
        <filter id="ydid-blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
        <clipPath id="ydid-top">
          <rect x="60" y="20" width="40" height="45" />
        </clipPath>
        <clipPath id="ydid-bottom">
          <rect x="60" y="88" width="40" height="37" />
        </clipPath>
        {/* Left ring: hidden where the right ring crosses, except at the top where it passes over. */}
        <mask id="ydid-a" maskUnits="userSpaceOnUse" x="0" y="0" width="160" height="125">
          <rect width="160" height="125" fill="white" />
          <circle cx="111.5" cy="76.5" r="41" fill="none" stroke="black" strokeWidth="13.5" />
          <rect x="60" y="20" width="40" height="45" fill="white" />
        </mask>
        {/* Right ring: hidden under the left ring at the top, and notched for the diamond. */}
        <mask id="ydid-b" maskUnits="userSpaceOnUse" x="0" y="0" width="160" height="125">
          <rect width="160" height="125" fill="white" />
          <circle cx="48.5" cy="76.5" r="41" fill="none" stroke="black" strokeWidth="13.5" clipPath="url(#ydid-top)" />
          <path d="M103.5 23 L119.5 23 L111.5 37.5Z" fill="black" />
        </mask>
        {/* Where each tuck shadow may fall: on the under ring's stroke, clear of the over ring. */}
        <mask id="ydid-sa" maskUnits="userSpaceOnUse" x="0" y="0" width="160" height="125">
          <circle cx="48.5" cy="76.5" r="41" fill="none" stroke="white" strokeWidth="12" />
          <circle cx="111.5" cy="76.5" r="41" fill="none" stroke="black" strokeWidth="13.5" />
        </mask>
        <mask id="ydid-sb" maskUnits="userSpaceOnUse" x="0" y="0" width="160" height="125">
          <circle cx="111.5" cy="76.5" r="41" fill="none" stroke="white" strokeWidth="12" />
          <circle cx="48.5" cy="76.5" r="41" fill="none" stroke="black" strokeWidth="13.5" />
        </mask>
      </defs>
      <circle cx="48.5" cy="76.5" r="41" fill="none" strokeWidth="12" stroke="url(#ydid-grad-a)" mask="url(#ydid-a)" />
      <circle cx="111.5" cy="76.5" r="41" fill="none" strokeWidth="12" stroke="url(#ydid-grad-b)" mask="url(#ydid-b)" />
      {/* Tuck shadows: the over ring darkens the under ring where it disappears beneath. */}
      <g mask="url(#ydid-sb)" opacity="0.4">
        <circle cx="48.5" cy="76.5" r="41" fill="none" strokeWidth="14" stroke="#6b4300" filter="url(#ydid-blur)" clipPath="url(#ydid-top)" />
      </g>
      <g mask="url(#ydid-sa)" opacity="0.4">
        <circle cx="111.5" cy="76.5" r="41" fill="none" strokeWidth="14" stroke="#6b4300" filter="url(#ydid-blur)" clipPath="url(#ydid-bottom)" />
      </g>
      <path d="M111.5 1 Q114 12 122 17 Q114 22 111.5 32 Q109 22 101 17 Q109 12 111.5 1Z" fill="url(#ydid-grad-d)" />
    </svg>
  );
}
