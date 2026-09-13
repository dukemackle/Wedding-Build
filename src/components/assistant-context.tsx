"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type AssistantContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const AssistantContext = createContext<AssistantContextValue | null>(null);

// Lets the top-left launcher button and the floating corner widget open
// the same Wren panel instead of each holding its own separate chat.
export function AssistantProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <AssistantContext.Provider value={{ open, setOpen }}>{children}</AssistantContext.Provider>
  );
}

export function useAssistant() {
  const ctx = useContext(AssistantContext);
  if (!ctx) {
    throw new Error("useAssistant must be used within an AssistantProvider");
  }
  return ctx;
}
