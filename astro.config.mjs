import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

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
  // Emits sitemap-index.xml + sitemap-0.xml, built from `site`. public/robots.txt
  // points at the index.
  integrations: [sitemap()],
  build: {
    // Emit about-us/index.html rather than about-us.html so existing
    // /about-us/index.html URLs keep resolving.
    format: "directory",
  },
  image: {
    // Defaults for every <Image>, so a large source photo is scaled down and
    // re-encoded without the author having to opt in. "constrained" emits a
    // srcset capped at the image's own width, letting the browser pick a size
    // that fits the device instead of always downloading the largest one.
    layout: "constrained",
    responsiveStyles: true,
  },
});
