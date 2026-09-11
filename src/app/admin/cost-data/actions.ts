"use server";

import Papa from "papaparse";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { BUDGET_CATEGORIES } from "@/lib/budget-categories";
import { STATES } from "@/lib/wedding-options";

const STATE_SET = new Set<string>(STATES);
const CATEGORY_KEYS = new Set(BUDGET_CATEGORIES.map((c) => c.key));

function parseAmount(raw: string | undefined): number | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[^0-9.\-]/g, "").trim();
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isNaN(n) ? null : n;
}

// A CSV exported from a single tab of the master cost-data spreadsheet
// carries a merged title row above the real header row ("State,
// Simple ($), ..."). Skip down to whichever line actually starts with
// "state" before handing it to Papa Parse.
function stripLeadingTitleRow(text: string): string {
  const lines = text.split(/\r?\n/);
  const headerIndex = lines.findIndex((line) => line.trim().toLowerCase().startsWith("state,"));
  if (headerIndex <= 0) return text;
  return lines.slice(headerIndex).join("\n");
}

export async function importRegionalCostData(
  formData: FormData,
): Promise<{ error?: string; imported?: number; skipped?: number }> {
  await requireAdmin();

  const categoryKey = formData.get("category_key") as string;
  const category = BUDGET_CATEGORIES.find((c) => c.key === categoryKey);
  if (!category || !CATEGORY_KEYS.has(categoryKey)) {
    return { error: "Choose a valid category." };
  }

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    return { error: "Choose a CSV file to import." };
  }

  const rawText = await file.text();
  const parsed = Papa.parse<Record<string, string>>(stripLeadingTitleRow(rawText), {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim().toLowerCase(),
  });

  if (parsed.errors.length > 0) {
    return { error: `Could not read the CSV: ${parsed.errors[0].message}` };
  }

  const perGuest = category.perGuestAmount > 0;
  const admin = createAdminSupabaseClient();
  const now = new Date().toISOString();

  let imported = 0;
  let skipped = 0;

  for (const row of parsed.data) {
    const state = (row["state"] ?? "").trim();
    if (!STATE_SET.has(state)) {
      skipped++;
      continue;
    }

    const simple = parseAmount(row["simple ($)"]);
    const classic = parseAmount(row["classic ($)"]);
    const luxury = parseAmount(row["luxury ($)"]);
    if (simple == null && classic == null && luxury == null) {
      skipped++;
      continue;
    }

    const { error } = await admin.from("regional_cost_data").upsert(
      {
        state,
        category_key: categoryKey,
        simple_amount: simple,
        classic_amount: classic,
        luxury_amount: luxury,
        per_guest: perGuest,
        source: (row["source"] ?? "").trim() || null,
        notes: (row["notes"] ?? "").trim() || null,
        updated_at: now,
      },
      { onConflict: "state,category_key" },
    );

    if (error) return { error: error.message };
    imported++;
  }

  revalidatePath("/admin/cost-data");
  return { imported, skipped };
}
