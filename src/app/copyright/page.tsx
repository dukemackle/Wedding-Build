import Link from "next/link";
import { READING_WIDTH } from "@/lib/layout";
import { COPYRIGHT_AGENT, REPEAT_INFRINGER_STRIKES } from "@/lib/copyright-agent";

export const metadata = {
  title: "Copyright complaints",
  description: "How to report a photo or other content on You Do, I Do that infringes your copyright, and how to respond to one.",
};

export default function CopyrightPage() {
  const email = (
    <a href={`mailto:${COPYRIGHT_AGENT.email}`} className="text-brass hover:underline">
      {COPYRIGHT_AGENT.email}
    </a>
  );
  return (
    <main className="flex flex-1 flex-col items-center px-6 py-16">
      <div className={`w-full ${READING_WIDTH}`}>
        <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">Legal</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-forest">Copyright complaints</h1>
        <p className="mt-2 text-sm text-ink/60">Last updated: November 7, 2026</p>

        <div className="mt-8 flex flex-col gap-8 text-ink/80">
          <p>
            Couples, their guests, venues, vendors and marketplace sellers upload photos and other content to
            You Do, I Do. If something here uses your work without permission, tell us and we&apos;ll take it
            down. We follow the notice-and-takedown process of the Digital Millennium Copyright Act (17 U.S.C.
            512).
          </p>

          <Section title="Where to send a notice">
            <p>Our designated agent for copyright notices is:</p>
            <p className="mt-3 rounded-lg border border-hairline bg-card px-4 py-3">
              {COPYRIGHT_AGENT.name}
              <br />
              Email: {email}
              {COPYRIGHT_AGENT.postalAddress && (
                <>
                  <br />
                  {COPYRIGHT_AGENT.postalAddress}
                </>
              )}
            </p>
            <p className="mt-3">
              Put &quot;Copyright notice&quot; in the subject line so it reaches the right person quickly. To report a
              listing that&apos;s wrong or closed, use &quot;Something wrong?&quot; on the listing.
            </p>
          </Section>

          <Section title="What a notice needs">
            <p>For us to act on it, your notice has to include:</p>
            <ol className="mt-3 list-decimal space-y-2 pl-5">
              <li>your physical or electronic signature (typing your full name works);</li>
              <li>the work you say is infringed, or a list if there are several;</li>
              <li>
                the content you want removed, with its web address (the page it&apos;s on, or the photo&apos;s
                own link) so we can find it;
              </li>
              <li>your name, postal address, phone number and email;</li>
              <li>
                a statement that you believe in good faith the use isn&apos;t authorized by the copyright owner,
                its agent or the law; and
              </li>
              <li>
                a statement that the information in your notice is accurate and, under penalty of perjury, that
                you are the copyright owner or are authorized to act for them.
              </li>
            </ol>
            <p className="mt-3">
              Before you send one, consider whether the use might be fair use. Under 17 U.S.C. 512(f), anyone who
              knowingly misrepresents that material is infringing can be liable for damages.
            </p>
          </Section>

          <Section title="What we do with it">
            <p>
              When a notice is complete, we remove or disable the content promptly and tell the person who posted
              it, with a copy of the notice. If a notice is missing something, we&apos;ll write back and ask.
            </p>
          </Section>

          <Section title="If your content was removed: counter-notice">
            <p>
              If you believe what you posted was removed by mistake or misidentified, you can send a counter-notice
              to the same address. It has to include:
            </p>
            <ol className="mt-3 list-decimal space-y-2 pl-5">
              <li>your physical or electronic signature;</li>
              <li>what was removed and where it appeared before;</li>
              <li>
                a statement, under penalty of perjury, that you believe in good faith it was removed by mistake or
                misidentification;
              </li>
              <li>your name, postal address and phone number; and</li>
              <li>
                a statement that you consent to the jurisdiction of the federal district court for your address
                (or, outside the United States, any judicial district where You Do, I Do may be found), and that
                you&apos;ll accept service of process from the person who sent the original notice or their agent.
              </li>
            </ol>
            <p className="mt-3">
              We send the counter-notice to whoever filed the original notice. Unless they tell us within 10
              business days that they&apos;ve filed a court action, we put the content back 10 to 14 business days
              after we received your counter-notice.
            </p>
          </Section>

          <Section title="Repeat infringers">
            <p>
              We close the account of anyone who repeatedly posts infringing content: after {REPEAT_INFRINGER_STRIKES}{" "}
              upheld notices, or sooner when the infringement is deliberate. A notice withdrawn, or overturned by a
              counter-notice that isn&apos;t challenged in court, doesn&apos;t count.
            </p>
          </Section>
        </div>

        <p className="mt-10 text-sm text-ink/60">
          See also our{" "}
          <Link href="/terms" className="text-brass hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
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
