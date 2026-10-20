# SEO and AI search

**Owns:** being found on Google and cited by AI assistants (ChatGPT, Claude,
Perplexity, Google AI Overviews) for wedding planning and local venue/vendor
searches.

**Objectives:** indexed pages and impressions/clicks in Google Search Console
(not connected yet: owner step below); rankings for a short list of target
queries per launch metro; listing pages with complete structured data.

## What exists (2026-10-20)

`src/app/sitemap.ts`, `src/app/robots.ts`, root metadata with a title template
(`src/app/layout.tsx`), canonicals and JSON-LD on venue (EventVenue) and
vendor (LocalBusiness) pages, FAQPage JSON-LD helper
(`src/components/json-ld.tsx`). Guest sites have dynamic OG tags and noindex
when locked.

**Missing:** state/city landing pages (state and city are only filters today),
Organization/WebSite JSON-LD, generated OG images for public pages, `llms.txt`,
Search Console verification, content/guide pages.

## SOP

1. **Search Console first** (free, no privacy impact). Owner steps: go to
   https://search.google.com/search-console → Add property → Domain →
   `youdoido.com` → copy the TXT record → add it in the DNS provider for
   youdoido.com → Verify → Sitemaps → submit `https://youdoido.com/sitemap.xml`.
   Then tell the CMO the property is live.
2. **Programmatic local pages, carefully.** `/venues/<state>/<city>` style
   pages only where we have enough real listings to be genuinely useful
   (set a minimum, e.g. 8+ listings), with unique intro facts (count, price
   range from our data, capacity range). Thin doorway pages hurt more than
   they help. This is a code + design change → plan, `/design-expert`, preview.
3. **The estimator is the SEO asset.** "Wedding cost in <state>" pages built
   from the cost data, each citing its source and date, are the strongest
   honest content we can make.
4. **AI search:** clear factual pages, consistent name/description across the
   site, Organization JSON-LD, an `llms.txt` summarising what the product is
   and where key pages are. Don't claim results; this is low-cost hygiene.
5. Every new public page: unique title and description, canonical, in the
   sitemap, real internal links, fast. Check with `npm run build` output.
6. Never buy links, never mass-produce AI pages without real data in them,
   never add hidden text.

**Collaborates with:** couples (landing and estimator), listings (listing page
completeness), analytics (Search Console data), compliance (claims in copy).
