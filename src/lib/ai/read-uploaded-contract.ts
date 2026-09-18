import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { readContract } from "./contract-reader";

const BUCKET = "contracts";

// The model fetches this URL, not the couple, so it only has to outlive one
// API call. Still short: behind it is a document with full legal names, an
// address and payment details.
const READ_URL_TTL_SECONDS = 300;

/**
 * Reads a freshly uploaded contract and stores what it found.
 *
 * Called after any contract upload, from the budget page or the checklist, so
 * a couple who attaches a contract to a budget line finds the summary and the
 * proposed tasks waiting on the Checklist page without asking twice.
 *
 * Never throws and never fails the upload. A contract that couldn't be read
 * is still a contract worth keeping -- the file is the point, the reading is
 * a bonus -- so a failure is recorded on the row and surfaced quietly rather
 * than losing the upload the couple actually asked for.
 */
export async function readUploadedContract(
  supabase: SupabaseClient,
  contract: {
    id: string;
    wedding_id: string;
    storage_path: string;
    file_name: string;
    content_type: string | null;
  },
): Promise<void> {
  try {
    const { data: signed } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(contract.storage_path, READ_URL_TTL_SECONDS);

    if (!signed?.signedUrl) {
      await supabase
        .from("budget_contracts")
        .update({ read_error: "Wren couldn't open this file to read it." })
        .eq("id", contract.id);
      return;
    }

    const { error, read } = await readContract(
      signed.signedUrl,
      contract.file_name,
      contract.content_type,
    );

    await supabase
      .from("budget_contracts")
      .update(
        error || !read
          ? { read_error: error ?? "Wren couldn't read this one." }
          : {
              summary: read.summary,
              proposed_tasks: read.tasks,
              summarised_at: new Date().toISOString(),
              read_error: read.uncertainty || null,
            },
      )
      .eq("id", contract.id)
      .eq("wedding_id", contract.wedding_id);
  } catch {
    await supabase
      .from("budget_contracts")
      .update({ read_error: "Wren couldn't read this one." })
      .eq("id", contract.id)
      .eq("wedding_id", contract.wedding_id);
  }
}
