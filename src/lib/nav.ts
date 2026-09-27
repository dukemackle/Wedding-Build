/**
 * Whether a link in a dropdown is the current page. The longest matching
 * link wins, so /guests/site lights up "Guest site" and not also "Guest
 * list" (whose /guests is a prefix of it).
 */
export function isActiveLink(pathname: string, href: string, siblings: { href: string }[]) {
  const matches = (h: string) => pathname === h || pathname.startsWith(`${h}/`);
  if (!matches(href)) return false;
  return !siblings.some((s) => s.href.length > href.length && matches(s.href));
}
