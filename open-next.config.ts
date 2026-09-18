import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Defaults are enough here: every page is either static or rendered per request, so no R2 cache is needed.
export default defineCloudflareConfig();
