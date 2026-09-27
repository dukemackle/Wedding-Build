"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { WrenChatBirdIcon } from "@/components/icons";

type OneShot = "wren-snip" | "wren-flap" | "wren-hop";

const DURATION: Record<OneShot, number> = { "wren-snip": 900, "wren-flap": 700, "wren-hop": 1000 };
const SNIP_EVERY_MS = 5000;
const HOP_SEEN_KEY = "wren-bird-hopped";

/**
 * The Wren chat bird, alive: it snips its tail every few seconds, blinks at
 * random, cocks its head on hover, flaps when it (re)appears, and bobs its
 * head while `thinking`. `hopOnce` makes it hop a few seconds after load, once
 * per browser session, to point new visitors at the chat. All motion is
 * switched off for reduced-motion users by the CSS in globals.css.
 */
export function AnimatedWrenBird({
  className,
  thinking = false,
  hopOnce = false,
}: {
  className?: string;
  thinking?: boolean;
  hopOnce?: boolean;
}) {
  const [oneShot, setOneShot] = useState<OneShot | null>("wren-flap");
  const [blinking, setBlinking] = useState(false);
  const busy = useRef(true);

  const play = useCallback((name: OneShot) => {
    // Don't cut one animation off with another; the next snip comes soon.
    if (busy.current) return;
    busy.current = true;
    setOneShot(name);
  }, []);

  useEffect(() => {
    if (!oneShot) return;
    const t = setTimeout(() => {
      busy.current = false;
      setOneShot(null);
    }, DURATION[oneShot]);
    return () => clearTimeout(t);
  }, [oneShot]);

  useEffect(() => {
    const snip = setInterval(() => play("wren-snip"), SNIP_EVERY_MS);
    return () => clearInterval(snip);
  }, [play]);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const scheduleBlink = () => {
      t = setTimeout(() => {
        setBlinking(true);
        t = setTimeout(() => {
          setBlinking(false);
          scheduleBlink();
        }, 180);
      }, 3000 + Math.random() * 4000);
    };
    scheduleBlink();
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!hopOnce) return;
    try {
      if (sessionStorage.getItem(HOP_SEEN_KEY)) return;
      sessionStorage.setItem(HOP_SEEN_KEY, "1");
    } catch {
      // Storage blocked: hop anyway, it's harmless.
    }
    const t = setTimeout(() => play("wren-hop"), 2500);
    return () => clearTimeout(t);
  }, [hopOnce, play]);

  const classes = ["wren-tilt", "inline-flex", oneShot, blinking && "wren-blink", thinking && "wren-think"]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes}>
      <WrenChatBirdIcon className={className} />
    </span>
  );
}
