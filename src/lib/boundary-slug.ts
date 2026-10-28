/** File name for a city's outline in public/boundaries/<ST>/ ("St. Louis" -> "st-louis"). */
export function boundarySlug(city: string): string {
  return city
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
