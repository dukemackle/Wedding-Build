import Link from "next/link";

/**
 * On a listing nobody from the business has claimed: where it came from, that
 * the business isn't affiliated with us, and how they take it over. Written to
 * read as an invitation, not a warning label (docs/legal-audit.md R5).
 */
export function UnclaimedNote({ name }: { name: string }) {
  return (
    <p className="mt-2 text-xs text-ink/70">
      Built from public information. {name} hasn&apos;t claimed this listing and isn&apos;t affiliated with
      You Do, I Do.{" "}
      <Link href="/list/edit" className="underline hover:text-forest">
        Is this yours? Claim or correct it
      </Link>
    </p>
  );
}
