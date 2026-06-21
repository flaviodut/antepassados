import path from "node:path";
import { DateTime } from "luxon";
import pluginRss from "@11ty/eleventy-plugin-rss";
import Image from "@11ty/eleventy-img";
import reservedCategories from "./src/_data/reservedCategories.js";

const MONTHS_PT = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

const MONTHS_PT_ABBR = [
  "JAN", "FEV", "MAR", "ABR", "MAI", "JUN",
  "JUL", "AGO", "SET", "OUT", "NOV", "DEZ",
];

function toUtcDateTime(date) {
  return DateTime.fromJSDate(new Date(date), { zone: "utc" });
}

// Replica exatamente a normalização de acentos usada hoje em _includes/categories.html
export function categorySlug(tag) {
  return tag
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/ã/g, "a")
    .replace(/á/g, "a")
    .replace(/à/g, "a")
    .replace(/â/g, "a")
    .replace(/é/g, "e")
    .replace(/ê/g, "e")
    .replace(/í/g, "i")
    .replace(/ó/g, "o")
    .replace(/õ/g, "o")
    .replace(/ô/g, "o")
    .replace(/ú/g, "u")
    .replace(/ç/g, "c");
}

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/assets/images");
  eleventyConfig.addPassthroughCopy("src/assets/posts");
  eleventyConfig.addPassthroughCopy("src/assets/js");
  eleventyConfig.addPassthroughCopy("src/assets/css");
  eleventyConfig.addPassthroughCopy("src/CNAME");
  eleventyConfig.addPassthroughCopy("src/_redirects");
  eleventyConfig.addPassthroughCopy("src/robots.txt");
  eleventyConfig.addPassthroughCopy("src/humans.txt");

  eleventyConfig.addPlugin(pluginRss);

  eleventyConfig.addGlobalData("isProduction", () =>
    process.env.CONTEXT === "production" || process.env.NODE_ENV === "production"
  );

  eleventyConfig.addFilter("longDatePt", (date) => {
    const d = toUtcDateTime(date);
    return `${d.day} de ${MONTHS_PT[d.month - 1]} de ${d.year}`;
  });
  eleventyConfig.addFilter("shortDay", (date) => toUtcDateTime(date).day);
  eleventyConfig.addFilter("shortMonthAbbr", (date) => MONTHS_PT_ABBR[toUtcDateTime(date).month - 1]);
  eleventyConfig.addFilter("shortYear", (date) => toUtcDateTime(date).year);
  eleventyConfig.addFilter("dmyDate", (date) => {
    const d = toUtcDateTime(date);
    return `${d.day}/${d.month}/${d.year}`;
  });
  eleventyConfig.addFilter("xmlSchemaDate", (date) => new Date(date).toISOString());
  eleventyConfig.addFilter("categorySlug", categorySlug);
  eleventyConfig.addFilter("excerpt", (html) => {
    const match = (html || "").match(/<p>[\s\S]*?<\/p>/);
    return match ? match[0] : "";
  });

  // Equivalente a {% include images.html name=... caption=... alt=... %} usado dentro dos posts,
  // agora gerando variantes responsivas (webp + formato original) via @11ty/eleventy-img
  eleventyConfig.addAsyncShortcode("postImage", async function (name, opts = {}) {
    const stem = path.basename(this.page.inputPath, path.extname(this.page.inputPath));
    const stats = await Image(`src/assets/posts/${stem}/${name}`, {
      widths: [400, 800, null],
      formats: ["webp", null],
      outputDir: `_site/assets/posts/${stem}/`,
      urlPath: `/assets/posts/${stem}/`,
    });
    const img = Image.generateHTML(stats, {
      alt: opts.alt || "",
      sizes: "(min-width: 800px) 800px, 100vw",
      loading: "lazy",
      decoding: "async",
    });
    if (opts.caption) {
      return `<figure>${img}<figcaption>${opts.caption}</figcaption></figure>`;
    }
    return img;
  });

  // Equivalente a {% include link-to-google-maps.html hash=... name=... %} usado dentro dos posts
  eleventyConfig.addShortcode("googleMapsLink", function (name, hash) {
    if (!hash) return name;
    return `<a href="https://goo.gl/maps/${hash}" title="Visualize a localização de ${name} no Google Maps" target="_blank" rel="nofollow">${name}</a>`;
  });

  // Categorias usadas em posts + categorias "reservadas" sem post ainda, para preservar todas as URLs atuais
  eleventyConfig.addCollection("categoryList", (collectionApi) => {
    const posts = collectionApi.getFilteredByTag("posts");
    const bySlug = new Map();

    for (const post of posts) {
      for (const tag of post.data.categories || []) {
        const slug = categorySlug(tag);
        if (!bySlug.has(slug)) bySlug.set(slug, { tag, slug, posts: [] });
        bySlug.get(slug).posts.push(post);
      }
    }

    for (const tag of reservedCategories) {
      const slug = categorySlug(tag);
      if (!bySlug.has(slug)) bySlug.set(slug, { tag, slug, posts: [] });
    }

    return [...bySlug.values()].sort((a, b) => a.tag.localeCompare(b.tag, "pt"));
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    templateFormats: ["njk", "md", "html"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
}
