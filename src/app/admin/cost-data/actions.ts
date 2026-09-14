"use server";

import Papa from "papaparse";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { BUDGET_CATEGORIES, effectiveGuestCount } from "@/lib/budget-categories";
import { STATES, STYLE_TIERS } from "@/lib/wedding-options";

const STATE_SET = new Set<string>(STATES);
const CATEGORY_KEYS = new Set(BUDGET_CATEGORIES.map((c) => c.key));

// A state+category cell is only trusted once at least this many real
// customer quotes back it -- below that we keep whatever estimate is
// already there rather than let one fat-fingered entry define pricing
// for an entire state.
const MIN_SAMPLES = 5;

function trimmedMean(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  // Only trim outliers once there's enough of a sample that losing a
  // couple of points on each end still leaves something meaningful.
  const trim = sorted.length >= 10 ? Math.floor(sorted.length * 0.1) : 0;
  const kept = trim > 0 ? sorted.slice(trim, sorted.length - trim) : sorted;
  return kept.reduce((sum, v) => sum + v, 0) / kept.length;
}

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

export async function updateRegionalCostDataRow(
  formData: FormData,
): Promise<{ error?: string }> {
  await requireAdmin();

  const id = formData.get("id") as string;
  if (!id) return { error: "Missing row." };

  const simple = parseAmount((formData.get("simple_amount") as string) ?? "");
  const classic = parseAmount((formData.get("classic_amount") as string) ?? "");
  const luxury = parseAmount((formData.get("luxury_amount") as string) ?? "");
  const source = ((formData.get("source") as string) ?? "").trim() || null;

  const admin = createAdminSupabaseClient();
  const { error } = await admin
    .from("regional_cost_data")
    .update({
      simple_amount: simple,
      classic_amount: classic,
      luxury_amount: luxury,
      source,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/cost-data");
  return {};
}

type WeddingRow = {
  id: string;
  state: string | null;
  style_tier: string | null;
  guest_count_override: number | null;
  is_test: boolean;
};

type BudgetLineItemRow = {
  wedding_id: string;
  category: string;
  override_value: number | null;
};

type GuestRow = { wedding_id: string; status: string; plus_one: boolean };

export async function recomputeCostDataFromCustomerQuotes(): Promise<{
  error?: string;
  updatedCells?: number;
  insufficientCells?: number;
  quotesConsidered?: number;
}> {
  await requireAdmin();
  const admin = createAdminSupabaseClient();

  const { data: weddings, error: weddingsError } = await admin
    .from("weddings")
    .select("id, state, style_tier, guest_count_override, is_test")
    .eq("is_test", false)
    .returns<WeddingRow[]>();
  if (weddingsError) return { error: weddingsError.message };

  const weddingIds = (weddings ?? []).map((w) => w.id);
  if (weddingIds.length === 0) {
    return { updatedCells: 0, insufficientCells: 0, quotesConsidered: 0 };
  }

  const [{ data: lineItems, error: lineItemsError }, { data: guests, error: guestsError }] =
    await Promise.all([
      admin
        .from("budget_line_items")
        .select("wedding_id, category, override_value")
        .in("wedding_id", weddingIds)
        .not("override_value", "is", null)
        .returns<BudgetLineItemRow[]>(),
      admin
        .from("guests")
        .select("wedding_id, status, plus_one")
        .in("wedding_id", weddingIds)
        .returns<GuestRow[]>(),
    ]);
  if (lineItemsError) return { error: lineItemsError.message };
  if (guestsError) return { error: guestsError.message };

  const guestsByWedding = new Map<string, { status: string; plus_one: boolean }[]>();
  for (const g of guests ?? []) {
    const list = guestsByWedding.get(g.wedding_id) ?? [];
    list.push({ status: g.status, plus_one: g.plus_one });
    guestsByWedding.set(g.wedding_id, list);
  }

  const weddingById = new Map(
    (weddings ?? []).map((w) => [
      w.id,
      {
        state: w.state,
        tier: w.style_tier,
        guestCount: effectiveGuestCount(
          { guest_count_override: w.guest_count_override },
          guestsByWedding.get(w.id) ?? [],
        ),
      },
    ]),
  );

  const categoryByKey = new Map(BUDGET_CATEGORIES.map((c) => [c.key, c]));
  const validTiers = new Set<string>(STYLE_TIERS);

  // groups[`${state}|${categoryKey}`][tier] -> per-quote values (per-guest
  // amounts already divided down to a per-guest rate for per-guest
  // categories, so every value in the array is comparable regardless of
  // that wedding's guest count).
  const groups = new Map<string, Record<string, number[]>>();
  let quotesConsidered = 0;

  for (const item of lineItems ?? []) {
    if (item.override_value == null) continue;
    const wedding = weddingById.get(item.wedding_id);
    if (!wedding || !wedding.state || !wedding.tier || !validTiers.has(wedding.tier)) continue;

    const category = categoryByKey.get(item.category);
    if (!category) continue;

    let value: number;
    if (category.perGuestAmount > 0) {
      if (wedding.guestCount <= 0) continue;
      value = item.override_value / wedding.guestCount;
    } else {
      value = item.override_value;
    }
    if (!Number.isFinite(value) || value <= 0) continue;

    const groupKey = `${wedding.state}|${item.category}`;
    const byTier = groups.get(groupKey) ?? { Simple: [], Classic: [], Luxury: [] };
    byTier[wedding.tier].push(value);
    groups.set(groupKey, byTier);
    quotesConsidered++;
  }

  const TIER_COLUMN: Record<string, "simple_amount" | "classic_amount" | "luxury_amount"> = {
    Simple: "simple_amount",
    Classic: "classic_amount",
    Luxury: "luxury_amount",
  };

  let updatedCells = 0;
  let insufficientCells = 0;
  const now = new Date().toISOString();

  for (const [groupKey, byTier] of groups) {
    const [state, categoryKey] = groupKey.split("|");
    const category = categoryByKey.get(categoryKey);
    if (!category) continue;

    const update: Record<string, number> = {};
    const sampleCounts: string[] = [];
    for (const tier of STYLE_TIERS) {
      const values = byTier[tier] ?? [];
      if (values.length >= MIN_SAMPLES) {
        update[TIER_COLUMN[tier]] = Math.round(trimmedMean(values));
        sampleCounts.push(`${tier}: ${values.length} quotes`);
        updatedCells++;
      } else if (values.length > 0) {
        insufficientCells++;
      }
    }

    if (Object.keys(update).length === 0) continue;

    const { data: existing, error: lookupError } = await admin
      .from("regional_cost_data")
      .select("id")
      .eq("state", state)
      .eq("category_key", categoryKey)
      .maybeSingle<{ id: string }>();
    if (lookupError) return { error: lookupError.message };

    const notes = `Aggregated from real customer budget entries (${sampleCounts.join(", ")}). Recomputed ${now.slice(0, 10)}.`;

    if (existing) {
      const { error } = await admin
        .from("regional_cost_data")
        .update({ ...update, source: "Wren customer data", notes, updated_at: now })
        .eq("id", existing.id);
      if (error) return { error: error.message };
    } else {
      const { error } = await admin.from("regional_cost_data").insert({
        state,
        category_key: categoryKey,
        per_guest: category.perGuestAmount > 0,
        source: "Wren customer data",
        notes,
        updated_at: now,
        ...update,
      });
      if (error) return { error: error.message };
    }
  }

  revalidatePath("/admin/cost-data");
  return { updatedCells, insufficientCells, quotesConsidered };
}
