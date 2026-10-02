import { READING_WIDTH } from "@/lib/layout";
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <main className="flex flex-1 flex-col items-center px-6 py-16">
      <div className={`w-full ${READING_WIDTH}`}>
        <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">Legal</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-forest">Privacy Policy</h1>
        <p className="mt-2 text-sm text-ink/60">Last updated: October 2, 2026</p>

        <div className="mt-8 flex flex-col gap-8 text-ink/80">
          <p>
            This Privacy Policy explains what information You Do, I Do collects, how we use it, and the
            choices you have. It applies to the couple-facing app at youdoido.com and to any public
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
              <li>
                Files you attach to your budget — contracts, quotes, invoices, and similar
                documents. These often contain information about other people, such as a
                vendor&apos;s business details or a signature on an agreement. They are stored
                privately, are never shown on your public wedding site, and can be opened only by
                you and the people you&apos;ve invited to plan your wedding.
              </li>
              <li>Messages you send to vendors/venues through the Service.</li>
              <li>
                Your conversations with Wren, the planning assistant: the questions you ask and
                Wren&apos;s answers. We keep them with your account so we can see where Wren falls
                short and what couples ask most often, and use the common themes, never your own
                words or anyone&apos;s name, to improve the app and write help content. They&apos;re
                deleted with your account.
              </li>
              <li>
                Files you choose through &ldquo;Choose from Drive.&rdquo; If you connect Google
                Drive, You Do, I Do asks Google only for the specific file you pick in Google&apos;s own
                picker — it cannot see, list, or open anything else in your Drive. The file is
                downloaded in your browser and then handled exactly like a file you&apos;d
                uploaded.
              </li>
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
              <li>
                Whatever you submit through a couple&apos;s address-collection link: your name,
                mailing address, email address, phone number, and any note you add. This goes to
                that couple so they can send you an invitation. It is never shown on their public
                wedding site, and the couple reviews each submission before it joins their guest
                list.
              </li>
              <li>
                Your phone number, if a couple adds it and you opt in to text updates, is used to
                send you schedule changes for that wedding — nothing else, and never marketing.
              </li>
            </ul>

            <p className="mt-4 font-medium text-ink">From vendors and venues</p>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>
                When you list or claim a business: your name and email address, used to review the
                submission and contact you about it. These aren&apos;t shown on your public
                listing.
              </li>
              <li>
                The business details and photos you submit, which become public on your listing
                once we approve them.
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

            <p className="mt-4 font-medium text-ink">Features that use AI</p>
            <p className="mt-2">
              Three parts of You Do, I Do send information to Anthropic&apos;s API to generate a response.
              Each one runs only when you ask for it:
            </p>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>
                <strong className="text-ink">Reading a contract</strong> — the document you
                uploaded or attached is sent so You Do, I Do can write a summary and pull out dates. A
                signed vendor contract usually contains full legal names, an address, and payment
                terms.
              </li>
              <li>
                <strong className="text-ink">Drafting a thank-you note</strong> — that
                guest&apos;s name, what they gave, and any message they left.
              </li>
              <li>
                <strong className="text-ink">The planning assistant</strong> — your question,
                plus details of your wedding (date, guest count, budget figures, checklist) so the
                answer is about your wedding rather than weddings in general.
              </li>
            </ul>
            <p className="mt-2">
              We also use the same API for our own admin work, such as summarising feedback or checking
              listings. That can include your names, wedding details (date, location, budget, guest
              count), feedback you&apos;ve sent us, and questions you&apos;ve asked Wren (which may
              mention anyone you named in them), but never your guest list, guests&apos; contact
              details, or messages you send vendors.
            </p>
            <p className="mt-2">
              Anthropic processes this to return a result and does not use it to train their
              models. You Do, I Do&apos;s AI output is a starting point you review — not legal, financial,
              or professional advice.
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
                <strong className="text-ink">People you invite to plan</strong> — everyone on a
                wedding can see its details and the email address of everyone else on it. People
                with view-only access can see but not change anything.
              </li>
              <li>
                <strong className="text-ink">Vendors/venues you contact</strong> — if you send a
                vendor inquiry, the message and your reply-to email are shared with that vendor.
              </li>
              <li>
                <strong className="text-ink">Service providers</strong> who help us run You Do, I Do,
                under obligations to protect your data: our
                database/authentication/file-storage provider (Supabase), our hosting provider
                (Cloudflare), our email-delivery provider (Resend), our text-message provider
                (Twilio, only for guests who opted in to schedule updates), and Anthropic, which
                powers the AI features described above. They process data on our behalf and
                don&apos;t use it for their own purposes.
              </li>
              <li>
                <strong className="text-ink">Google</strong> — only if you use &ldquo;Choose from
                Drive.&rdquo; You Do, I Do&apos;s use of information received from Google APIs follows the{" "}
                <a
                  href="https://developers.google.com/terms/api-services-user-data-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brass hover:underline"
                >
                  Google API Services User Data Policy
                </a>
                , including its Limited Use requirements. We request the narrowest available
                permission, which covers only files you personally select; we don&apos;t store
                your Google account credentials, and we don&apos;t use Google Drive data for
                advertising or sell it to anyone.
              </li>
              <li>
                <strong className="text-ink">Legal requirements</strong> — we may disclose
                information if required by law, or to protect the rights, safety, or property of
                You Do, I Do or others.
              </li>
            </ul>
            <p className="mt-3">We don&apos;t otherwise share your personal information with third parties.</p>
          </Section>

          <Section title="4. Public visibility">
            <p>
              If you (a couple) create a public wedding site, information you choose to display
              there — guestbook photos/messages, RSVP-form fields, and your weekend schedule once
              you publish it — is visible to anyone with the link. Guests submitting an RSVP
              should know their submission goes to the couple, and anything the couple chooses to
              feature (for example, a guestbook entry) becomes visible to anyone who visits the
              public site.
            </p>
            <p className="mt-3">
              Two things are never public: your itinerary stays private until you choose to
              publish it, and contracts or documents you attach to your budget are never shown on
              a wedding site at all.
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
              <a href="mailto:privacy@youdoido.com" className="text-brass hover:underline">
                privacy@youdoido.com
              </a>
              . Deleting your account removes your login immediately; if you&apos;re a wedding&apos;s
              owner, it also deletes that wedding and everything on it — including any photos and
              any contracts or documents you uploaded — except where we&apos;re required to retain
              limited records by law.
            </p>
          </Section>

          <Section title="6. Your choices">
            <p>
              Depending on where you live, you may have rights to access, correct, or delete your
              personal information, or to object to certain uses. Contact us at{" "}
              <a href="mailto:privacy@youdoido.com" className="text-brass hover:underline">
                privacy@youdoido.com
              </a>{" "}
              to exercise these rights, and we&apos;ll respond as required by applicable law.
            </p>
          </Section>

          <Section title="7. Children's privacy">
            <p>
              You Do, I Do isn&apos;t directed at children, and we don&apos;t knowingly collect personal
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
              <a href="mailto:privacy@youdoido.com" className="text-brass hover:underline">
                privacy@youdoido.com
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
