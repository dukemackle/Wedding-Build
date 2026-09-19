"use server";

import { revalidatePath } from "next/cache";
import { parseGuestTable, parseGuestText, type GuestImportParse } from "@/lib/guest-import";
import {
  SHEET_SHARING_ERROR,
  googleSheetCsvUrl,
  parseGoogleSheetUrl,
} from "@/lib/spreadsheet";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getResendClient, INQUIRY_FROM_ADDRESS } from "@/lib/resend";
import type { Guest, GuestPriority, GuestStatus, RsvpSubmission, Wedding } from "@/lib/supabase/types";

const VALID_STATUSES: GuestStatus[] = ["invited", "confirmed", "declined", "pending"];
const VALID_PRIORITIES: GuestPriority[] = ["must_invite", "would_like", "if_room"];

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

  return { supabase, user, wedding };
}

function guestFieldsFromForm(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const status = formData.get("status") as string;
  const priority = (formData.get("priority") as string) || "must_invite";

  if (!name) {
    return { error: "Name is required." } as const;
  }
  if (!VALID_STATUSES.includes(status as GuestStatus)) {
    return { error: "Invalid status." } as const;
  }
  if (!VALID_PRIORITIES.includes(priority as GuestPriority)) {
    return { error: "Invalid priority." } as const;
  }

  return {
    fields: {
      name,
      household: ((formData.get("household") as string) || "").trim() || null,
      email: ((formData.get("email") as string) || "").trim() || null,
      plus_one: formData.get("plus_one") === "on",
      plus_one_name: ((formData.get("plus_one_name") as string) || "").trim() || null,
      status: status as GuestStatus,
      priority: priority as GuestPriority,
      meal: ((formData.get("meal") as string) || "").trim() || null,
      notes: ((formData.get("notes") as string) || "").trim() || null,
      gift_description: ((formData.get("gift_description") as string) || "").trim() || null,
    },
  } as const;
}

