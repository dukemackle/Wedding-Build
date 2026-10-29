import type { CardContent, DateStyle, TextLayer } from "./types";

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
    default:
      return `${MONTHS[m - 1]} ${d}, ${y}`;
  }
}

/** The text a layer shows for this card's content. */
export function layerText(layer: TextLayer, c: CardContent): string {
  switch (layer.bind) {
    case "headline":
      return c.headline || layer.text || "";
    case "names":
      return [c.nameA, c.nameB].filter(Boolean).join(layer.joiner ?? " & ");
    case "nameA":
      return c.nameA;
    case "nameB":
      return c.nameB;
    case "date":
      if (c.dateText.trim()) return c.dateText.trim();
      return c.date ? formatDate(c.date, layer.dateStyle ?? "long") : "Date to come";
    case "place":
      return c.place;
    case "note":
      return c.note;
    case "monogram":
      return `${c.nameA.trim()[0] ?? ""}${layer.joiner ?? "&"}${c.nameB.trim()[0] ?? ""}`;
    default:
      return layer.text ?? "";
  }
}
