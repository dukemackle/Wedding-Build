import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Wedding } from "@/lib/supabase/types";
import { qrSvg } from "@/lib/qr";
import { PrintButton } from "./print-button";

function formatDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * A printable sheet of table cards: four to a letter page, cut into quarters.
 *
 * Not on the page-width scale (src/lib/layout.ts) and no nav: it's a sheet of
 * paper, sized in inches for the printer, not a screen in the app.
 */
export default async function TableCardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: wedding } = await supabase
    .from("weddings")
    .select("*")
    .or(`user_id.eq.${user.id},partner_user_id.eq.${user.id}`)
    .maybeSingle<Wedding>();

  if (!wedding?.public_slug) {
    return (
      <main className="mx-auto max-w-md px-6 py-16 text-center">
        <p className="text-ink/70">Turn on your guest site first — the code points to it.</p>
        <Link href="/guests" className="mt-4 inline-block text-brass hover:underline">
          Back to Guests
        </Link>
      </main>
    );
  }

  const host = (await headers()).get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  const shareUrl = `${protocol}://${host}/w/${wedding.public_slug}/share`;
  const svg = await qrSvg(shareUrl);
  const names = [wedding.partner_a_name, wedding.partner_b_name].filter(Boolean).join(" & ");

  return (
    <main className="flex flex-col items-center gap-6 bg-parchment px-4 py-8 print:bg-white print:p-0">
      <style>{`@page { size: letter; margin: 0.4in; }`}</style>
      <div className="flex items-center gap-4 print:hidden">
        <Link href="/guests" className="text-sm text-brass hover:underline">
          &larr; Back to Guests
        </Link>
        <PrintButton />
      </div>

      <div className="grid w-[7.7in] max-w-full grid-cols-1 bg-white shadow-sm sm:grid-cols-2 print:shadow-none">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex h-[5in] flex-col items-center justify-center border border-dashed border-hairline px-6 text-center"
          >
            <p className="font-mono-numbers text-[10px] uppercase tracking-[0.24em] text-brass">
              Share your photos
            </p>
            <p className="mt-2 font-display text-3xl font-medium leading-tight text-forest">
              {names}
            </p>
            <div
              className="mt-4 w-36 [&>svg]:h-auto [&>svg]:w-full"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
            <p className="mt-4 text-sm text-ink/70">
              Scan to add your pictures to our wall
            </p>
            {wedding.wedding_date && (
              <p className="mt-1 text-xs text-ink/50">{formatDate(wedding.wedding_date)}</p>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
