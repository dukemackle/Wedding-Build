import { READING_WIDTH } from "@/lib/layout";
import { DATA_SOURCES } from "@/lib/data-sources";

export const metadata = {
  title: "Where our data comes from",
  description: "The sources behind You Do, I Do's cost estimates, listings and maps, with their credits.",
};

const checked = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" });

export default function DataSourcesPage() {
  return (
    <main className="flex flex-1 flex-col items-center px-6 py-16">
      <div className={`w-full ${READING_WIDTH}`}>
        <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">Data</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-forest">
          Where our data comes from
        </h1>
        <p className="mt-4 text-ink/80">
          Every number and listing detail on You Do, I Do comes from one of the sources below. Cost
          figures are estimates to plan with, not quotes: a venue or vendor&apos;s own quote always
          wins, and your budget uses yours as soon as you enter it.
        </p>

        <ul className="mt-10 flex flex-col divide-y divide-hairline border-y border-hairline">
          {DATA_SOURCES.map((source) => (
            <li key={source.id} className="py-6">
              <h2 className="font-display text-xl font-semibold text-forest">
                <a
                  href={source.url}
                  className="link-underline"
                  {...(source.url.startsWith("https://youdoido.com")
                    ? {}
                    : { target: "_blank", rel: "noopener noreferrer" })}
                >
                  {source.name}
                </a>
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink/80 sm:text-base">{source.usedFor}</p>
              <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs text-ink/60 sm:text-sm">
                <dt>Licence</dt>
                <dd>
                  {"termsUrl" in source ? (
                    <a href={source.termsUrl} className="link-underline" target="_blank" rel="noopener noreferrer">
                      {source.licence}
                    </a>
                  ) : (
                    source.licence
                  )}
                </dd>
                {"attribution" in source && (
                  <>
                    <dt>Credit</dt>
                    <dd>{source.attribution}</dd>
                  </>
                )}
                <dt>Checked</dt>
                <dd>{checked.format(new Date(source.termsCheckedAt))}</dd>
              </dl>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-sm text-ink/60">
          Spot a mistake? Tap &ldquo;Something wrong with this listing?&rdquo; on the listing itself, or
          write to{" "}
          <a href="mailto:hello@youdoido.com" className="link-underline">
            hello@youdoido.com
          </a>
          .
        </p>
      </div>
    </main>
  );
}
