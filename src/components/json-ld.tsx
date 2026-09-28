/**
 * Structured data for search engines (schema.org JSON-LD). `<` is escaped so
 * a listing's own text can never close the script tag -- the sanitising step
 * Next's JSON-LD guide calls for.
 */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

/** A listing's FAQs as a schema.org FAQPage, or nothing when it has none. */
export function faqJsonLd(faqs: { question: string; answer: string }[]) {
  if (!faqs.length) return [];
  return [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    },
  ];
}
