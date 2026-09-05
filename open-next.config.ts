// Adapts the Next.js build for Cloudflare Workers. See
// https://opennext.js.org/cloudflare for the full option set -- e.g. an R2
// bucket for the incremental cache (wrangler.jsonc has the config note).
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig();
