"use server";

import Papa from "papaparse";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { GuestStatus, Wedding } from "@/lib/supabase/types";

const VALID_STATUSES: GuestStatus[] = ["invited", "confirmed", "declined", "pending"];

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

  if (!name) {
    return { error: "Name is required." } as const;
  }
  if (!VALID_STATUSES.includes(status as GuestStatus)) {
    return { error: "Invalid status." } as const;
  }

  return {
    fields: {
      name,
      household: ((formData.get("household") as string) || "").trim() || null,
      plus_one: formData.get("plus_one") === "on",
      status: status as GuestStatus,
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
        plus_one: parsePlusOne(row.plus_one),
        status: parseStatus(row.status),
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
