/**
 * "Weddings aRe Easy Now" -- the backronym behind Wren's name. The four
 * letters that spell WREN are picked out in Royal blue so the name reads out
 * of the phrase.
 */
function Letter({ children }: { children: string }) {
  return <span className="font-semibold text-[#2243B6]">{children}</span>;
}

export function WrenMotto({ className = "" }: { className?: string }) {
  return (
    <span className={`whitespace-nowrap ${className}`}>
      <Letter>W</Letter>eddings a<Letter>R</Letter>e <Letter>E</Letter>asy <Letter>N</Letter>ow
    </span>
  );
}
