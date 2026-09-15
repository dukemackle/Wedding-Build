import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { PublicWedding } from "@/lib/supabase/types";
import { ContactForm } from "./contact-form";

export const metadata = {
  title: "Share your address",
  // Guests reach this by a link the couple sends them, and the page is a form
  // for collecting home addresses -- there is no reason for it to be indexed.
  robots: { index: false, follow: false },
};

export default async function ContactCollectorPage({
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
    <main className="flex flex-1 flex-col items-center px-6 py-14">
      <div className="w-full max-w-2xl">
        <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">
          {coupleNames || "A wedding"}
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold leading-tight text-forest">
          Share your address
        </h1>
        <p className="mt-3 text-ink/70">
          {coupleNames || "The couple"} are getting invitations ready and would rather ask once
          than chase everyone. Fill this in and you&apos;re done.
        </p>

        <div className="mt-8">
          <ContactForm slug={slug} coupleNames={coupleNames} />
        </div>
      </div>
    </main>
  );
}
