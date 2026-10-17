/**
 * A Story section's words as chapters, for the Timeline and Alternating
 * layouts. Couples just type: each paragraph (a blank line between) is a
 * chapter; a short first line above more text is its title; and a year or
 * date in front of the title -- "2019 · How we met", "June 2021 - First
 * apartment" -- becomes the moment's label on the timeline.
 */
export type StoryChapter = { when: string | null; title: string | null; text: string };

const WHEN = /^((?:[A-Z][a-z]{2,8}\.?\s+)?(?:\d{1,2},?\s+)?(?:19|20)\d{2})(?:\s*[-–—·:|,]\s*|\s+)?(.*)$/;

export function storyChapters(body: string): StoryChapter[] {
  return body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      const lines = p.split("\n");
      const head = lines.length > 1 && lines[0].trim().length <= 60 ? lines[0].trim() : null;
      const text = head ? lines.slice(1).join("\n").trim() : p;
      const match = head?.match(WHEN);
      if (match) return { when: match[1], title: match[2].trim() || null, text };
      return { when: null, title: head, text };
    });
}
