import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// Articles and news were hardcoded placeholder cards in the old HTML. As
// collections, publishing is "add a .md file" rather than "copy a 200-line
// page shell and edit the middle".
const articles = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/articles" }),
  schema: z.object({ 
    title: z.string(),
    /** Shown in the accent-coloured label above the title. */
    type: z.string().default("Article"),
    summary: z.string(),
    date: z.coerce.date(),
    /** External link, if the piece is published elsewhere. */
    link: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const news = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/news" }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    date: z.coerce.date(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { articles, news };
