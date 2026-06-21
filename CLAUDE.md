# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Antepassados is a personal genealogy blog (Portuguese, pt-br) for Flávio Dutra, published at https://antepassados.flaviodutra.com.br. It was migrated from Jekyll to Eleventy (see branch `migration-eleventy`); the migration is complete and the old Jekyll source (`_layouts/`, `_sass/`, `_includes/*.html`, `_posts/`, `_category/`, `Gemfile`, `_config.yml`, etc.) has been removed — the entire site is now the `src/` tree plus `eleventy.config.js`.

## Commands

```bash
npm install
npm run serve   # eleventy --serve, local dev server with reload
npm run build   # production build, outputs to ./_site
npm run debug   # build with DEBUG=Eleventy* for verbose logs
```

Node version is pinned in `.nvmrc` (25). There is no test suite or linter configured.

## Architecture

- **Engine**: Eleventy 3, configured in `eleventy.config.js`. Input dir `src`, output `_site`, includes `_includes`, data `_data`. Templates are Nunjucks (`.njk`) and Markdown (`.md`, rendered through the Nunjucks engine, so `{{ }}`/`{% %}` work inside post bodies).
- **Posts** (`src/posts/*.md`): permalinks are derived from the filename, not frontmatter — `posts.11tydata.js` parses `YYYY-MM-DD-slug.md` into `/YYYY-MM-DD/slug/` via a regex on `page.inputPath`. All posts get `tags: ["posts"]` and `layout: layouts/post.njk` from that same `.11tydata.js` file.
- **Categories**: a post's `categories` frontmatter is a list of free-text tags (mixed case, e.g. `relato`, `França`, `BIDIER`). `eleventyConfig.addCollection("categoryList", ...)` in `eleventy.config.js` builds the category index by slugifying every tag (`categorySlug()` — lowercases, replaces spaces with `-`, strips Portuguese diacritics) and grouping posts under each slug. `src/_data/reservedCategories.js` lists categories that must keep a live `/categorias/<slug>/` page even with zero posts, to preserve URLs that existed under the old Jekyll `_category/` pages — when adding/renaming categories, check whether this list needs updating. Category pages are generated once via Eleventy pagination over `collections.categoryList` in `src/categoria-pagina.njk` (`size: 1`, alias `category`).
- **Custom filters/shortcodes** (all in `eleventy.config.js`): date filters (`longDatePt`, `shortDay`, `shortMonthAbbr`, `shortYear`, `dmyDate`, `xmlSchemaDate`) format dates in Portuguese using Luxon, always normalized to UTC via `toUtcDateTime`. `absoluteUrl` and `dateToRfc3339` come from the official `@11ty/eleventy-plugin-rss` (registered via `addPlugin`) — `absoluteUrl` requires the base URL as an explicit second argument (`url | absoluteUrl(metadata.url)`), it does not default to the site URL. `postImage` shortcode (async, backed by `@11ty/eleventy-img`) resolves and responsively optimizes images from `src/assets/posts/<post-filename-stem>/<name>` into `webp` + original format at widths `[400, 800, null]`, rendered as a `<picture>` via `Image.generateHTML`. `googleMapsLink` shortcode replaces the old Jekyll `link-to-google-maps.html` include. `excerpt` filter regex-extracts the first `<p>` for use in listings.
- **Layout chain**: `layouts/base.njk` (HTML shell, GTM body script gated on `isProduction`, header/footer/vlibras includes) → `layouts/post.njk` / `layouts/category.njk` / `layouts/home.njk` / `layouts/page.njk`. `isProduction` (global data in `eleventy.config.js`) is true only when `CONTEXT` or `NODE_ENV` env var is `production` — relevant for anything that should be suppressed in local/preview builds (GTM, etc).
- **Site-wide data**: `src/_data/metadata.js` holds title, author, description, social/Disqus/GTM ids, etc., available as `metadata.*` in all templates (named to match the `eleventy-base-blog` convention).
- **Static passthrough**: `eleventy.config.js` passthrough-copies `src/assets/{images,posts,js,css}` plus `src/CNAME`, `src/_redirects`, `src/robots.txt`, `src/humans.txt` (these live inside the input dir now, not at the repo root — `.txt`/extensionless files still need an explicit `addPassthroughCopy` entry each, Eleventy only auto-copies non-template-format files implicitly in some setups, not reliably here). The Google site-verification file (`src/google3cace278ff9af72d.html`) is `.html` so it's a real template instead — it uses a `permalink` frontmatter override (same pattern as `src/404.html`) to force a flat output path instead of the default `/<name>/index.html`. Per-post images referenced via the `postImage` shortcode are optimized on build; other files in a post's asset folder (e.g. a `cover.jpg` used as the `image:` frontmatter for OG/Twitter cards, which must stay a single static file) are still plain passthrough-copied.
- **Feeds/sitemap**: `src/feed.njk` (Atom) and `src/sitemap.njk` are top-level Eleventy templates (not in `_includes`) that render directly from `collections.posts`/`collections.all`, using the RSS plugin's `absoluteUrl`/`dateToRfc3339` filters.
- **Redirects**: `src/_redirects` (Netlify-style) 301s the old `flaviodutra.com.br/antepassados/*` paths to the current domain — preserve this if changing hosting/deploy setup.
