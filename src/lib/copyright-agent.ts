/**
 * The DMCA designated agent, as filed with the U.S. Copyright Office
 * (copyright.gov/dmca-directory). /copyright and the Terms must match the
 * filing exactly.
 */
import { COMPANY_POSTAL_ADDRESS } from "@/lib/company";

export const COPYRIGHT_AGENT = {
  name: "Copyright Agent, You Do, I Do LLC",
  email: "hello@youdoido.com",
  postalAddress: COMPANY_POSTAL_ADDRESS as string | null,
};

/** Upheld notices against one uploader before their account is closed. */
export const REPEAT_INFRINGER_STRIKES = 3;
