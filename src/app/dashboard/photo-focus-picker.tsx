"use client";

import Image from "next/image";
import type { PointerEvent } from "react";

/**
 * Tap the faces: the whole photo, uncropped, with a dot on the spot the
 * dashboard keeps in view. Under it, the photo cropped as a wide screen and
 * as a phone will show it, so the couple can see the result before leaving.
 */
export function PhotoFocusPicker({
  url,
  point,
  onPick,
}: {
  url: string;
  point: [number, number];
  onPick: (x: number, y: number) => void;
}) {
  const position = `${point[0]}% ${point[1]}%`;

  function handlePointer(e: PointerEvent<HTMLDivElement>) {
    const box = e.currentTarget.getBoundingClientRect();
    onPick(((e.clientX - box.left) / box.width) * 100, ((e.clientY - box.top) / box.height) * 100);
  }

  return (
    <div className="mt-3 rounded-md border border-hairline bg-parchment p-3">
      <p className="mb-2 text-xs text-ink/60">
        Tap the two of you. That spot stays in view however the screen crops it.
      </p>
      <div className="flex flex-col gap-3">
        <div
          onPointerDown={handlePointer}
          // Shrink-wrapped to the photo, so a tap's position in this box is its
          // position in the photo.
          className="relative mx-auto w-fit cursor-crosshair touch-none select-none"
        >
          <Image
            src={url}
            alt="Choose the focus point"
            width={600}
            height={400}
            sizes="16rem"
            draggable={false}
            className="block h-auto max-h-48 w-auto max-w-full rounded"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#2243B6]/60 shadow-[0_0_0_2px_rgba(20,32,61,0.5)]"
            style={{ left: `${point[0]}%`, top: `${point[1]}%` }}
          />
        </div>
        <div className="flex items-end justify-center gap-4">
          <figure className="flex flex-col items-center gap-1">
            <div className="relative h-14 w-[5.5rem] overflow-hidden rounded border border-hairline">
              <Image src={url} alt="" fill sizes="80px" className="object-cover" style={{ objectPosition: position }} />
            </div>
            <figcaption className="font-mono-numbers text-[9px] uppercase tracking-wider text-ink/50">Desktop</figcaption>
          </figure>
          <figure className="flex flex-col items-center gap-1">
            <div className="relative h-14 w-[1.6rem] overflow-hidden rounded border border-hairline">
              <Image src={url} alt="" fill sizes="32px" className="object-cover" style={{ objectPosition: position }} />
            </div>
            <figcaption className="font-mono-numbers text-[9px] uppercase tracking-wider text-ink/50">Phone</figcaption>
          </figure>
        </div>
      </div>
    </div>
  );
}
