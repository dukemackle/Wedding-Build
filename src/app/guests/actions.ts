"use server";

import Papa from "papaparse";
import { revalidatePath } from "next/cache";
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
    .eq("user_id", user.id)
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
      status: status as GuestStatus,
      priority: priority as GuestPriority,
      meal: ((formData.get("meal") as string) || "").trim() || null,
      notes: ((formData.get("notes") as string) || "").trim() || null,
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

function parsePlusOne(value: string | undefined): boolean {
  const normalized = (value ?? "").trim().toLowerCase();
  return ["yes", "y", "true", "1"].includes(normalized);
}

function parseStatus(value: string | undefined): GuestStatus {
  const normalized = (value ?? "").trim().toLowerCase();
  return VALID_STATUSES.includes(normalized as GuestStatus) ? (normalized as GuestStatus) : "invited";
}

function parsePriority(value: string | undefined): GuestPriority {
  const normalized = (value ?? "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (VALID_PRIORITIES.includes(normalized as GuestPriority)) return normalized as GuestPriority;
  if (normalized.startsWith("must")) return "must_invite";
  if (normalized.startsWith("would")) return "would_like";
  if (normalized.startsWith("if")) return "if_room";
  return "must_invite";
}

export async function importGuestsFromCsv(
  formData: FormData,
): Promise<{ error?: string; imported?: number; skipped?: number }> {
  const { supabase, user, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
  }

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    return { error: "Choose a CSV file to import." };
  }

  const text = await file.text();
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim().toLowerCase(),
  });

  if (parsed.errors.length > 0) {
    return { error: `Could not read the CSV: ${parsed.errors[0].message}` };
  }

  let skipped = 0;
  const rows = parsed.data
    .map((row) => {
      const name = (row.name ?? "").trim();
      if (!name) {
        skipped++;
        return null;
      }
      return {
        wedding_id: wedding.id,
        user_id: user.id,
        name,
        household: (row.household ?? "").trim() || null,
        email: (row.email ?? "").trim() || null,
        plus_one: parsePlusOne(row.plus_one),
        status: parseStatus(row.status),
        priority: parsePriority(row.priority),
        meal: (row.meal ?? "").trim() || null,
        notes: (row.notes ?? "").trim() || null,
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);

  if (rows.length === 0) {
    return { error: "No valid rows found — each row needs at least a name.", skipped };
  }

  const { error } = await supabase.from("guests").insert(rows);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/guests");
  revalidatePath("/budget");
  return { imported: rows.length, skipped };
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
    status: submission.status,
    meal: submission.meal,
    notes: submission.notes,
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

export async function sendBulkRsvpInvites(
  formData: FormData,
): Promise<{ error?: string; sent?: number; skipped?: number; failed?: number }> {
  const { supabase, wedding } = await requireOwnWedding();

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
