import { defineConfig } from "astro/config";

// The site is built for two targets with different base paths:
//   - GitLab Pages (preview)  -> usually served from a project subpath
//   - GitHub Pages (public)   -> served from a domain root
// Both are driven by env vars at build time so the same source builds for either.
// Set ASTRO_BASE=/onsaa-site/ in the GitLab pipeline; leave it unset for root.
//
// Every internal link goes through `src/lib/url.ts`, which prefixes BASE_URL,
// so changing `base` is the only thing needed to retarget a deploy.
export default defineConfig({
  site: process.env.ASTRO_SITE ?? "https://onsaa.org",
  base: process.env.ASTRO_BASE ?? "/",
  build: {
    // Emit about-us/index.html rather than about-us.html so existing
    // /about-us/index.html URLs keep resolving.
    format: "directory",
  },
});
