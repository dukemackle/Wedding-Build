import type { WeddingPhotoCredit } from "@/lib/supabase/types";
import { UNSPLASH_HOME } from "@/lib/unsplash";

/**
 * "Photos by Ana Ruiz and Leo Park on Unsplash", under the last section, for
 * the searched photos the page is actually showing. Unsplash's terms require
 * the credit; it stays small so it doesn't compete with the couple's page.
 */
export function PhotoCredits({ credits, shown }: { credits: WeddingPhotoCredit[]; shown: (string | null)[] }) {
  const onPage = new Set(shown);
  const people = new Map<string, string>();
  for (const c of credits) if (onPage.has(c.photo_url)) people.set(c.photographer, c.profile_url);
  if (people.size === 0) return null;

  const names = [...people];
  return (
    <p className="mx-auto max-w-2xl px-6 pb-8 pt-4 text-center text-xs text-ink/55">
      {names.length === 1 ? "Photo by " : "Photos by "}
      {names.map(([name, url], i) => (
        <span key={name}>
          {i > 0 && (i === names.length - 1 ? " and " : ", ")}
          <a href={url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-ink">
            {name}
          </a>
        </span>
      ))}{" "}
      on{" "}
      <a href={UNSPLASH_HOME} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-ink">
        Unsplash
      </a>
    </p>
  );
}
