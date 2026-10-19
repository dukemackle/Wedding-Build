"use client";

/**
 * The first thing a keyboard user reaches on every page: a link past the nav
 * to the page's own content. Hidden until focused.
 *
 * Pages built on PageShell mark their content `#main-content`; the rest
 * (landing, auth, browse screens) fall back to their <main>. A script
 * rather than a plain #fragment so it works without an id on all 40-odd
 * <main> elements, and so focus actually moves, not just the scroll.
 */
export function SkipLink() {
  return (
    <a
      href="#main-content"
      onClick={(e) => {
        const target =
          document.getElementById("main-content") ?? document.querySelector<HTMLElement>("main");
        if (!target) return;
        e.preventDefault();
        if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
        target.focus();
        target.scrollIntoView({ block: "start" });
      }}
      className="sr-only rounded-md bg-forest px-4 py-2 text-sm font-medium text-parchment shadow-lg focus:not-sr-only focus:fixed focus:px-4 focus:py-2 focus:left-4 focus:top-4 focus:z-[100]"
    >
      Skip to content
    </a>
  );
}
