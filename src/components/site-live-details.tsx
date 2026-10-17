"use client";

import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";
import { localToday, NO_LIVE_DETAILS, type LiveDetails } from "@/lib/site-live";

const LiveDetailsContext = createContext<LiveDetails>(NO_LIVE_DETAILS);

/** The wedding's names, date and venue, for live elements on the guest site. */
export function LiveDetailsProvider({ details, children }: { details: LiveDetails; children: ReactNode }) {
  return <LiveDetailsContext.Provider value={details}>{children}</LiveDetailsContext.Provider>;
}

export function useLiveDetails() {
  return useContext(LiveDetailsContext);
}

const never = () => () => {};

/**
 * Today for the countdown: the guest's own date once the page is running,
 * UTC while it's drawn on the server (so hydration matches).
 */
export function useToday() {
  return useSyncExternalStore(never, localToday, () => new Date().toISOString().slice(0, 10));
}
