"use server";

import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Guest, Wedding } from "@/lib/supabase/types";

const MODEL = "claude-haiku-4-5";
const MAX_NOTE = 2000;

async function requireOwnWedding() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: wedding } = await supabase
    .from("weddings")
    .select("*")
    .or(`user_id.eq.${user.id},partner_user_id.eq.${user.id}`)
    .maybeSingle<Wedding>();

  return { supabase, wedding };
}

/**
 * Drafts a thank-you note for one guest's gift.
 *
 * Deliberately returns the draft rather than saving it: a thank-you note is
 * the couple's voice, and a draft that silently becomes the saved note is a
 * draft nobody edits. Saving is a separate, explicit step.
 */
export async function draftThankYouNote(
  formData: FormData,
): Promise<{ draft?: string; error?: string }> {
  const { supabase, wedding } = await requireOwnWedding();
  if (!wedding) return { error: "Set up your wedding on the Dashboard first." };

  const guestId = (formData.get("guest_id") as string)?.trim();
  if (!guestId) return { error: "Missing guest." };

  const { data: guest } = await supabase
    .from("guests")
    .select("*")
    .eq("id", guestId)
    .eq("wedding_id", wedding.id)
    .maybeSingle<Guest>();

  if (!guest) return { error: "That guest is no longer on your list." };

  // Without the gift there is nothing specific to say, and a note that
  // thanks someone for "your generous gift" is the note people can tell was
  // written by a machine.
  if (!guest.gift_description?.trim()) {
    return { error: "Add what they gave first — the note needs something specific to thank them for." };
  }

  const coupleNames =
    [wedding.partner_a_name, wedding.partner_b_name].filter(Boolean).join(" and ") || "the couple";

  const details = [
    `Guest: ${guest.name}`,
    guest.plus_one && guest.plus_one_name ? `Came with: ${guest.plus_one_name}` : null,
    `Gift: ${guest.gift_description.trim()}`,
    guest.status === "confirmed"
      ? "They came to the wedding."
      : guest.status === "declined"
        ? "They could not make it to the wedding."
        : null,
    guest.message?.trim() ? `They left this message: "${guest.message.trim()}"` : null,
  ].filter((line): line is string => Boolean(line));

  const client = new Anthropic();

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 400,
      system: `You write wedding thank-you notes for ${coupleNames}, in their voice (first person plural: "we", "us", "our").

Rules:
- 2 to 4 sentences. Warm and specific, never florid.
- Name the gift and say something genuine about it -- how they will use it, where it will live.
- If the guest came to the wedding, mention that it was good to have them there. If they could not come, say they were missed. If it is not stated, say neither.
- Output only the note body. No subject line, no "Dear X" salutation, no sign-off, and absolutely no bracketed placeholders.
- Never invent details that are not given to you.`,
      messages: [{ role: "user", content: details.join("\n") }],
    });

    const text = response.content.find((block) => block.type === "text");
    if (!text || text.type !== "text") {
      return { error: "Wren didn't return a draft. Try again." };
    }

    return { draft: text.text.trim() };
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      return { error: "The assistant isn't configured yet (missing API key)." };
    }
    if (error instanceof Anthropic.RateLimitError) {
      return { error: "Wren is busy right now — try again in a moment." };
    }
    return { error: "Something went wrong reaching Wren." };
  }
}

export async function saveThankYouNote(
  formData: FormData,
): Promise<{ error?: string }> {
  const { supabase, wedding } = await requireOwnWedding();
  if (!wedding) return { error: "Set up your wedding on the Dashboard first." };

  const guestId = (formData.get("guest_id") as string)?.trim();
  if (!guestId) return { error: "Missing guest." };

  const note = ((formData.get("thank_you_note") as string) || "").trim().slice(0, MAX_NOTE);

  const { error } = await supabase
    .from("guests")
    .update({ thank_you_note: note || null, updated_at: new Date().toISOString() })
    .eq("id", guestId)
    .eq("wedding_id", wedding.id);

  if (error) return { error: "Couldn't save that note — please try again." };

  revalidatePath("/guests");
  return {};
}
