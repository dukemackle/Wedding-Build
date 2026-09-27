"use client";

import { createPortal } from "react-dom";
import { WrenChatBirdIcon } from "@/components/icons";

/**
 * The bird pops up with a message, flaps, and fades away on its own. Remount
 * it (a new `key`) to play it again. Portalled to <body> so a blurred or
 * transformed ancestor can't trap the fixed position inside itself. Only
 * ever rendered after a click or an effect, so `document` is there.
 */
export function BirdCheer({ message }: { message: string }) {
  if (typeof document === "undefined") return null;
  return createPortal(
    <div
      role="status"
      className="wren-cheer pointer-events-none fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2"
    >
      <span className="rounded-full bg-forest px-3 py-1 text-sm text-parchment shadow-md">{message}</span>
      <WrenChatBirdIcon className="h-12 w-12" />
    </div>,
    document.body,
  );
}
