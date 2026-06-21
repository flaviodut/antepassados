# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Antepassados is a personal genealogy blog (Portuguese, pt-br) for Flávio Dutra, published at https://antepassados.flaviodutra.com.br. It was migrated from Jekyll to Eleventy (see branch `migration-eleventy`); the old Jekyll source files (`_layouts/`, `_sass/`, `_includes/*.html`, `_posts/`, `_category/`, `Gemfile`, `_config.yml`) still exist on disk but are superseded by the `src/` tree and `eleventy.config.js` — don't edit the legacy files, they're slated for removal.

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
- **Custom filters/shortcodes** (all in `eleventy.config.js`): date filters (`longDatePt`, `shortDay`, `shortMonthAbbr`, `shortYear`, `dmyDate`, `xmlSchemaDate`, `rfc822Date`) format dates in Portuguese using Luxon, always normalized to UTC via `toUtcDateTime`. `postImage` shortcode resolves images relative to `src/assets/posts/<post-filename-stem>/` (replaces the old Jekyll `images.html` include). `googleMapsLink` shortcode replaces the old `link-to-google-maps.html` include. `excerpt` filter regex-extracts the first `<p>` for use in feeds/listings.
- **Layout chain**: `layouts/base.njk` (HTML shell, GTM body script gated on `isProduction`, header/footer/vlibras includes) → `layouts/post.njk` / `layouts/category.njk` / `layouts/home.njk` / `layouts/page.njk`. `isProduction` (global data in `eleventy.config.js`) is true only when `CONTEXT` or `NODE_ENV` env var is `production` — relevant for anything that should be suppressed in local/preview builds (GTM, etc).
- **Site-wide data**: `src/_data/site.js` holds title, author, description, social/Disqus/GTM ids, etc., available as `site.*` in all templates.
- **Static passthrough**: `eleventy.config.js` explicitly passthrough-copies `src/assets/{images,posts,js,css}`, plus root-level `_redirects`, `CNAME`, `robots.txt`, `humans.txt`, and the Google site-verification HTML file. Per-post images/attachments live in `src/assets/posts/<post-filename-stem>/` and are referenced via the `postImage` shortcode, not raw `<img>` tags.
- **Feeds/sitemap**: `src/feed.njk` and `src/sitemap.njk` are top-level Eleventy templates (not in `_includes`) that render the RSS feed and sitemap directly from `collections.posts`.
- **Redirects**: `_redirects` (Netlify-style) 301s the old `flaviodutra.com.br/antepassados/*` paths to the current domain — preserve this if changing hosting/deploy setup.
