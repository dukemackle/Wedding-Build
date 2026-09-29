/**
 * The two linked rings with the diamond, drawn to the logo's geometry: the
 * colour flows as one sweep from deep gold (left ring, bottom-left) through
 * gold to pale sunshine yellow (right ring, bottom-right). The left ring passes
 * over at the top crossing and under at the bottom, each tuck shaded, and the
 * diamond's point sits in a notch cut into the top of the right ring. The
 * diamond is in the Wren bird's blues. Both palettes flow slowly through their
 * shades (`ydid-flow-*` in globals.css); the stop colours here are the still
 * frame shown when motion is reduced.
 *
 * Every 6.5s the diamond turns into the Wren bird and back, like a genie from
 * a lamp. `genie="loop"` keeps doing it (the landing hero); the default
 * "once" plays it a single time after load, so the nav logo on every page
 * doesn't keep pulling the eye while couples work.
 */
export function BrandRings({ className, genie = "once" }: { className?: string; genie?: "loop" | "once" }) {
  return (
    <svg
      viewBox="0 0 160 125"
      overflow="visible"
      className={`${genie === "once" ? "ydid-once " : ""}${className ?? ""}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="ydid-grad-a" gradientUnits="userSpaceOnUse" x1="92" y1="30" x2="12" y2="120">
          <stop offset="0" stopColor="#efb000" className="ydid-flow-gold" style={{ animationDelay: "-4s" }} />
          <stop offset="0.55" stopColor="#c98a00" className="ydid-flow-gold" style={{ animationDelay: "-6s" }} />
          <stop offset="1" stopColor="#8f5d00" className="ydid-flow-gold" style={{ animationDelay: "-8s" }} />
        </linearGradient>
        <linearGradient id="ydid-grad-b" gradientUnits="userSpaceOnUse" x1="72" y1="32" x2="150" y2="120">
          <stop offset="0" stopColor="#efb000" className="ydid-flow-gold" style={{ animationDelay: "-4s" }} />
          <stop offset="0.5" stopColor="#ffcc2e" className="ydid-flow-gold" style={{ animationDelay: "-2s" }} />
          <stop offset="1" stopColor="#ffe278" className="ydid-flow-gold" style={{ animationDelay: "0s" }} />
        </linearGradient>
        <linearGradient id="ydid-grad-d" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8fd0f5" className="ydid-flow-blue" style={{ animationDelay: "-3s" }} />
          <stop offset="0.5" stopColor="#3b88c3" className="ydid-flow-blue" style={{ animationDelay: "-1.5s" }} />
          <stop offset="1" stopColor="#2f78ad" className="ydid-flow-blue" style={{ animationDelay: "0s" }} />
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
      {/* Genie: the diamond twists into a wisp, the Wren bird pops out, perches in
          the notch and flaps, then is drawn back in (`ydid-*` keyframes in globals.css). */}
      <g className="ydid-gem"><path d="M111.5 1 Q114 12 122 17 Q114 22 111.5 32 Q109 22 101 17 Q109 12 111.5 1Z" fill="url(#ydid-grad-d)" /></g>
      <path className="ydid-wisp" d="M111.5 31 C103 27 120 22 111 16 C104 11 117 7 110 2" fill="none" stroke="#8fd0f5" strokeWidth="2.2" strokeLinecap="round" pathLength="1" />
      <g className="ydid-spark"><circle cx="100" cy="10" r="1.6" fill="#5ae4ff"/><circle cx="124" cy="8" r="1.3" fill="#8fd0f5"/><circle cx="121" cy="25" r="1.1" fill="#5ae4ff"/><circle cx="102" cy="24" r="1.2" fill="#8fd0f5"/></g>
      <g className="ydid-bird" transform="translate(95.9 1.4) scale(1.3)"><g className="ydid-bird-in">
      <g className="ydid-tail"><path d="M7.6 11.8 4.4 3.5q.8-1.1 1.9-.4l4.1 7.9z" fill="#3b88c3" /><path d="M6.7 12.9 1.7 5.9q.3-1.2 1.4-.8l5.8 6.1z" fill="#2f78ad" /></g>
      <ellipse cx="11" cy="14.5" rx="7" ry="5.3" fill="#55acee" />
      <circle cx="16.6" cy="9.8" r="3.6" fill="#55acee" />
      <path d="M19.9 9.1 23 10l-3.1.9z" fill="#f4900c" />
      <circle cx="17.5" cy="9.1" r=".75" fill="#1b1f1c" /><circle cx="17.75" cy="8.85" r=".25" fill="#fff" />
      <path d="M9 18.6q5 1.2 8.3-2.4 1.2-1.6 1-3.6-3 4-9.3 6z" fill="#dff1fc" />
      <g className="ydid-wing-fold"><path d="M15 11.2C12 10.2 7.5 11 4.2 13.6 7 15.8 11.5 16.6 15.2 14.6Q16.4 12.8 15 11.2Z" fill="#3b88c3"/><path d="M15 12.2q-.5.9-1.1 0-.5.9-1.1 0-.5.9-1.1 0-.5.9-1.1 0M14.4 13.6q-.5.9-1.1 0-.5.9-1.1 0-.5.9-1.1 0-.5.9-1.1 0-.5.9-1.1 0" stroke="#8fd0f5" strokeWidth=".4" fill="none" strokeLinecap="round"/><path d="M4.4 13.6q3.6 1 7.6.6M5.2 14.5q3.6 1 7.8.5" stroke="#2f78ad" strokeWidth=".4" fill="none"/></g>
      <g className="ydid-wing-open"><ellipse cx="12.83" cy="5.14" rx="6.60" ry="1.6" transform="rotate(-102 12.83 5.14)" fill="#2f78ad" stroke="#8fd0f5" strokeWidth=".3"/><ellipse cx="11.50" cy="5.80" rx="6.40" ry="1.6" transform="rotate(-115 11.50 5.80)" fill="#3b88c3" stroke="#8fd0f5" strokeWidth=".3"/><ellipse cx="10.63" cy="7.03" rx="5.80" ry="1.6" transform="rotate(-128 10.63 7.03)" fill="#2f78ad" stroke="#8fd0f5" strokeWidth=".3"/><ellipse cx="10.34" cy="8.58" rx="4.90" ry="1.6" transform="rotate(-142 10.34 8.58)" fill="#3b88c3" stroke="#8fd0f5" strokeWidth=".3"/><ellipse cx="10.73" cy="10.05" rx="3.80" ry="1.6" transform="rotate(-156 10.73 10.05)" fill="#2f78ad" stroke="#8fd0f5" strokeWidth=".3"/><path d="M15 12.4C15.2 8 12.4 5.2 9 5.6 9.2 9 11.2 11.8 15 12.4Z" fill="#55acee"/><path d="M14.4 9.4q-.4.8-1 .1-.4.8-1 .1-.4.8-1 .1M14.6 11q-.4.8-1 .1-.4.8-1 .1-.4.8-1 .1" stroke="#dff1fc" strokeWidth=".4" fill="none" strokeLinecap="round"/></g>
      <path d="M10.5 19.5 9.6 22M13.8 19.4l.8 2.6" stroke="#f4900c" strokeWidth="1.1" strokeLinecap="round" />
      </g></g>
    </svg>
  );
}
