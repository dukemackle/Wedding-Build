import { READING_WIDTH } from "@/lib/layout";
import Link from "next/link";

export const metadata = {
  title: "Terms of Service — Wren",
};

export default function TermsPage() {
  return (
    <main className="flex flex-1 flex-col items-center px-6 py-16">
      <div className={`w-full ${READING_WIDTH}`}>
        <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">Legal</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-forest">Terms of Service</h1>
        <p className="mt-2 text-sm text-ink/60">Last updated: September 13, 2026</p>

        <div className="mt-8 flex flex-col gap-8 text-ink/80">
          <p>
            Wren (&quot;Wren,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) provides a
            wedding-planning platform, including guest list, budget, seating and venue layout,
            itinerary, checklist, and vendor/venue discovery tools (the &quot;Service&quot;).
            These Terms of Service (&quot;Terms&quot;) govern your access to and use of the
            Service, including the couple-facing app at wrenwed.com and any public wedding site
            created through it. By creating an account, or by submitting an RSVP, message, or
            other content through a public wedding site, you agree to these Terms.
          </p>

          <Section title="1. Who these Terms cover">
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong className="text-ink">Account holders</strong> — couples (and any partner
                they invite) who create a Wren account to plan a wedding.
              </li>
              <li>
                <strong className="text-ink">Guests</strong> — anyone who submits an RSVP,
                message, photo, or other content through a public wedding site, without creating
                an account.
              </li>
            </ul>
            <p className="mt-3">
              References to &quot;you&quot; apply to whichever role applies to your use of the
              Service.
            </p>
          </Section>

          <Section title="2. The Service is currently free">
            <p>
              Wren is currently provided free of charge, with no fees for couples or vendors. We
              may introduce paid features or pricing in the future; if we do, we&apos;ll give you
              reasonable advance notice before any change that affects you, and continuing to use
              a paid feature after that notice takes effect means you accept the new pricing.
            </p>
          </Section>

          <Section title="3. Accounts">
            <p>
              You&apos;re responsible for keeping your login credentials confidential and for all
              activity under your account. If you invite a partner to share access to your
              wedding, you&apos;re both responsible for how that shared access is used. Notify us
              right away if you believe your account has been compromised.
            </p>
          </Section>

          <Section title="4. Your content">
            <p>
              You retain ownership of the content you submit to Wren — guest list details, budget
              information, photos, messages, itinerary details, and anything else you upload or
              enter (your &quot;Content&quot;). By submitting Content, you grant Wren a limited
              license to host, store, and display it as necessary to operate the Service — for
              example, showing a guest&apos;s RSVP photo on your public wedding site, or a
              guest&apos;s song request to the couple.
            </p>
            <p className="mt-3">You&apos;re responsible for your own Content. Don&apos;t submit anything that:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                infringes someone else&apos;s copyright, trademark, privacy, or other rights (for
                example, a photo you don&apos;t have the right to share);
              </li>
              <li>is unlawful, harassing, or abusive; or</li>
              <li>contains someone else&apos;s personal information without their consent.</li>
            </ul>
            <p className="mt-3">
              We can remove Content that violates these Terms or that we&apos;re required to
              remove by law, though we don&apos;t proactively monitor everything submitted.
            </p>
          </Section>

          <Section title="5. Public wedding sites">
            <p>
              When you (a couple) create a public wedding site, anyone with the link can view the
              information you choose to make public — including RSVP forms, itinerary details, and
              guestbook photos/messages guests submit. Don&apos;t include anything on your public
              site that you or your guests wouldn&apos;t want visible to anyone with the link.
            </p>
          </Section>

          <Section title="6. Vendors and venues">
            <p>
              Wren lets you discover and message wedding vendors and venues, including ones in our
              catalog and any you contact directly.{" "}
              <strong className="text-ink">
                Wren doesn&apos;t vet, endorse, or guarantee the quality, availability, pricing, or
                conduct of any vendor or venue
              </strong>
              — any agreement, payment, or dispute between you and a vendor/venue is between you
              and them. Budget estimates and cost data shown in the Service are informational
              only, based on general/regional averages, and aren&apos;t a quote, guarantee, or
              substitute for getting your own pricing from vendors.
            </p>
          </Section>

          <Section title="7. Referral codes">
            <p>
              Any referral code shown in your account is for informal tracking only. It
              doesn&apos;t create a binding commission, discount, or payment obligation between
              you, Wren, and any vendor unless separately and explicitly agreed in writing.
            </p>
          </Section>

          <Section title="8. Disclaimer of warranties">
            <p>
              The Service is provided &quot;as is&quot; and &quot;as available,&quot; without
              warranties of any kind, express or implied, including warranties of merchantability,
              fitness for a particular purpose, or non-infringement. We don&apos;t guarantee the
              Service will be uninterrupted, error-free, or secure.
            </p>
          </Section>

          <Section title="9. Limitation of liability">
            <p>
              To the fullest extent permitted by law, Wren isn&apos;t liable for any indirect,
              incidental, special, consequential, or punitive damages, or for any loss of data,
              revenue, or goodwill, arising from your use of the Service — including any dispute
              with a vendor or venue, or reliance on budget estimates. Our total liability for any
              claim relating to the Service is limited to the amount you paid us in the twelve
              months before the claim arose (which, while the Service is free, is $0).
            </p>
          </Section>

          <Section title="10. Termination">
            <p>
              You can stop using the Service and permanently delete your account at any time from
              your{" "}
              <Link href="/account" className="text-brass hover:underline">
                Account page
              </Link>
              . We may suspend or terminate access to the Service for anyone who violates these
              Terms.
            </p>
          </Section>

          <Section title="11. Changes to these Terms">
            <p>
              We may update these Terms from time to time. If we make material changes, we&apos;ll
              post the updated Terms here with a new effective date. Continued use of the Service
              after changes take effect means you accept the updated Terms.
            </p>
          </Section>

          <Section title="12. Governing law">
            <p>
              These Terms are governed by the laws of [STATE — to be finalized once Wren&apos;s
              business entity and home state are established], without regard to
              conflict-of-laws principles.
            </p>
          </Section>

          <Section title="13. Contact">
            <p>
              Questions about these Terms? Contact us at{" "}
              <a href="mailto:wrenwed.com@gmail.com" className="text-brass hover:underline">
                wrenwed.com@gmail.com
              </a>
              .
            </p>
          </Section>
        </div>

        <p className="mt-10 text-sm text-ink/60">
          See also our{" "}
          <Link href="/privacy" className="text-brass hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-xl font-semibold text-forest">{title}</h2>
      <div className="mt-2 text-sm leading-relaxed sm:text-base">{children}</div>
    </section>
  );
}
