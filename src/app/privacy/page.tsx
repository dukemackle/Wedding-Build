import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — Wren",
};

export default function PrivacyPage() {
  return (
    <main className="flex flex-1 flex-col items-center px-6 py-16">
      <div className="w-full max-w-3xl">
        <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">Legal</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-forest">Privacy Policy</h1>
        <p className="mt-2 text-sm text-ink/60">Last updated: September 14, 2026</p>

        <div className="mt-8 flex flex-col gap-8 text-ink/80">
          <p>
            This Privacy Policy explains what information Wren collects, how we use it, and the
            choices you have. It applies to the couple-facing app at wrenwed.com and to any public
            wedding site created through it.
          </p>

          <Section title="1. Information we collect">
            <p className="font-medium text-ink">From account holders (couples)</p>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>
                Account info: email address and password (used only for authentication — we never
                see your plain-text password).
              </li>
              <li>
                Wedding details you enter: partner names, wedding date, region, budget figures,
                guest list, itinerary, seating/venue layout, and checklist items.
              </li>
              <li>Any photo you upload (for example, a hero photo for your public site).</li>
              <li>Messages you send to vendors/venues through the Service.</li>
            </ul>

            <p className="mt-4 font-medium text-ink">From guests (no account required)</p>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>
                Whatever you submit through a public RSVP form: your name, household, meal choice,
                notes, plus-one info, an optional photo, message, and song request.
              </li>
              <li>
                Guest-submitted RSVP data is sent to the couple whose wedding you&apos;re RSVPing
                to; it isn&apos;t visible to the general public unless the couple chooses to
                display it (for example, a guestbook photo/message on their public site).
              </li>
            </ul>

            <p className="mt-4 font-medium text-ink">Automatically</p>
            <p className="mt-2">
              Basic technical information needed to operate the Service, such as an authentication
              session cookie set by our infrastructure provider. We don&apos;t use third-party
              advertising trackers.
            </p>
          </Section>

          <Section title="2. How we use information">
            <p>We use the information above to:</p>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>
                operate the Service — store your wedding plan, display your public site, and run
                your guest list, budget, and seating tools;
              </li>
              <li>send emails you initiate — RSVP confirmations, vendor inquiries, and reminders you choose to send;</li>
              <li>respond to support requests; and</li>
              <li>maintain and improve the Service.</li>
            </ul>
            <p className="mt-3">
              We don&apos;t sell your information, and we don&apos;t use it for third-party
              advertising.
            </p>
            <p className="mt-3">
              We may also use aggregated, anonymized budget figures (never guest lists, messages,
              or anything identifying) to improve the cost estimates the Service shows &mdash; for
              example, refining what a typical wedding costs in a given state and category. This
              never includes your name, contact info, or any way to identify you or your wedding.
            </p>
          </Section>

          <Section title="3. Who we share information with">
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong className="text-ink">Vendors/venues you contact</strong> — if you send a
                vendor inquiry, the message and your reply-to email are shared with that vendor.
              </li>
              <li>
                <strong className="text-ink">Service providers</strong> who help us run Wren,
                under obligations to protect your data: our database/authentication/file-storage
                provider (Supabase), our hosting provider (Cloudflare), and our email-delivery
                provider (Resend). They process data on our behalf and don&apos;t use it for their
                own purposes.
              </li>
              <li>
                <strong className="text-ink">Legal requirements</strong> — we may disclose
                information if required by law, or to protect the rights, safety, or property of
                Wren or others.
              </li>
            </ul>
            <p className="mt-3">We don&apos;t otherwise share your personal information with third parties.</p>
          </Section>

          <Section title="4. Public visibility">
            <p>
              If you (a couple) create a public wedding site, information you choose to display
              there — itinerary details, guestbook photos/messages, RSVP-form fields — is visible
              to anyone with the link. Guests submitting an RSVP should know their submission goes
              to the couple, and anything the couple chooses to feature (for example, a guestbook
              entry) becomes visible to anyone who visits the public site.
            </p>
          </Section>

          <Section title="5. Data retention & deletion">
            <p>
              We retain your information for as long as your account is active. You can
              permanently delete your account and its data at any time from your{" "}
              <Link href="/account" className="text-brass hover:underline">
                Account page
              </Link>
              , or by contacting{" "}
              <a href="mailto:wrenwed.com@gmail.com" className="text-brass hover:underline">
                wrenwed.com@gmail.com
              </a>
              . Deleting your account removes your login immediately; if you&apos;re a wedding&apos;s
              owner, it also deletes that wedding and everything on it, except where we&apos;re
              required to retain limited records by law.
            </p>
          </Section>

          <Section title="6. Your choices">
            <p>
              Depending on where you live, you may have rights to access, correct, or delete your
              personal information, or to object to certain uses. Contact us at{" "}
              <a href="mailto:wrenwed.com@gmail.com" className="text-brass hover:underline">
                wrenwed.com@gmail.com
              </a>{" "}
              to exercise these rights, and we&apos;ll respond as required by applicable law.
            </p>
          </Section>

          <Section title="7. Children's privacy">
            <p>
              Wren isn&apos;t directed at children, and we don&apos;t knowingly collect personal
              information from children under 13. If you believe a child has provided us
              information, contact us and we&apos;ll delete it.
            </p>
          </Section>

          <Section title="8. Security">
            <p>
              We use reasonable technical and organizational measures to protect your information,
              including encrypted connections and access controls. No method of storage or
              transmission is 100% secure, and we can&apos;t guarantee absolute security.
            </p>
          </Section>

          <Section title="9. Changes to this policy">
            <p>
              We may update this Privacy Policy from time to time. If we make material changes,
              we&apos;ll post the updated policy here with a new effective date.
            </p>
          </Section>

          <Section title="10. Contact">
            <p>
              Questions about this Privacy Policy or your data? Contact us at{" "}
              <a href="mailto:wrenwed.com@gmail.com" className="text-brass hover:underline">
                wrenwed.com@gmail.com
              </a>
              .
            </p>
          </Section>
        </div>

        <p className="mt-10 text-sm text-ink/60">
          See also our{" "}
          <Link href="/terms" className="text-brass hover:underline">
            Terms of Service
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
