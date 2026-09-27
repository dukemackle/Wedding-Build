"use client";

import { useEffect, useState } from "react";
import { BirdCheer } from "@/components/bird-cheer";

const NEW_ACCOUNT_MS = 24 * 60 * 60 * 1000;

/**
 * The bird waves hello on a new account's first dashboard visit. Signing up
 * usually goes through an email confirmation and a login, so "just signed up"
 * is judged by the account's age rather than by where the user came from, and
 * remembered per user in localStorage so it only happens once.
 */
export function WelcomeBird({ userId, createdAt }: { userId: string; createdAt: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (Date.now() - new Date(createdAt).getTime() > NEW_ACCOUNT_MS) return;
    const key = `wren-welcomed-${userId}`;
    try {
      if (localStorage.getItem(key)) return;
      localStorage.setItem(key, "1");
    } catch {
      return;
    }
    // Reads the clock and storage, so it can only be decided after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShow(true);
  }, [userId, createdAt]);

  return show ? <BirdCheer message="Hi! Welcome to Wren" wave /> : null;
}
