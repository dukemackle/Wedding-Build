import "server-only";
import Anthropic from "@anthropic-ai/sdk";

/**
 * Reads a wedding vendor contract and proposes tasks from it.
 *
 * A stronger model than the assistant's `claude-haiku-4-5`: this is a legal
 * document with money attached, and a misread cancellation window costs the
 * couple real money. A contract is a handful of pages read once, so the
 * accuracy is worth more than the fraction of a cent it adds.
 *
 * The PDF goes to the API by URL rather than being downloaded and base64'd
 * here. A Cloudflare Worker gets 10ms of CPU per request, which encoding a
 * few megabytes would blow through -- and the model reads scanned contracts
 * from the page images anyway, so there's no text extraction to do either.
 */
const MODEL = "claude-sonnet-5";

export type ContractTask = {
  title: string;
  /** ISO date, or null when the contract only says "two weeks before". */
  due_date: string | null;
  /**
   * Why this task exists, quoting the contract where it can. The couple has
   * to be able to check Wren's reading against the page it came from.
   */
  notes: string;
};

export type ContractRead = {
  summary: string;
  tasks: ContractTask[];
};

const SYSTEM = `You read wedding vendor contracts for a couple planning their wedding.

Return a short plain-English summary and a list of dated tasks.

The summary covers, when the contract says them: who the vendor is, what is
being provided, the total, the deposit and what is still owed, the payment
schedule, the cancellation and refund terms, and anything unusual the couple
would want to know. Six sentences at most. Say plainly when the contract does
not state something rather than guessing at it.

Tasks are things the couple must DO, each with the date it must be done by:
payments due, final headcount deadlines, the last day to cancel for a refund,
menu or song selections due, certificates of insurance to provide. Do not
invent tasks the contract does not call for, and do not pad the list.

For each task, quote the words the date came from in the notes, so the couple
can check it. If the contract gives a relative deadline ("two weeks before the
event") rather than a date, set due_date to null and say so in the notes --
never calculate a date the contract did not state.

Reply with ONLY a JSON object, no prose around it:
{"summary": "...", "tasks": [{"title": "...", "due_date": "YYYY-MM-DD" or null, "notes": "..."}]}`;

/** Trims a model-written field to something a database column can hold. */
function clamp(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function parseDate(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const [, y, m, d] = match;
  const month = Number(m);
  const day = Number(d);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return `${y}-${m}-${d}`;
}

/** Image types the API reads. HEIC isn't one, which is why it isn't offered. */
const READABLE_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function readContract(
  fileUrl: string,
  fileName: string,
  contentType: string | null,
): Promise<{ error?: string; read?: ContractRead }> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { error: "Wren's AI isn't configured yet (missing ANTHROPIC_API_KEY)." };
  }

  // A PDF goes as a document; a photographed contract has to go as an image,
  // since a document block's URL source is PDF-only.
  const isPdf = contentType === "application/pdf";
  const isImage = Boolean(contentType && READABLE_IMAGE_TYPES.has(contentType));
  if (!isPdf && !isImage) {
    return {
      error: "Wren can read PDFs and photos (JPG, PNG, WebP). Save this one as a PDF and retry.",
    };
  }

  const document: Anthropic.ContentBlockParam = isPdf
    ? { type: "document", source: { type: "url", url: fileUrl }, title: fileName }
    : { type: "image", source: { type: "url", url: fileUrl } };

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let text: string;
  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 2048,
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: [
            document,
            {
              type: "text",
              text: "Summarise this contract and list the dated tasks it puts on the couple.",
            },
          ],
        },
      ],
    });
    const block = response.content.find((part) => part.type === "text");
    text = block && block.type === "text" ? block.text : "";
  } catch (err) {
    return {
      error:
        err instanceof Error
          ? `Couldn't read that contract: ${err.message}`
          : "Couldn't read that contract.",
    };
  }

  // The model is asked for bare JSON, but a stray fence or sentence around it
  // shouldn't lose the whole read.
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) {
    return { error: "Wren couldn't make sense of that contract. Try a clearer copy." };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text.slice(start, end + 1));
  } catch {
    return { error: "Wren couldn't make sense of that contract. Try a clearer copy." };
  }

  const object = parsed as { summary?: unknown; tasks?: unknown };
  const summary = clamp(object.summary, 4000);
  if (!summary) {
    return { error: "Wren couldn't make sense of that contract. Try a clearer copy." };
  }

  const tasks = (Array.isArray(object.tasks) ? object.tasks : [])
    .map((task) => {
      const row = task as { title?: unknown; due_date?: unknown; notes?: unknown };
      return {
        title: clamp(row.title, 200),
        due_date: parseDate(row.due_date),
        notes: clamp(row.notes, 1000),
      };
    })
    .filter((task) => task.title !== "")
    // A contract with thirty deadlines is a contract Wren has misread; cap it
    // rather than filling someone's checklist with noise.
    .slice(0, 20);

  return { read: { summary, tasks } };
}
