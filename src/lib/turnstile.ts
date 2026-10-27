import { headers } from "next/headers";

/**
 * Cloudflare Turnstile on the guest site's public forms (RSVP, photo wall,
 * address collector). Off until both keys are set: the site key is a plain
 * var in wrangler.jsonc (the browser needs it), the secret a Worker secret.
 */
export function turnstileSiteKey(): string | null {
  if (!process.env.TURNSTILE_SECRET_KEY?.trim()) return null;
  return process.env.TURNSTILE_SITE_KEY?.trim() || null;
}

/** The visitor's IP as Cloudflare saw it, or null in local dev. */
export async function visitorIp(): Promise<string | null> {
  const h = await headers();
  return h.get("cf-connecting-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
}

/**
 * Whether the form came from a person. True when Turnstile is off, and when
 * Cloudflare can't be reached -- the rate limits still hold then, and a guest
 * site that refuses RSVPs because of an outage is worse than a bot getting by.
 */
export async function isHuman(formData: FormData): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret || !turnstileSiteKey()) return true;

  const token = ((formData.get("cf-turnstile-response") as string) || "").trim();
  if (!token) return false;

  const body = new URLSearchParams({ secret, response: token });
  const ip = await visitorIp();
  if (ip) body.set("remoteip", ip);
  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
      signal: AbortSignal.timeout(4000),
    });
    if (!response.ok) return true;
    const result = (await response.json()) as { success?: boolean };
    return result.success === true;
  } catch {
    return true;
  }
}

export const NOT_HUMAN_ERROR = "Couldn't confirm you're not a robot. Wait a moment, then try again.";
