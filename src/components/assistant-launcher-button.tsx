"use client";

import { useAssistant } from "@/components/assistant-context";
import { WrenBirdIcon } from "@/components/icons";

export function AssistantLauncherButton({ className = "h-8 w-8" }: { className?: string }) {
  const { open, setOpen } = useAssistant();

  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      aria-label={open ? "Close Wren, your wedding assistant" : "Open Wren, your wedding assistant"}
      className={`flex shrink-0 items-center justify-center rounded-full bg-forest text-parchment transition-colors hover:bg-forest/90 ${className}`}
    >
      <WrenBirdIcon className="h-[60%] w-[60%]" />
    </button>
  );
}
