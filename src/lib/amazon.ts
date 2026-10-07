/**
 * Amazon Associates links.
 *
 * The owner is an Amazon Influencer, which runs on an Associates store ID.
 * Every amazon.com link we render goes through `withAmazonTag` so the tag is
 * never forgotten, and anything showing one carries AMAZON_DISCLOSURE nearby
 * (Associates agreement + FTC). Links never go in emails -- Amazon forbids it.
 *
 * While AMAZON_TAG is empty, links stay untagged and the checklist shop links
 * and disclosure are hidden, so nothing claims an earning that isn't set up.
 */
export const AMAZON_TAG = "";

export const AMAZON_DISCLOSURE = "As an Amazon Associate, You Do, I Do earns from qualifying purchases.";

export function isAmazonUrl(url: string | null | undefined) {
  if (!url) return false;
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host === "amazon.com" || host.endsWith(".amazon.com") || host === "amzn.to";
  } catch {
    return false;
  }
}

/** Adds (or replaces) our tag on an amazon.com link; anything else passes through. */
export function withAmazonTag(url: string | null): string | null {
  if (!url || !AMAZON_TAG || !isAmazonUrl(url)) return url;
  const parsed = new URL(url);
  // amzn.to short links carry whoever made them; they can't be retagged.
  if (parsed.hostname === "amzn.to") return url;
  parsed.searchParams.set("tag", AMAZON_TAG);
  return parsed.toString();
}

/**
 * Plan tasks where couples usually end up buying small things on Amazon
 * anyway. Keyed by the template title; a task the couple renamed loses its
 * link, which is fine. Searches rather than products, so nothing goes stale.
 */
const CHECKLIST_SHOP: Record<string, string> = {
  "Ask the people you want standing up with you": "bridesmaid proposal box",
  "Book the honeymoon, and check your passports": "passport holder travel organizer",
  "Write your thank-you notes": "wedding thank you cards",
  "Put tips and final payments in labeled envelopes": "wedding vendor tip envelopes",
  "Pack an emergency kit": "wedding day emergency kit",
  "Build the seating chart": "wedding seating chart sign",
};

export function checklistShopUrl(title: string) {
  const query = CHECKLIST_SHOP[title];
  if (!query || !AMAZON_TAG) return null;
  return withAmazonTag(`https://www.amazon.com/s?k=${encodeURIComponent(query)}`);
}
