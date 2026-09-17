"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Wedding } from "@/lib/supabase/types";
import { getResendClient, INQUIRY_FROM_ADDRESS } from "@/lib/resend";
import {
  BUDGET_CATEGORIES,
  computeCategoryValue,
  effectiveGuestCount,
} from "@/lib/budget-categories";
import { parseBudgetTable, type BudgetColumnMap } from "@/lib/budget-import";
import {
  SHEET_SHARING_ERROR,
  googleSheetCsvUrl,
  parseGoogleSheetUrl,
  readTable,
} from "@/lib/spreadsheet";

function parseOptionalAmount(raw: FormDataEntryValue | null): number | null | "invalid" {
  const trimmed = (raw as string)?.trim();
  if (!trimmed) return null;
  const value = Number(trimmed);
  if (Number.isNaN(value) || value < 0) return "invalid";
  return value;
}

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

export async function setBudgetTarget(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
  }

  const raw = (formData.get("budget_target") as string)?.trim();
  const budgetTarget = raw ? Number(raw) : null;
  if (raw && (Number.isNaN(budgetTarget) || (budgetTarget as number) < 0)) {
    return { error: "Enter a valid amount." };
  }

  const { error } = await supabase
    .from("weddings")
    .update({ budget_target: budgetTarget })
    .eq("id", wedding.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/budget");
  revalidatePath("/dashboard");
  return {};
}

// Handles the Actual and Paid quick-entry inputs (either can be set
// independently -- a couple might know what they've paid before they've
// settled on a final actual total) as well as the fuller purchased-from/
// paid-by/due-date/notes fields from the notes-icon form. All fields are
// optional except category so any single one can be saved on its own.
export async function updateBudgetLineItem(
  formData: FormData,
): Promise<{ error?: string }> {
  const { supabase, user, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
  }

  const categoryKey = formData.get("category") as string;
  const category = BUDGET_CATEGORIES.find((c) => c.key === categoryKey);
  if (!category) {
    return { error: "Unknown budget category." };
  }

  const overrideValue = parseOptionalAmount(formData.get("override_value"));
  if (overrideValue === "invalid") {
    return { error: "Enter a valid actual cost." };
  }
  const paidAmount = parseOptionalAmount(formData.get("paid_amount"));
  if (paidAmount === "invalid") {
    return { error: "Enter a valid paid amount." };
  }

  const purchasedFrom = ((formData.get("purchased_from") as string) || "").trim() || null;
  const paidBy = ((formData.get("paid_by") as string) || "").trim() || null;
  const dueDate = ((formData.get("due_date") as string) || "").trim() || null;
  const notes = ((formData.get("notes") as string) || "").trim() || null;

  const { data: guests } = await supabase
    .from("guests")
    .select("status, plus_one")
    .eq("wedding_id", wedding.id);

  const guestCount = effectiveGuestCount(wedding, guests ?? []);
  const computed = computeCategoryValue(
    category,
    guestCount,
    wedding.region,
    wedding.season,
    wedding.style_tier,
  );

  const { error } = await supabase.from("budget_line_items").upsert(
    {
      wedding_id: wedding.id,
      user_id: user.id,
      category: category.key,
      label: category.label,
      base_value: computed,
      override_value: overrideValue,
      paid_amount: paidAmount,
      purchased_from: purchasedFrom,
      paid_by: paidBy,
      due_date: dueDate,
      notes,
    },
    { onConflict: "wedding_id,category" },
  );

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/budget");
  return {};
}

export async function hideBudgetCategory(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
  }

  const categoryKey = formData.get("category") as string;
  const hidden = Array.from(new Set([...wedding.hidden_budget_categories, categoryKey]));

  const { error } = await supabase
    .from("weddings")
    .update({ hidden_budget_categories: hidden })
    .eq("id", wedding.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/budget");
  return {};
}

export async function unhideBudgetCategory(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
  }

  const categoryKey = formData.get("category") as string;
  const hidden = wedding.hidden_budget_categories.filter((key) => key !== categoryKey);

  const { error } = await supabase
    .from("weddings")
    .update({ hidden_budget_categories: hidden })
    .eq("id", wedding.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/budget");
  return {};
}

