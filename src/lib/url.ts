/**
 * Build an internal URL that respects the configured `base`.
 *
 * The site deploys to a domain root (GitHub Pages) and to a project subpath
 * (GitLab Pages preview). Hardcoding a leading "/" works in dev and breaks on
 * the subpath deploy, so all internal links are built from BASE_URL instead.
 *
 *   url("/about-us/")  ->  "/about-us/"          when base is "/"
 *   url("/about-us/")  ->  "/onsaa-site/about-us/" when base is "/onsaa-site/"
 */
export function url(path: string): string {
  const base = import.meta.env.BASE_URL;
  return `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}
