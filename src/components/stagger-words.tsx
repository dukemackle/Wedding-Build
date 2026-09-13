// A per-word "stagger in" for a hero headline -- plain CSS animation
// triggered on mount, so it plays once on first load and never replays
// on scroll (there's no IntersectionObserver here to re-fire). No
// "use client" needed: it's static markup, not interactive.
export function StaggerWords({ text }: { text: string }) {
  const words = text.split(" ");
  return (
    <>
      {words.map((word, i) => (
        <span
          key={i}
          className="hero-stagger-word"
          style={{ animationDelay: `${i * 90}ms` }}
        >
          {word}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </>
  );
}
