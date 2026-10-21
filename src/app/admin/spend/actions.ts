"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { logAdminAction } from "@/lib/admin-audit";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { BILLING_CYCLES, SPEND_CATEGORIES } from "@/lib/spend";

function text(formData: FormData, key: string, max: number): string | null {
  const value = String(formData.get(key) ?? "").trim();
  return value ? value.slice(0, max) : null;
}

/** Adds a service, or updates it when the form carries an id. */
export async function saveService(formData: FormData): Promise<{ error?: string }> {
  await requireAdmin();

  const id = text(formData, "id", 64);
  const name = text(formData, "name", 120);
  if (!name) return { error: "Give the service a name." };

  const category = String(formData.get("category") ?? "");
  if (!(category in SPEND_CATEGORIES)) return { error: "Choose a category." };
  const billingCycle = String(formData.get("billing_cycle") ?? "");
  if (!(billingCycle in BILLING_CYCLES)) return { error: "Choose how often it bills." };

  // Blank means "price not known yet", which is different from $0.
  const rawAmount = String(formData.get("amount") ?? "").replace(/[$,\s]/g, "");
  let amountCents: number | null = null;
  if (rawAmount) {
    const n = Number(rawAmount);
    if (!Number.isFinite(n) || n < 0) return { error: "The price should be a number, like 12.99." };
    amountCents = Math.round(n * 100);
  }

  const nextRenewal = text(formData, "next_renewal", 10);
  if (nextRenewal && !/^\d{4}-\d{2}-\d{2}$/.test(nextRenewal)) return { error: "Use a real renewal date." };

  const row = {
    name,
    category,
    plan: text(formData, "plan", 200),
    amount_cents: amountCents,
    billing_cycle: billingCycle,
    next_renewal: nextRenewal,
    paid_with: text(formData, "paid_with", 80),
    status: formData.get("status") === "cancelled" ? "cancelled" : "active",
    notes: text(formData, "notes", 1000),
    updated_at: new Date().toISOString(),
  };

  const admin = createAdminSupabaseClient();
  const { data, error } = id
    ? await admin.from("ops_services").update(row).eq("id", id).select("id").single()
    : await admin.from("ops_services").insert(row).select("id").single();
  if (error) return { error: error.message };

  await logAdminAction(id ? "spend.update" : "spend.add", { type: "ops_service", ids: [data?.id] }, `${id ? "Updated" : "Added"} ${name} on Spend & renewals`);
  revalidatePath("/admin/spend");
  return {};
}

export async function deleteService(id: string): Promise<{ error?: string }> {
  await requireAdmin();
  const admin = createAdminSupabaseClient();
  const { data, error } = await admin.from("ops_services").delete().eq("id", id).select("name").single();
  if (error) return { error: error.message };
  await logAdminAction("spend.delete", { type: "ops_service", ids: [id] }, `Deleted ${data?.name ?? "a service"} from Spend & renewals`);
  revalidatePath("/admin/spend");
  return {};
}
