/**
 * The line at the foot of every inquiry a couple sends through Wren.
 *
 * Vendors get a lot of inquiries and rarely know where any of them came from.
 * Saying so -- plainly, below the couple's own words, never inside them --
 * is how a vendor learns that Wren sends them business, which is the whole
 * case for them caring about their listing later.
 *
 * For a listing we can also include its claim link: an inquiry is the moment a
 * venue or vendor is most interested in how it looks on Wren, so it's the best-timed
 * invitation to fix its listing we'll ever send.
 */
export function inquiryFooter(listingName: string, claimUrl?: string | null, couplesSoFar = 0): string {
  const lines = [
    "",
    "",
    "--",
    `This couple found ${listingName} on You Do, I Do (youdoido.com), a wedding-planning app. Reply to this email to reach them directly.`,
  ];
  // The running count, from the second couple on: the plainest proof we send them business.
  if (couplesSoFar > 1) {
    lines.push(`That's ${couplesSoFar} couples who have contacted ${listingName} through You Do, I Do.`);
  }
  if (claimUrl) {
    lines.push("", `Is ${listingName}'s listing on You Do, I Do up to date? Check it and add your photos (free): ${claimUrl}`);
  }
  // Every business we list gets a way out in the first email we send it.
  lines.push(`Want this listing changed or taken down? Email hello@youdoido.com.`);
  return lines.join("\n");
}

export function inquirySubject(from: string, followUp = false): string {
  return `${followUp ? "Following up: wedding" : "Wedding"} inquiry from ${from} (via You Do, I Do)`;
}
