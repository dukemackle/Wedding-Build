import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { PublicWedding } from "@/lib/supabase/types";
import { GuestPostForm } from "../guest-post-form";

/**
 * Where the table-card QR code lands: post a photo to the wall, nothing else.
 *
 * Its own page rather than an anchor on the guest site because the person
 * scanning it is standing at a reception with a drink in one hand -- the
 * travel notes and FAQ are the last thing they want to scroll past.
 */
export default async function SharePhotoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: wedding } = await supabase
    .from("public_weddings")
    .select("*")
    .eq("public_slug", slug)
    .maybeSingle<PublicWedding>();

  if (!wedding) {
    notFound();
  }

  const coupleNames = [wedding.partner_a_name, wedding.partner_b_name]
    .filter(Boolean)
    .join(" & ");

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-10 sm:px-6 sm:py-16">
      <div className="w-full max-w-md">
        <p className="text-center font-mono-numbers text-[11px] uppercase tracking-[0.24em] text-brass">
          The photo wall
        </p>
        <h1 className="mt-2 text-center font-display text-4xl font-medium text-forest">
          {coupleNames || "The happy couple"}
        </h1>
        <p className="mt-2 text-center text-sm text-ink/70">
          Share a photo or a few words — they&apos;ll go up on the wall for everyone to see.
        </p>
        <div className="mt-8 rounded-lg border border-hairline bg-card p-5 shadow-sm sm:p-6">
          <GuestPostForm weddingId={wedding.id} coupleNames={coupleNames || "the couple"} />
        </div>
        <p className="mt-6 text-center">
          <Link href={`/w/${slug}#photo-wall`} className="text-sm text-brass hover:underline">
            See the wall &rarr;
          </Link>
        </p>
      </div>
    </main>
  );
}
