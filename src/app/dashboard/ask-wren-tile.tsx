"use client";

import { AnimatedWrenBird } from "@/components/animated-wren-bird";
import { useAssistant } from "@/components/assistant-context";

/**
 * Wren's box: a full-width strip below the planning boxes rather than an
 * eleventh tile, so the five-across grid stays even. It is the
 * one box in Wren's AI blue on navy -- the assistant, not a part of the plan --
 * and opens the chat in place instead of navigating. The landing page passes
 * `onClick` to open its sample-chat preview, since a visitor has no chat.
 *
 * On a phone it's a single row (bird, name, arrow); on a wide screen the
 * sample exchange fills the middle.
 */
export function AskWrenTile({ onClick }: { onClick?: () => void }) {
  const { setOpen } = useAssistant();
  return (
    <button
      type="button"
      onClick={onClick ?? (() => setOpen(true))}
      aria-label="Ask Wren, your wedding assistant"
      className="group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border border-wren/40 bg-forest px-4 py-4 text-left shadow-[0_0_40px_-12px_rgba(0,191,254,0.7)] transition-all duration-300 hover:-translate-y-1 hover:border-wren hover:shadow-[0_0_56px_-8px_rgba(0,191,254,0.85)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wren sm:gap-6 sm:px-7 sm:py-6"
    >
      {/* A faint grid and two blue glows behind everything. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(#00bffe_1px,transparent_1px),linear-gradient(90deg,#00bffe_1px,transparent_1px)] [background-size:22px_22px]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -left-10 -top-16 h-48 w-48 rounded-full bg-wren/30 blur-3xl motion-safe:animate-pulse"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-20 right-1/4 h-48 w-72 rounded-full bg-wren/15 blur-3xl"
      />

      <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-wren/60 bg-wren-soft shadow-[0_0_24px_rgba(0,191,254,0.55)] sm:h-16 sm:w-16">
        <AnimatedWrenBird className="h-7 w-7 sm:h-9 sm:w-9" />
      </span>

      <span className="relative min-w-0 flex-1 lg:flex-none">
        <span className="block font-display text-[1.6rem] font-bold leading-none text-white sm:text-[2.35rem]">
          Ask Wren
        </span>
        <span className="mt-2 flex items-center gap-1.5 font-mono-numbers text-[11px] tracking-wide text-wren sm:text-xs">
          <span className="h-1.5 w-1.5 rounded-full bg-wren shadow-[0_0_6px_#00bffe] motion-safe:animate-pulse" />
          Your AI planning assistant
        </span>
      </span>

      {/* The sample exchange: wide screens only, where there's room for it. */}
      <span className="relative hidden flex-1 flex-col gap-2 px-6 lg:flex">
        <span className="w-fit max-w-[80%] rounded-2xl rounded-bl-sm border border-white/10 bg-white/10 px-3.5 py-1.5 text-sm text-white/85">
          What should we book next?
        </span>
        <span className="ml-auto w-fit max-w-[80%] rounded-2xl rounded-br-sm bg-wren px-3.5 py-1.5 text-sm text-forest shadow-[0_0_18px_-4px_rgba(0,191,254,0.8)]">
          Your florist. The good ones book up 9 months out.
        </span>
      </span>

      <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-wren text-forest shadow-[0_0_18px_rgba(0,191,254,0.6)] transition-transform duration-300 group-hover:translate-x-1 sm:h-auto sm:w-auto sm:gap-2 sm:px-5 sm:py-2.5">
        <span className="hidden font-mono-numbers text-xs font-semibold uppercase tracking-[0.15em] sm:inline">
          Start a chat
        </span>
        <span aria-hidden="true">&rarr;</span>
      </span>
    </button>
  );
}
