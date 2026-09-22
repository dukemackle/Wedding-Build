import type { ReactNode } from "react";
import { AppNav } from "@/components/app-nav";
import { pageWidthClass, type PageWidth } from "@/lib/layout";

/**
 * The frame every signed-in page sits in: the nav, and a container beneath it
 * at one of the named page widths.
 *
 * Pages used to assemble this themselves, which is how the app ended up with
 * nine different caps and a nav matching none of them. Going through here
 * means a page picks a width from the scale, or doesn't pick one at all -- and
 * the nav always lines up with the content under it, because it is told the
 * same width.
 */
export function PageShell({
  email,
  width = "standard",
  children,
}: {
  email: string;
  width?: PageWidth;
  children: ReactNode;
}) {
  return (
    <main className="flex flex-1 flex-col items-center px-6 py-16">
      <AppNav email={email} width={width} />
      <div className={`w-full ${pageWidthClass(width)}`}>{children}</div>
    </main>
  );
}
