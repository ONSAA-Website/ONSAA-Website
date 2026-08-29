# ONSAA

I promise I'm trying my best. At least it wasn't a Graphic Design is my Passion kinda website.

- ONSAA | Logistics, Information Systems and Technology

## Running the site

The site is built with [Astro](https://astro.build). Requires Node 22+.

```bash
npm install
npm run dev      # local dev server
npm run build    # static build into dist/
npm run preview  # serve the built output
```

## How Astro works

Astro runs at **build time** and outputs plain static HTML — the same kind of
files this site was before. There is no framework running in the browser, and
no JavaScript is shipped unless a page explicitly asks for it.

**A `.astro` file is frontmatter plus HTML.** *Frontmatter* is the block
between the `---` fences at the top of the file. It is JavaScript that runs
during the build and never reaches the browser; below it is normal HTML, where
`{}` drops a value from the frontmatter into the markup.

```astro
---
const links = ["Home", "About us"];   // build-time only
---
<nav>{links.map((l) => <a>{l}</a>)}</nav>
```

**Files in `src/pages/` become routes.** A *route* is just a URL path a
visitor can land on — the `/about-us/` part of `https://onsaa.org/about-us/`.

Before, that path existed because there was a literal `about-us/` folder with
an `index.html` inside it; the URL matched the folder because you built the
folder by hand. Astro keeps that idea but derives it from the filename: put a
file in `src/pages/`, and its name *is* the URL. Nothing registers it, and
there is no route list to keep in sync — renaming the file changes the URL.

| File in `src/pages/` | URL | Built to |
| --- | --- | --- |
| `index.astro` | `/` | `dist/index.html` |
| `about-us.astro` | `/about-us/` | `dist/about-us/index.html` |
| `donate-success.astro` | `/donate-success/` | `dist/donate-success/index.html` |

The build still emits a folder with an `index.html`, exactly like the old
hand-made tree, because `build.format: "directory"` is set in
`astro.config.mjs`. That keeps existing `/about-us/index.html` links working.
Only files in `src/pages/` become routes — everything in `components/`,
`layouts/` and `lib/` is used *by* pages and gets no URL of its own.

**A *component* is a reusable chunk of markup in its own `.astro` file.**
`Nav.astro` holds the nav; any page can drop in `<Nav />` and get that markup.
It is the "write it once, use it in nine places" idea, and it is why editing
the nav no longer means editing nine files.

**A *prop* is an argument you pass to a component.** Short for "property", and
it works like an HTML attribute — the difference is that you define which ones
exist. `Nav.astro` declares it accepts `current`, so a page writes
`<Nav current="/about-us/" />`, and inside `Nav.astro` that value is read from
`Astro.props`. Same idea as passing an argument to a function.

```astro
---
// Nav.astro declares what it accepts:
const { current } = Astro.props;
---
<!-- a page passes a value in: -->
<Nav current="/about-us/" />
```

**A *layout* is a component that wraps a whole page,** and a *slot* is the hole
in it where the page's own content goes. `Layout.astro` renders the nav, logo,
background and social links once; each page's content lands where `<slot />`
sits. Pages configure it with props — `title`, `variant`, `contentMax`.

**Content collections** turn `src/content/**/*.md` into structured data. The
*schema* in `src/content.config.ts` is the list of fields an entry must have
and what type each one is; it is checked at build time, so a typo in a
frontmatter field fails the build instead of rendering blank.

**A *directive* is an `is:`-prefixed attribute that changes how Astro treats a
tag.** Two matter here, because in both cases Astro's default is the opposite
of what the original hand-written HTML assumed:

| Directive | Astro's default | Why this repo overrides it |
| --- | --- | --- |
| `<style is:global>` | styles are *scoped* — Astro rewrites the selectors so they only match markup in that same file | page CSS targets markup the *layout* renders, so scoping would stop it matching |
| `<script is:inline>` | scripts are bundled together and may be reordered or moved | the countdown and signature tracker script reads `define:vars` values set at build time and must run inline, in place |

**Assets** imported from `src/assets/` get hashed and rewritten with the
correct base path. Anything in `public/` is copied verbatim instead.

## Images

Images imported from `src/assets/` are resized and re-encoded at build time by
[sharp](https://sharp.pixelplumbing.com/), which ships with Astro. Drop a
full-size photo in and the build produces a web-sized version — the original is
never served.

Use the `<Image>` component rather than a plain `<img>`:

```astro
---
import { Image } from "astro:assets";
import photo from "../assets/rally.jpg";   // a 4000px camera original
---
<Image src={photo} width={800} alt="Students rallying at Queen's Park" />
```

`width` is the size it is *displayed* at. Astro emits a `srcset` — a list of
the same image at several widths — so the browser downloads the one that fits
the device rather than always taking the largest. `alt` is required and the
build fails without it.

Defaults live under `image` in `astro.config.mjs`, so you do not have to pass
format or quality per image. Override them when a specific image needs it:

| Prop | Meaning |
| --- | --- |
| `width` | displayed width in pixels; drives the generated sizes |
| `format` | output encoding — `webp` is a good default, far smaller than PNG or JPEG |
| `quality` | 1–100. 70–80 is usually indistinguishable from the original |
| `loading="eager"` | load immediately; use for anything visible before scrolling |

What this is currently saving:

| Asset | Source | Served |
| --- | --- | --- |
| `background.jpeg` | 2308×3570, 1.7 MB | 1920w webp, 345 KB |
| `logo.png` | 795×790, 314 KB | 280w + 560w webp, 14 KB + 30 KB |

**CSS backgrounds are the one exception.** A `url()` in a stylesheet is
resolved by Vite and never passes through sharp, so it would ship the original
untouched. The page background works around this in `Layout.astro`: `getImage()`
runs the same transform in the frontmatter, and the result is handed to CSS
through the `--background-image` custom property. If you add another
CSS-referenced image, do the same rather than pointing `url()` at `src/assets/`.

## Project structure

```text
src/
  pages/        one .astro file per route
  layouts/      Layout.astro — the frame every page shares
  components/   Nav, SocialLinks, EmbeddedForm
  content/      articles/ and news/ markdown entries
  styles/       main.css (global) + shell.css (inner-page shell)
  assets/       logo + background, hashed at build time
  lib/url.ts    builds internal links from BASE_URL
```

## Adding an article or news update

Add a Markdown file to `src/content/articles/` or `src/content/news/`. The
frontmatter schema is in `src/content.config.ts`; entries with `draft: true`
are excluded from the build. Delete the two `SAMPLE —` files once real content
exists.

```markdown
---
title: "Your title"
type: "Statement"        # articles only
summary: "One-line summary shown on the index."
date: 2026-08-01
link: "https://..."      # articles only, optional
draft: false
---
```

## Deploy targets and the base path

The same source builds for a domain root and for a project subpath. Every
internal link goes through `src/lib/url.ts`, so only `ASTRO_BASE` changes:

| Target | Command |
| --- | --- |
| Domain root | `npm run build` |
| Subpath | `ASTRO_BASE=/onsaa-site/ npm run build` |

`.gitlab-ci.yml` builds preview deploys on non-default branches;
`.github/workflows/deploy.yml` publishes to GitHub Pages from `main`. If the
GitHub deploy is a project site rather than a custom domain, uncomment
`ASTRO_BASE` in that workflow.
