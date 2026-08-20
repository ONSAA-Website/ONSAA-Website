import type { APIRoute } from "astro";

/**
 * robots.txt as a route rather than a file in public/, because it has to differ
 * per deploy target.
 *
 * A static public/robots.txt is copied verbatim into every build, so the GitLab
 * Pages preview — which publishes every non-default branch, draft work included
 * — would serve `Allow: /` and invite crawlers in. `base` is the discriminator
 * already wired through both pipelines: GitLab sets ASTRO_BASE to a subpath,
 * the public GitHub deploy leaves it at "/".
 */
export const GET: APIRoute = ({ site }) => {
  const isPublicDeploy = import.meta.env.BASE_URL === "/";

  const body = isPublicDeploy
    ? [
        "User-agent: *",
        "Allow: /",
        "",
        `Sitemap: ${new URL("sitemap-index.xml", site).href}`,
        "",
      ].join("\n")
    : ["User-agent: *", "Disallow: /", ""].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