export async function sendBudgetReminder(formData: FormData): Promise<{ error?: string }> {
  const { user, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
  }
  if (!user.email) {
    return { error: "No email on your account to send a reminder to." };
  }
  if (!process.env.RESEND_API_KEY) {
    return { error: "Email sending isn't configured (missing RESEND_API_KEY)." };
  }

  const label = (formData.get("label") as string) || "this item";
  const amountText = (formData.get("amount_text") as string) || "";
  const dueDate = (formData.get("due_date") as string) || "";

  const dueText = dueDate
    ? ` It's due ${new Date(`${dueDate}T00:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.`
    : "";

  try {
    const resend = getResendClient();
    const { error: sendError } = await resend.emails.send({
      from: INQUIRY_FROM_ADDRESS,
      to: user.email,
      subject: `Payment reminder: ${label}`,
      text: `Just a reminder from Wren: ${label}${amountText ? ` (${amountText})` : ""} is still on your budget to pay.${dueText}`,
    });

    if (sendError) {
      return { error: sendError.message };
    }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to send the reminder." };
  }

  return {};
}

function customItemFieldsFromForm(formData: FormData) {
  const label = (formData.get("label") as string)?.trim();
  if (!label) {
    return { error: "Give the item a name." } as const;
  }

  const amountRaw = formData.get("amount") as string;
  const amount = Number(amountRaw);
  if (!amountRaw || Number.isNaN(amount) || amount < 0) {
    return { error: "Enter a valid amount." } as const;
  }

  const paidAmount = parseOptionalAmount(formData.get("paid_amount"));
  if (paidAmount === "invalid") {
    return { error: "Enter a valid paid amount." } as const;
  }

  return {
    fields: {
      label,
      amount,
      paid_amount: paidAmount,
      purchased_from: ((formData.get("purchased_from") as string) || "").trim() || null,
      paid_by: ((formData.get("paid_by") as string) || "").trim() || null,
      due_date: ((formData.get("due_date") as string) || "").trim() || null,
      notes: ((formData.get("notes") as string) || "").trim() || null,
    },
  } as const;
}

export async function addBudgetCustomItem(formData: FormData): Promise<{ error?: string }> {
  const { supabase, user, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
  }

  const parsed = customItemFieldsFromForm(formData);
  if ("error" in parsed) {
    return { error: parsed.error };
  }

  const { error } = await supabase.from("budget_custom_items").insert({
    wedding_id: wedding.id,
    user_id: user.id,
    ...parsed.fields,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/budget");
  revalidatePath("/dashboard");
  return {};
}

export async function updateBudgetCustomItem(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
  }

  const itemId = formData.get("id") as string;
  const parsed = customItemFieldsFromForm(formData);
  if ("error" in parsed) {
    return { error: parsed.error };
  }

  const { error } = await supabase
    .from("budget_custom_items")
    .update({ ...parsed.fields, updated_at: new Date().toISOString() })
    .eq("id", itemId)
    .eq("wedding_id", wedding.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/budget");
  revalidatePath("/dashboard");
  return {};
}

/**
 * Fetches a Google Sheet tab as a grid, for the importer to preview.
 *
 * The fetch has to happen here rather than in the browser -- Google doesn't
 * allow a cross-origin read -- but everything after it is the same path an
 * uploaded file takes, including being parsed again on import.
 */
export async function fetchBudgetSheet(
  formData: FormData,
): Promise<{ error?: string; table?: string[][]; url?: string }> {
  const { wedding } = await requireOwnWedding();
  if (!wedding) return { error: "Set up your wedding on the Dashboard first." };

  const sheetUrl = ((formData.get("sheet_url") as string) || "").trim();
  if (!sheetUrl) return { error: "Paste a Google Sheet URL." };

  const sheet = parseGoogleSheetUrl(sheetUrl);
  if (!sheet) return { error: "That doesn't look like a Google Sheets URL." };

  try {
    const response = await fetch(googleSheetCsvUrl(sheet));
    if (!response.ok) return { error: SHEET_SHARING_ERROR };
    const table = readTable(await response.text());
    if (table.length === 0) return { error: "That tab looks empty." };
    return { table, url: sheetUrl };
  } catch {
    return { error: "Couldn't reach that Google Sheet. Check the URL and try again." };
  }
}

type BudgetImportResult = {
  error?: string;
  categories?: number;
  items?: number;
  skipped?: number;
  unhidden?: string[];
};

/**
 * Brings a budget spreadsheet in.
 *
 * Takes the grid and the column mapping the browser previewed, and parses it
 * again here: the preview is a courtesy, the decision is the server's. The
 * first row claiming one of Wren's categories fills that category line --
 * `budget_line_items` holds one row per category -- and everything after it,
 * including a second photographer or a third ring, lands as its own item.
 */
export async function importBudgetRows(formData: FormData): Promise<BudgetImportResult> {
  const { supabase, user, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
  }

  let table: string[][];
  let columns: BudgetColumnMap;
  try {
    table = JSON.parse((formData.get("rows") as string) || "[]");
    columns = JSON.parse((formData.get("columns") as string) || "{}");
  } catch {
    return { error: "Couldn't read that spreadsheet. Try uploading it again." };
  }
  if (!Array.isArray(table)) {
    return { error: "Couldn't read that spreadsheet. Try uploading it again." };
  }

  const parsed = parseBudgetTable(table, columns);
  if (parsed.error) {
    return { error: parsed.error };
  }

  const skipInvalid = formData.get("skip_invalid") === "true";
  const broken = parsed.rows.filter((row) => row.errors.length > 0);
  if (broken.length > 0 && !skipInvalid) {
    return {
      error: `${broken.length} row${broken.length === 1 ? "" : "s"} still need fixing — fix them, remove them, or import the rest.`,
    };
  }

  const usable = parsed.rows.filter((row) => row.errors.length === 0);
  if (usable.length === 0) {
    return { error: "Nothing left to import." };
  }

  const { data: guests } = await supabase
    .from("guests")
    .select("status, plus_one")
    .eq("wedding_id", wedding.id);
  const guestCount = effectiveGuestCount(wedding, guests ?? []);

  const categoryRows = usable.filter((row) => row.target === "category" && row.values.category);
  const itemRows = usable.filter((row) => row.target !== "category" || !row.values.category);

  // An import shouldn't blank out details already on a line, so anything the
  // sheet doesn't say keeps whatever was there.
  const keys = categoryRows.map((row) => row.values.category as string);
  const { data: existing } = keys.length
    ? await supabase
        .from("budget_line_items")
        .select("category, override_value, paid_amount, purchased_from, paid_by, due_date, notes")
        .eq("wedding_id", wedding.id)
        .in("category", keys)
    : { data: [] };
  const existingByCategory = new Map(
    (existing ?? []).map((row: { category: string }) => [row.category, row]),
  );

  if (categoryRows.length > 0) {
    const payload = categoryRows.map((row) => {
      const key = row.values.category as string;
      const category = BUDGET_CATEGORIES.find((c) => c.key === key);
      const prior = existingByCategory.get(key) as
        | {
            override_value: number | null;
            paid_amount: number | null;
            purchased_from: string | null;
            paid_by: string | null;
            due_date: string | null;
            notes: string | null;
          }
        | undefined;

      return {
        wedding_id: wedding.id,
        user_id: user.id,
        category: key,
        label: category?.label ?? row.values.label,
        base_value: category
          ? computeCategoryValue(
              category,
              guestCount,
              wedding.region,
              wedding.season,
              wedding.style_tier,
            )
          : 0,
        override_value: row.values.amount ?? prior?.override_value ?? null,
        paid_amount: row.values.paid_amount ?? prior?.paid_amount ?? null,
        purchased_from: row.values.purchased_from ?? prior?.purchased_from ?? null,
        paid_by: prior?.paid_by ?? null,
        due_date: row.values.due_date ?? prior?.due_date ?? null,
        notes: row.values.notes ?? prior?.notes ?? null,
      };
    });

    const { error } = await supabase
      .from("budget_line_items")
      .upsert(payload, { onConflict: "wedding_id,category" });
    if (error) {
      return { error: error.message };
    }
  }

  if (itemRows.length > 0) {
    const { error } = await supabase.from("budget_custom_items").insert(
      itemRows.map((row) => ({
        wedding_id: wedding.id,
        user_id: user.id,
        label: row.values.label,
        // The column can't be null, and a line with no price yet is normal in
        // a real sheet -- zero is the honest placeholder, not a reason to
        // refuse the row.
        amount: row.values.amount ?? 0,
        paid_amount: row.values.paid_amount,
        purchased_from: row.values.purchased_from,
        paid_by: null,
        due_date: row.values.due_date,
        notes: row.values.notes,
      })),
    );
    if (error) {
      return { error: error.message };
    }
  }

  // Came from a Google Sheet: keep the link so they can reopen it from here.
  const sheetUrl = ((formData.get("sheet_url") as string) || "").trim();
  if (sheetUrl && parseGoogleSheetUrl(sheetUrl)) {
    await supabase.from("weddings").update({ spreadsheet_url: sheetUrl }).eq("id", wedding.id);
  }

  // A category the couple isn't tracking would hide what they just imported,
  // so bringing in a number for it turns the line back on.
  const unhidden = keys.filter((key) => wedding.hidden_budget_categories.includes(key));
  if (unhidden.length > 0) {
    const remaining = wedding.hidden_budget_categories.filter((key) => !unhidden.includes(key));
    await supabase
      .from("weddings")
      .update({ hidden_budget_categories: remaining })
      .eq("id", wedding.id);
  }

  revalidatePath("/budget");
  revalidatePath("/dashboard");

  return {
    categories: categoryRows.length,
    items: itemRows.length,
    skipped: broken.length,
    unhidden: unhidden.map((key) => BUDGET_CATEGORIES.find((c) => c.key === key)?.label ?? key),
  };
}

export async function deleteBudgetCustomItem(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
  }

  const itemId = formData.get("id") as string;

  const { error } = await supabase
    .from("budget_custom_items")
    .delete()
    .eq("id", itemId)
    .eq("wedding_id", wedding.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/budget");
  revalidatePath("/dashboard");
  return {};
}
