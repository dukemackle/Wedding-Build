import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Just enough markdown for Wren's admin answers: paragraphs, bullet and
 * numbered lists, tables, **bold**, `code` and links. Links only render when
 * they point inside /admin -- anything else stays as plain text, so a model
 * answer can never send the admin somewhere off-site.
 */

const INLINE = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\))/g;

function inline(text: string): ReactNode[] {
  return text.split(INLINE).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return <b key={i}>{part.slice(2, -2)}</b>;
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <code key={i} className="rounded bg-parchment px-1 font-mono-numbers text-[0.9em]">
          {part.slice(1, -1)}
        </code>
      );
    }
    const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part);
    if (link) {
      const [, label, href] = link;
      return /^\/admin(\/|$|\?)/.test(href) ? (
        <Link key={i} href={href} className="text-wren-deep underline hover:text-forest">
          {label}
        </Link>
      ) : (
        <span key={i}>{label}</span>
      );
    }
    return part;
  });
}

const cells = (row: string) =>
  row
    .trim()
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((c) => c.trim());

function Table({ lines }: { lines: string[] }) {
  const isDivider = (l: string) => /^\|?[\s:|-]+\|?$/.test(l.trim());
  const [head, ...rest] = lines;
  const body = rest.filter((l) => !isDivider(l));
  return (
    <div className="overflow-x-auto rounded border border-hairline">
      <table className="w-full text-left text-xs">
        <thead className="bg-parchment text-ink/60">
          <tr>
            {cells(head).map((c, i) => (
              <th key={i} className="px-3 py-2 font-semibold">
                {inline(c)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-hairline">
          {body.map((row, r) => (
            <tr key={r}>
              {cells(row).map((c, i) => (
                <td key={i} className="px-3 py-2 align-top">
                  {inline(c)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type Block =
  | { kind: "table"; lines: string[] }
  | { kind: "list"; ordered: boolean; items: string[] }
  | { kind: "para"; lines: string[]; heading: boolean };

function parse(text: string): Block[] {
  const blocks: Block[] = [];
  for (const raw of text.replace(/\r/g, "").split("\n")) {
    const line = raw.trimEnd();
    const last = blocks.at(-1);
    const bullet = /^\s*(?:[-*•]|(\d+)[.)])\s+(.*)$/.exec(line);
    if (!line.trim()) {
      blocks.push({ kind: "para", lines: [], heading: false });
    } else if (line.trim().startsWith("|")) {
      if (last?.kind === "table") last.lines.push(line);
      else blocks.push({ kind: "table", lines: [line] });
    } else if (bullet) {
      const ordered = Boolean(bullet[1]);
      if (last?.kind === "list" && last.ordered === ordered) last.items.push(bullet[2]);
      else blocks.push({ kind: "list", ordered, items: [bullet[2]] });
    } else if (/^#{1,6}\s/.test(line)) {
      blocks.push({ kind: "para", lines: [line.replace(/^#+\s*/, "")], heading: true });
    } else if (last?.kind === "para" && !last.heading && last.lines.length) {
      last.lines.push(line);
    } else {
      blocks.push({ kind: "para", lines: [line], heading: false });
    }
  }
  return blocks.filter((b) => b.kind !== "para" || b.lines.length > 0);
}

export function AnswerText({ text }: { text: string }) {
  return (
    <div className="space-y-3 leading-relaxed">
      {parse(text).map((b, i) => {
        if (b.kind === "table") return <Table key={i} lines={b.lines} />;
        if (b.kind === "list") {
          const ListTag = b.ordered ? "ol" : "ul";
          return (
            <ListTag key={i} className={`space-y-1 pl-5 ${b.ordered ? "list-decimal" : "list-disc"}`}>
              {b.items.map((item, j) => (
                <li key={j}>{inline(item)}</li>
              ))}
            </ListTag>
          );
        }
        return (
          <p key={i} className={b.heading ? "font-semibold text-forest" : ""}>
            {b.lines.map((l, j) => (
              <span key={j}>
                {j > 0 && <br />}
                {inline(l)}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}
