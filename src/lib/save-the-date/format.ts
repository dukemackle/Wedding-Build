import type { CardContent, DatePart, DateStyle, TextLayer } from "./types";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const ONES = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
const ORDINAL_ONES = ["", "first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth", "eleventh", "twelfth", "thirteenth", "fourteenth", "fifteenth", "sixteenth", "seventeenth", "eighteenth", "nineteenth"];

function words(n: number): string {
  if (n < 20) return ONES[n];
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? `-${ONES[n % 10]}` : "");
  if (n < 1000) return `${ONES[Math.floor(n / 100)]} hundred${n % 100 ? ` ${words(n % 100)}` : ""}`;
  return `${words(Math.floor(n / 1000))} thousand${n % 1000 ? ` ${words(n % 1000)}` : ""}`;
}

function ordinalWords(n: number): string {
  if (n < 20) return ORDINAL_ONES[n];
  if (n % 10 === 0) return TENS[n / 10].replace(/y$/, "ieth");
  return `${TENS[Math.floor(n / 10)]}-${ORDINAL_ONES[n % 10]}`;
}

/** "2028-06-12" as the template wants it. Parsed as a calendar date, never shifted by time zone. */
export function formatDate(iso: string, style: DateStyle): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  const weekday = DAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  switch (style) {
    case "dots":
      return `${String(m).padStart(2, "0")} · ${String(d).padStart(2, "0")} · ${y}`;
    case "weekday":
      return `${weekday}, ${MONTHS[m - 1]} ${d}, ${y}`;
    case "words":
      return `the ${ordinalWords(d)} of ${MONTHS[m - 1]}\n${words(y)}`;
    case "formal":
      return `${weekday}, the ${ordinalWords(d)} of ${MONTHS[m - 1]}\n${words(y)}`;
    // Batch A suites set a formal date as two lines of different sizes.
    case "formalDay":
      return `${weekday}, the ${ordinalWords(d)} of ${MONTHS[m - 1]}`;
    case "yearWords":
      return words(y);
    default:
      return `${MONTHS[m - 1]} ${d}, ${y}`;
  }
}

/** One piece of a calendar date; "" when there's no date yet. */
export function datePart(iso: string | null, part: DatePart): string {
  const [y, m, d] = (iso ?? "").split("-").map(Number);
  if (!y || !m || !d) return "";
  switch (part) {
    case "day":
      return String(d).padStart(2, "0");
    case "month":
      return String(m).padStart(2, "0");
    case "monthName":
      return MONTHS[m - 1];
    case "year":
      return String(y);
    case "year2":
      return String(y % 100).padStart(2, "0");
    case "weekday":
      return DAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  }
}

/** Whether the card shows its date as a calendar date (numerals work). */
export const hasNumericDate = (c: CardContent) => Boolean(c.date) && !c.dateText.trim();

/** Greedy word wrap at about `chars` a line, keeping existing breaks. */
export function wrapText(text: string, chars: number): string {
  return text
    .split("\n")
    .map((line) => {
      const out: string[] = [];
      let cur = "";
      for (const word of line.split(" ")) {
        if (cur && (cur + " " + word).length > chars) {
          out.push(cur);
          cur = word;
        } else cur = cur ? `${cur} ${word}` : word;
      }
      out.push(cur);
      return out.join("\n");
    })
    .join("\n");
}

/** The text a layer shows for this card's content. */
export function layerText(layer: TextLayer, c: CardContent): string {
  if (layer.when === "numericDate" && !hasNumericDate(c)) return "";
  if (layer.when === "textDate" && hasNumericDate(c)) return "";
  switch (layer.bind) {
    case "headline":
      return c.headline || layer.text || "";
    case "names": {
      const names = [c.nameA, c.nameB].filter(Boolean);
      const joiner = layer.joiner ?? " & ";
      const one = names.join(joiner);
      // Long pairs go on two lines rather than shrinking to nothing.
      return layer.wrap && one.length > layer.wrap ? names.join(`\n${joiner.trim()} `) : one;
    }
    case "nameA":
      return c.nameA;
    case "nameB":
      return c.nameB;
    case "date":
      if (c.dateText.trim()) return c.dateText.trim();
      return c.date ? formatDate(c.date, layer.dateStyle ?? "long") : "Date to come";
    case "datePart":
      return hasNumericDate(c) ? datePart(c.date, layer.part ?? "day") : "";
    case "place":
      return c.place;
    case "note":
      return c.note;
    case "request":
      return c.request ?? "";
    case "time":
      return c.time ?? "";
    case "venue":
      return c.venue ?? "";
    case "monogram":
      return `${c.nameA.trim()[0] ?? ""}${layer.joiner ?? "&"}${c.nameB.trim()[0] ?? ""}`;
    default:
      return layer.text ?? "";
  }
}
