/** The cookie that remembers a guest typed the site's password (0112_site_password_and_party.sql). */
export function gateCookie(slug: string) {
  return `ydid_site_${slug}`;
}
