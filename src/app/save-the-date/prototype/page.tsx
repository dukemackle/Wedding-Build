import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Studio } from "./studio";

export const metadata: Metadata = { title: "Save the Date Studio (prototype)", robots: { index: false } };

/**
 * The Save the Date Studio prototype: sample couple, no account, nothing
 * saved. Off in production until the owner approves the direction.
 */
export default async function Page({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  if (process.env.NODE_ENV === "production" && process.env.STD_PROTOTYPE !== "1") notFound();
  const { view } = await searchParams;
  return <Studio view={view ?? "studio"} />;
}