export async function addGuest(formData: FormData): Promise<{ error?: string }> {
  const { supabase, user, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
  }

  const parsed = guestFieldsFromForm(formData);
  if ("error" in parsed) {
    return { error: parsed.error };
  }

  const { error } = await supabase.from("guests").insert({
    wedding_id: wedding.id,
    user_id: user.id,
    ...parsed.fields,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/guests");
  revalidatePath("/budget");
  return {};
}

export async function updateGuest(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
  }

  const guestId = formData.get("id") as string;
  const parsed = guestFieldsFromForm(formData);
  if ("error" in parsed) {
    return { error: parsed.error };
  }

  const { error } = await supabase
    .from("guests")
    .update({ ...parsed.fields, updated_at: new Date().toISOString() })
    .eq("id", guestId)
    .eq("wedding_id", wedding.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/guests");
  revalidatePath("/budget");
  return {};
}

export async function deleteGuest(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
  }

  const guestId = formData.get("id") as string;

  const { error } = await supabase
    .from("guests")
    .delete()
    .eq("id", guestId)
    .eq("wedding_id", wedding.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/guests");
  revalidatePath("/budget");
  return {};
}

const MAX_IMPORT_ROWS = 1000;

function rowsForInsert(parsed: GuestImportParse, weddingId: string, userId: string) {
  return parsed.rows
    .filter((row) => row.errors.length === 0)
    .map((row) => ({
      wedding_id: weddingId,
      user_id: userId,
      ...row.values,
    }));
}

/**
 * Refuses a batch that can't be imported as asked.
 *
 * The default is all-or-nothing: working out which forty of a hundred and
 * twenty landed, and which duplicates you are about to create by trying
 * again, is harder than fixing the sheet. But on a real three-hundred-row
 * list two bad rows shouldn't hold back the other two hundred and ninety
 * eight, so the caller can opt into skipping them -- knowingly, having seen
 * in the preview exactly which rows those are.
 */
function importBlocker(parsed: GuestImportParse, skipInvalid: boolean): string | undefined {
  if (parsed.error) return parsed.error;
  if (parsed.rows.length === 0) return "No guests found to import.";
  if (parsed.rows.length > MAX_IMPORT_ROWS) {
    return `That's ${parsed.rows.length} rows — import at most ${MAX_IMPORT_ROWS} at a time.`;
  }
  const invalid = parsed.rows.filter((row) => row.errors.length > 0);
  if (invalid.length === 0) return undefined;
  if (skipInvalid) {
    return invalid.length === parsed.rows.length
      ? "Every row has a problem — nothing to import."
      : undefined;
  }
  return `${invalid.length} ${invalid.length === 1 ? "row still needs" : "rows still need"} fixing — nothing was imported.`;
}

/**
 * Imports a table the browser has already turned into rows.
 *
 * .xlsx is unzipped and parsed in the browser: the Workers runtime allows
 * 10ms of CPU per request, which a spreadsheet parse can easily blow. That
 * doesn't cost anything in trust -- the rows are re-validated here with the
 * same parser the preview used, so a hand-edited payload gets no further
 * than a pasted one.
 */
export async function importGuestRows(
  formData: FormData,
): Promise<{ error?: string; imported?: number; skipped?: number }> {
  const { supabase, user, wedding } = await requireOwnWedding();
  if (!wedding) return { error: "Set up your wedding on the Dashboard first." };

  const skipInvalid = formData.get("skip_invalid") === "true";

  let table: string[][];
  try {
    const raw: unknown = JSON.parse((formData.get("rows") as string) || "[]");
    if (!Array.isArray(raw)) throw new Error("not a table");
    table = raw.map((row: unknown) =>
      (Array.isArray(row) ? row : []).map((cell) => (cell == null ? "" : String(cell))),
    );
  } catch {
    return { error: "Couldn't read that file — please try again." };
  }

  const parsed = parseGuestTable(table);
  const blocker = importBlocker(parsed, skipInvalid);
  if (blocker) return { error: blocker };

  const rows = rowsForInsert(parsed, wedding.id, user.id);
  const { error } = await supabase.from("guests").insert(rows);
  if (error) return { error: error.message };

  revalidatePath("/guests");
  revalidatePath("/budget");
  return { imported: rows.length, skipped: parsed.rows.length - rows.length };
}

export async function importGuestsFromGoogleSheet(
  formData: FormData,
): Promise<{ error?: string; imported?: number }> {
  const { supabase, user, wedding } = await requireOwnWedding();
  if (!wedding) return { error: "Set up your wedding on the Dashboard first." };

  const sheetUrl = ((formData.get("sheet_url") as string) || "").trim();
  if (!sheetUrl) return { error: "Paste a Google Sheet URL." };

  const sheet = parseGoogleSheetUrl(sheetUrl);
  if (!sheet) return { error: "That doesn't look like a Google Sheets URL." };

  let text: string;
  try {
    const response = await fetch(googleSheetCsvUrl(sheet));
    if (!response.ok) return { error: SHEET_SHARING_ERROR };
    text = await response.text();
  } catch {
    return { error: "Couldn't reach that Google Sheet. Check the URL and try again." };
  }

  const parsed = parseGuestText(text);
  const blocker = importBlocker(parsed, false);
  if (blocker) return { error: blocker };

  const rows = rowsForInsert(parsed, wedding.id, user.id);
  const { error } = await supabase.from("guests").insert(rows);
  if (error) return { error: error.message };

  // Keep the link so they can get back to the sheet from inside Wren.
  await supabase.from("weddings").update({ spreadsheet_url: sheetUrl }).eq("id", wedding.id);

  revalidatePath("/guests");
  revalidatePath("/budget");
  return { imported: rows.length };
}

export async function addRegistryItem(formData: FormData): Promise<{ error?: string }> {
  const { supabase, user, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
  }

  const label = (formData.get("label") as string)?.trim();
  if (!label) {
    return { error: "Give the registry entry a name." };
  }

  const url = ((formData.get("url") as string) || "").trim() || null;
  const notes = ((formData.get("notes") as string) || "").trim() || null;

  const { error } = await supabase.from("registry_items").insert({
    wedding_id: wedding.id,
    user_id: user.id,
    label,
    url,
    notes,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/guests");
  return {};
}

export async function deleteRegistryItem(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
  }

  const itemId = formData.get("id") as string;

  const { error } = await supabase
    .from("registry_items")
    .delete()
    .eq("id", itemId)
    .eq("wedding_id", wedding.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/guests");
  return {};
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function enablePublicSite(): Promise<{ error?: string; slug?: string }> {
  const { supabase, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
  }

  if (wedding.public_slug) {
    return { slug: wedding.public_slug };
  }

  const base =
    slugify([wedding.partner_a_name, wedding.partner_b_name].filter(Boolean).join("-and-")) ||
    "our-wedding";

  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = `${base}-${Math.random().toString(36).slice(2, 8)}`;
    const { error } = await supabase
      .from("weddings")
      .update({ public_slug: slug })
      .eq("id", wedding.id);

    if (!error) {
      revalidatePath("/guests");
      return { slug };
    }
    // A unique-constraint collision on the slug is worth retrying with a new
    // random suffix; anything else is a real failure.
    if (!error.message.includes("duplicate key")) {
      return { error: error.message };
    }
  }

  return { error: "Could not generate a unique link — try again." };
}

export async function disablePublicSite(): Promise<{ error?: string }> {
  const { supabase, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
  }

  const { error } = await supabase
    .from("weddings")
    .update({ public_slug: null })
    .eq("id", wedding.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/guests");
  return {};
}

export async function approveRsvpSubmission(formData: FormData): Promise<{ error?: string }> {
  const { supabase, user, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
  }

  const submissionId = formData.get("submission_id") as string;

  const { data: submission, error: fetchError } = await supabase
    .from("rsvp_submissions")
    .select("*")
    .eq("id", submissionId)
    .eq("wedding_id", wedding.id)
    .maybeSingle<RsvpSubmission>();

  if (fetchError) {
    return { error: fetchError.message };
  }
  if (!submission) {
    return { error: "That RSVP submission no longer exists." };
  }

  const { error: insertError } = await supabase.from("guests").insert({
    wedding_id: wedding.id,
    user_id: user.id,
    name: submission.guest_name,
    household: submission.household,
    plus_one: submission.plus_one,
    plus_one_name: submission.plus_one_name,
    status: submission.status,
    meal: submission.meal,
    notes: submission.notes,
    photo_url: submission.photo_url,
    message: submission.message,
    song_request: submission.song_request,
    phone: submission.phone,
    sms_opt_in: submission.sms_opt_in,
  });

  if (insertError) {
    return { error: insertError.message };
  }

  const { error: deleteError } = await supabase
    .from("rsvp_submissions")
    .delete()
    .eq("id", submissionId)
    .eq("wedding_id", wedding.id);

  if (deleteError) {
    return { error: deleteError.message };
  }

  revalidatePath("/guests");
  revalidatePath("/budget");
  return {};
}

export async function dismissRsvpSubmission(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
  }

  const submissionId = formData.get("submission_id") as string;

  const { error } = await supabase
    .from("rsvp_submissions")
    .delete()
    .eq("id", submissionId)
    .eq("wedding_id", wedding.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/guests");
  return {};
}

export async function setGuestbookVisibility(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
  }

  const guestId = formData.get("guest_id") as string;
  const hidden = formData.get("hidden") === "true";

  const { error } = await supabase
    .from("guests")
    .update({ guestbook_hidden: hidden })
    .eq("id", guestId)
    .eq("wedding_id", wedding.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/guests");
  return {};
}

export async function setGuestThanked(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
  }

  const guestId = formData.get("guest_id") as string;
  const thanked = formData.get("thanked") === "true";

  const { error } = await supabase
    .from("guests")
    .update({ thanked })
    .eq("id", guestId)
    .eq("wedding_id", wedding.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/guests");
  return {};
}

export async function sendBulkRsvpInvites(
  formData: FormData,
): Promise<{ error?: string; sent?: number; skipped?: number; failed?: number }> {
  const { supabase, user, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
  }
  if (!wedding.public_slug) {
    return { error: "Turn on your guest site above before sending invites." };
  }
  if (!process.env.RESEND_API_KEY) {
    return { error: "Email sending isn't configured (missing RESEND_API_KEY)." };
  }

  const guestIds = formData.getAll("guest_id") as string[];
  const origin = (formData.get("origin") as string) || "";

  if (guestIds.length === 0) {
    return { error: "Select at least one guest to invite." };
  }

  const { data: guests, error: fetchError } = await supabase
    .from("guests")
    .select("*")
    .in("id", guestIds)
    .eq("wedding_id", wedding.id)
    .returns<Guest[]>();

  if (fetchError) {
    return { error: fetchError.message };
  }

  const invitable = (guests ?? []).filter((g) => g.email);
  const skipped = guestIds.length - invitable.length;

  if (invitable.length === 0) {
    return { error: "None of the selected guests have an email on file.", skipped };
  }

  const coupleNames = [wedding.partner_a_name, wedding.partner_b_name].filter(Boolean).join(" & ");
  const rsvpUrl = `${origin}/w/${wedding.public_slug}`;
  const resend = getResendClient();

  let sent = 0;
  let failed = 0;
  const sentIds: string[] = [];

  for (const guest of invitable) {
    try {
      const { error: sendError } = await resend.emails.send({
        from: INQUIRY_FROM_ADDRESS,
        to: guest.email!,
        // A guest hitting reply is answering the couple, not Wren -- and
        // nothing receives at the from address.
        replyTo: user.email,
        subject: `You're invited — RSVP for ${coupleNames || "our wedding"}`,
        text: `Hi ${guest.name},\n\n${coupleNames || "We"} would love for you to join us! Please RSVP using the link below:\n\n${rsvpUrl}\n\nCan't wait to celebrate with you.`,
      });

      if (sendError) {
        failed++;
        continue;
      }

      sent++;
      sentIds.push(guest.id);
    } catch {
      failed++;
    }
  }

  if (sentIds.length > 0) {
    await supabase
      .from("guests")
      .update({ invite_sent_at: new Date().toISOString() })
      .in("id", sentIds);
  }

  revalidatePath("/guests");
  return { sent, skipped, failed };
}

export async function sendRsvpReminders(
  formData: FormData,
): Promise<{ error?: string; sent?: number; skipped?: number; failed?: number }> {
  const { supabase, user, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
  }
  if (!wedding.public_slug) {
    return { error: "Turn on your guest site above before sending reminders." };
  }
  if (!process.env.RESEND_API_KEY) {
    return { error: "Email sending isn't configured (missing RESEND_API_KEY)." };
  }

  const guestIds = formData.getAll("guest_id") as string[];
  const origin = (formData.get("origin") as string) || "";

  if (guestIds.length === 0) {
    return { error: "Select at least one guest to remind." };
  }

  const { data: guests, error: fetchError } = await supabase
    .from("guests")
    .select("*")
    .in("id", guestIds)
    .eq("wedding_id", wedding.id)
    .returns<Guest[]>();

  if (fetchError) {
    return { error: fetchError.message };
  }

  const remindable = (guests ?? []).filter((g) => g.email);
  const skipped = guestIds.length - remindable.length;

  if (remindable.length === 0) {
    return { error: "None of the selected guests have an email on file.", skipped };
  }

  const coupleNames = [wedding.partner_a_name, wedding.partner_b_name].filter(Boolean).join(" & ");
  const rsvpUrl = `${origin}/w/${wedding.public_slug}`;
  const resend = getResendClient();

  let sent = 0;
  let failed = 0;
  const sentIds: string[] = [];

  for (const guest of remindable) {
    try {
      const { error: sendError } = await resend.emails.send({
        from: INQUIRY_FROM_ADDRESS,
        to: guest.email!,
        replyTo: user.email,
        subject: `Reminder: RSVP for ${coupleNames || "our wedding"}`,
        text: `Hi ${guest.name},\n\nJust a friendly reminder to RSVP for ${coupleNames || "our wedding"} — we'd love to know if you can make it!\n\n${rsvpUrl}\n\nCan't wait to celebrate with you.`,
      });

      if (sendError) {
        failed++;
        continue;
      }

      sent++;
      sentIds.push(guest.id);
    } catch {
      failed++;
    }
  }

  if (sentIds.length > 0) {
    await supabase
      .from("guests")
      .update({ last_reminded_at: new Date().toISOString() })
      .in("id", sentIds);
  }

  revalidatePath("/guests");
  return { sent, skipped, failed };
}
