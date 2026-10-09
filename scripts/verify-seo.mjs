#!/usr/bin/env node
/**
 * verify-seo.mjs - mechanical verification of the static export in out/.
 *
 * Usage:  npm run build && npm run verify:seo
 * Env:    VERIFY_SEO_EXPECT_GA_ID=G-XXXX   check 12 expects the gtag loader for
 *                                          that id in out/index.html instead of
 *                                          asserting that analytics is absent.
 * Exit:   1 when any check FAILs, 2 when out/ is missing, 0 otherwise.
 *
 * Checks 15-20 implement the SEO position brief (Oct 2026): one intent per
 * page (titles/H1s), garage sub-service pages, unique city copy (word counts,
 * duplicate sentences, shingle similarity), content rules over visible text,
 * link coverage, placeholders and sitemap freshness.
 *
 * Dependencies: none (node:fs, node:fs/promises, node:path only).
 */
import { readFile, readdir } from "node:fs/promises";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "out");
const SITE = "https://www.jdhomeservices.ca";

const SERVICE_PATHS = [
  "/services/locksmith/",
  "/services/car-lockout/",
  "/services/garage-door-repair-installation/",
  "/services/security-camera-installation/",
];
const HUB_PATH = "/services/garage-door-repair-installation/";
const SPRING_PATH = "/services/garage-door-spring-repair/";
const SUB_SERVICE_PATHS = [
  "/services/garage-door-installation/",
  "/services/garage-door-opener-installation/",
  SPRING_PATH,
];
const AREAS_PATH = "/service-areas/";
const CITY_PATHS = [
  "/service-areas/oshawa/",
  "/service-areas/whitby/",
  "/service-areas/ajax/",
  "/service-areas/pickering/",
  "/service-areas/courtice/",
  "/service-areas/bowmanville/",
];
const CITY_NAMES = ["Oshawa", "Whitby", "Ajax", "Pickering", "Courtice", "Bowmanville"];
const cityName = (p) => p.split("/").filter(Boolean).pop();
const cityLabel = (p) => CITY_NAMES.find((n) => n.toLowerCase() === cityName(p)) ?? cityName(p);
/** Pages the targeting table (brief 6.0) and the content rules (brief 9) apply to. */
const SCOPE_PATHS = ["/", "/services/", ...SERVICE_PATHS, ...SUB_SERVICE_PATHS, AREAS_PATH, ...CITY_PATHS];
/** Pages that get the strict title (<=60) and description (120-155) limits. */
const STRICT_META_PATHS = ["/", ...SERVICE_PATHS, ...SUB_SERVICE_PATHS, AREAS_PATH, ...CITY_PATHS];
const OTHER_SERVICE_PATHS = [
  "/services/security-camera-installation/",
  "/services/locksmith/",
  "/services/car-lockout/",
];
// Guides: discovered from src/content/blog/*.md (slug = file name, category from frontmatter).
const BLOG_DIR = path.join(ROOT, "src", "content", "blog");
const BLOG_POSTS = existsSync(BLOG_DIR)
  ? readdirSync(BLOG_DIR)
      .filter((f) => f.endsWith(".md"))
      .map((f) => {
        const text = readFileSync(path.join(BLOG_DIR, f), "utf8");
        const category = text.match(/^category:\s*(.+)$/m)?.[1].trim();
        const hasFaq = /^## Frequently asked questions\s*$/m.test(text);
        // "### " headings under "## Frequently asked questions" (up to the next "## ").
        const faqSection = text.split(/^## Frequently asked questions\s*$/m)[1]?.split(/^## /m)[0] ?? "";
        const faqQuestions = [...faqSection.matchAll(/^###\s+(.+?)\s*$/gm)].map((m) => m[1]);
        return { slug: f.replace(/\.md$/, ""), category, hasFaq, faqQuestions };
      })
  : [];
// twitter:site is only expected when theme.seo.twitterHandle is set (the business has no X account today).
const TWITTER_HANDLE = (() => {
  const themeSrc = existsSync(path.join(ROOT, "src", "config", "theme.ts"))
    ? readFileSync(path.join(ROOT, "src", "config", "theme.ts"), "utf8")
    : "";
  return themeSrc.match(/twitterHandle:\s*"([^"]*)"/)?.[1] ?? "";
})();
const BLOG_POST_PATHS = BLOG_POSTS.map((p) => `/blog/${p.slug}/`);
const BLOG_CATEGORY_PATHS = [...new Set(BLOG_POSTS.map((p) => `/blog/category/${p.category}/`))];

const TWO_CRUMB_PATHS = [
  "/blog/",
  "/services/",
  "/service-areas/",
  "/about/",
  "/contact/",
  "/privacy-policy/",
];
const EXPECTED_PATHS = [
  "/",
  "/services/",
  ...SERVICE_PATHS,
  ...SUB_SERVICE_PATHS,
  "/service-areas/",
  ...CITY_PATHS,
  "/about/",
  "/contact/",
  "/privacy-policy/",
  "/blog/",
  ...BLOG_CATEGORY_PATHS,
  ...BLOG_POST_PATHS,
];
const EXCLUDED_DIRS = [
  /^_next(\/|$)/,
  /^404(\/|$)/,
  /^admin(\/|$)/,
  /^share(\/|$)/,
  /^lp(\/|$)/, // Google Ads landing pages: noindex on purpose, kept out of the sitemap
  /^_not-found(\/|$)/,
];

// ---------------------------------------------------------------- helpers --

async function walk(dir) {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else files.push(full);
  }
  return files;
}

function decodeEntities(value) {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
}

const ATTR_RE = /(\w[\w:-]*)="([^"]*)"/g;

function parseAttrs(tag) {
  const attrs = {};
  for (const match of tag.matchAll(ATTR_RE)) attrs[match[1]] = decodeEntities(match[2]);
  return attrs;
}

function tagsOf(html, name) {
  const re = new RegExp(`<${name}(?=[\\s/>])[^>]*>`, "gi");
  return [...html.matchAll(re)].map((m) => parseAttrs(m[0]));
}

const metaByName = (html, name) =>
  tagsOf(html, "meta").find((a) => a.name === name)?.content ?? null;
const metaByProperty = (html, property) =>
  tagsOf(html, "meta").find((a) => a.property === property)?.content ?? null;
const countH1 = (html) => (html.match(/<h1[\s>]/gi) ?? []).length;

function titleOf(html) {
  const match = html.match(/<title>([\s\S]*?)<\/title>/i);
  return match ? decodeEntities(match[1]).trim() : null;
}

function jsonLdBlocks(html) {
  const re = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
  return [...html.matchAll(re)].map((m) => {
    try {
      return { data: JSON.parse(m[1]) };
    } catch (error) {
      return { error: error.message };
    }
  });
}

function typeList(node) {
  const type = node?.["@type"];
  if (type == null) return [];
  return Array.isArray(type) ? type : [type];
}

function collectNodes(node, acc = []) {
  if (Array.isArray(node)) {
    for (const item of node) collectNodes(item, acc);
  } else if (node && typeof node === "object") {
    if ("@type" in node) acc.push(node);
    for (const value of Object.values(node)) collectNodes(value, acc);
  }
  return acc;
}

const collectTypes = (node) => new Set(collectNodes(node).flatMap(typeList));
const hasType = (node, type) => typeList(node).includes(type);

function readPng(file) {
  if (!isFile(file)) return { exists: false, valid: false, width: 0, height: 0 };
  const buf = readFileSync(file);
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const valid = buf.length >= 24 && buf.subarray(0, 8).equals(signature);
  return {
    exists: true,
    valid,
    width: valid ? buf.readUInt32BE(16) : 0,
    height: valid ? buf.readUInt32BE(20) : 0,
  };
}

function isFile(file) {
  try {
    return statSync(file).isFile();
  } catch {
    return false;
  }
}

/** Absolute site URL -> local path under out/ (query/hash stripped), or null. */
function localFileForUrl(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (parsed.origin !== SITE) return null;
  return path.join(OUT, decodeURIComponent(parsed.pathname));
}

function visibleText(html) {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/\s+/g, " ")
    .trim();
}

function mainHtml(html) {
  const start = html.search(/<main[\s>]/i);
  const end = html.indexOf("</main>");
  return start >= 0 && end > start ? html.slice(start, end) : html;
}

function paragraphsOf(html) {
  return [...html.matchAll(/<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/gi)].map((m) =>
    visibleText(m[1]),
  );
}

const count = (haystack, needle) => haystack.split(needle).length - 1;
const rel = (file) => path.relative(ROOT, file);

/** Text of the first <h1>, or null. */
function h1Of(html) {
  const match = html.match(/<h1(?:\s[^>]*)?>([\s\S]*?)<\/h1>/i);
  return match ? visibleText(match[1]) : null;
}

/** Decoded href values of every <a> on the page (or of the given fragment). */
function anchorHrefs(html) {
  return [...html.matchAll(/<a\s[^>]*?href="([^"]*)"/gi)].map((m) => decodeEntities(m[1]));
}

/** Slice of html from the first element with the given attribute="value" to its closing </tagName>. */
function elementHtml(html, tagName, attrRe) {
  const re = new RegExp(`<${tagName}(?=[\\s>])[^>]*>`, "gi");
  for (const m of html.matchAll(re)) {
    if (!attrRe || attrRe.test(m[0])) {
      const end = html.indexOf(`</${tagName}>`, m.index);
      return end > m.index ? html.slice(m.index, end) : html.slice(m.index);
    }
  }
  return "";
}

const BLOCK_TAGS =
  "p|li|h[1-6]|summary|details|div|section|article|aside|nav|ul|ol|td|th|dt|dd|blockquote|figcaption|label|button|tr|table|footer|header|main|form";

/**
 * Visible text split into "sentences": a break at every block boundary and
 * after sentence punctuation that is followed by a capital letter, quote or
 * bracket. Used for word counts, duplicate copy and similarity checks.
 */
function sentencesOf(html) {
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(new RegExp(`<\\/?(?:${BLOCK_TAGS})(?=[\\s>/])[^>]*>`, "gi"), "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ");
  return decodeEntities(text)
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .flatMap((line) => line.split(/(?<=[.?!])\s+(?=[A-Z"'(])/))
    .map((s) => s.trim())
    .filter(Boolean);
}

const wordCount = (text) => (text.match(/[A-Za-z0-9][A-Za-z0-9'-]*/g) ?? []).length;
const normalizeQuestion = (q) => q.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Every object carrying an "@id" (typed nodes and bare references). */
function collectIds(node, acc = []) {
  if (Array.isArray(node)) {
    for (const item of node) collectIds(item, acc);
  } else if (node && typeof node === "object") {
    if ("@id" in node) acc.push({ id: String(node["@id"]), types: typeList(node) });
    for (const value of Object.values(node)) collectIds(value, acc);
  }
  return acc;
}

/** 5-word shingles of a token list. */
function shingles(tokens, size = 5) {
  const set = new Set();
  for (let i = 0; i + size <= tokens.length; i += 1) set.add(tokens.slice(i, i + size).join(" "));
  return set;
}

function jaccard(a, b) {
  if (!a.size && !b.size) return 0;
  let inter = 0;
  for (const s of a) if (b.has(s)) inter += 1;
  return inter / (a.size + b.size - inter);
}

// ---------------------------------------------------------------- results --

const results = [];
function add(id, check, status, detail = "") {
  results.push({ id, check, status, detail });
}
function verdict(id, check, fails, warns = [], okDetail = "ok") {
  if (fails.length) add(id, check, "FAIL", fails.join("; "));
  else if (warns.length) add(id, check, "WARN", warns.join("; "));
  else add(id, check, "PASS", okDetail);
}

// ----------------------------------------------------------------- checks --

async function main() {
  if (!existsSync(OUT)) {
    console.error("out/ not found - run `npm run build` first.");
    process.exit(2);
  }

  const allOutFiles = await walk(OUT);
  const htmlFiles = allOutFiles.filter((f) => f.endsWith(".html"));
  const htmlText = new Map();
  for (const file of htmlFiles) htmlText.set(file, await readFile(file, "utf8"));

  // P: public pages
  const pages = new Map();
  for (const file of htmlFiles) {
    if (path.basename(file) !== "index.html") continue;
    const relDir = path.relative(OUT, path.dirname(file)).split(path.sep).join("/");
    if (EXCLUDED_DIRS.some((re) => re.test(relDir))) continue;
    pages.set(relDir === "" ? "/" : `/${relDir}/`, { file, html: htmlText.get(file) });
  }
  const pageEntries = [...pages.entries()];

  // ---- 1. Routes
  {
    const sitemapFile = path.join(OUT, "sitemap.xml");
    const xml = isFile(sitemapFile) ? readFileSync(sitemapFile, "utf8") : "";
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) =>
      decodeEntities(m[1].trim()),
    );
    const E = EXPECTED_PATHS.map((p) => SITE + p).sort();
    const P = [...pages.keys()].map((p) => SITE + p).sort();
    const S = [...locs].sort();
    const missing = (from, to) => from.filter((x) => !to.includes(x));
    const fails = [];
    if (!xml) fails.push("out/sitemap.xml missing");
    const pMissing = missing(E, P);
    const pExtra = missing(P, E);
    const sMissing = missing(E, S);
    const sExtra = missing(S, E);
    if (pMissing.length) fails.push(`P missing: ${pMissing.join(", ")}`);
    if (pExtra.length) fails.push(`P extra: ${pExtra.join(", ")}`);
    if (sMissing.length) fails.push(`S missing: ${sMissing.join(", ")}`);
    if (sExtra.length) fails.push(`S extra: ${sExtra.join(", ")}`);
    if (S.length !== new Set(S).size) fails.push("duplicate <loc> entries");
    verdict("1a", "Routes: E == P == S", fails, [], `${E.length} expected = ${P.length} built = ${S.length} in sitemap`);

    const hygiene = [];
    for (const loc of locs) {
      if (/\/(admin|share|lp)\//.test(loc)) hygiene.push(`sitemap lists ${loc}`);
      if (!loc.startsWith(`${SITE}/`)) hygiene.push(`bad prefix: ${loc}`);
      if (!loc.endsWith("/")) hygiene.push(`no trailing slash: ${loc}`);
    }
    const urlBlocks = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)];
    const noLastmod = urlBlocks.filter((m) => !/<lastmod>[^<]+<\/lastmod>/.test(m[1]));
    if (noLastmod.length) hygiene.push(`${noLastmod.length} <url> entries lack <lastmod>`);
    if (urlBlocks.length !== locs.length) hygiene.push("<url>/<loc> count mismatch");
    const rawAmp = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#\d+;)/g);
    if (rawAmp) hygiene.push(`${rawAmp.length} unescaped "&" (invalid XML)`);
    verdict("1b", "Sitemap hygiene (no admin/share, host+slash, lastmod, valid XML)", hygiene, [], `${locs.length} entries`);
  }

  // ---- 2. Per-page metadata
  {
    const f = {
      h1: [], title: [], desc: [], canonical: [], og: [], ogImage: [], robots: [],
      lang: [], theme: [], skip: [],
    };
    const w = { title: [], desc: [] };
    const titles = new Map();
    const descs = new Map();
    for (const [p, { html }] of pageEntries) {
      const h1s = countH1(html);
      if (h1s !== 1) f.h1.push(`${p} has ${h1s} <h1>`);

      // Service, sub-service, city, areas-hub and home pages get the strict limits
      // from the targeting table (title <= 60, description 120-155); other pages keep
      // the older tolerances (title <= 70 warns above 60, description 50-160).
      const strict = STRICT_META_PATHS.includes(p);
      const title = titleOf(html);
      if (!title) f.title.push(`${p} missing <title>`);
      else {
        if (title.length > (strict ? 60 : 70)) f.title.push(`${p} title ${title.length} chars`);
        else if (title.length > 60) w.title.push(`${p} title ${title.length} chars`);
        titles.set(title, [...(titles.get(title) ?? []), p]);
      }

      const desc = metaByName(html, "description");
      if (!desc) f.desc.push(`${p} missing description`);
      else {
        const [min, max] = strict ? [120, 155] : [50, 160];
        if (desc.length < min || desc.length > max) f.desc.push(`${p} description ${desc.length} chars`);
        else if (desc.length > 155) w.desc.push(`${p} description ${desc.length} chars`);
        descs.set(desc, [...(descs.get(desc) ?? []), p]);
      }

      const canonical = tagsOf(html, "link").find((a) => a.rel === "canonical")?.href ?? null;
      if (canonical !== SITE + p) f.canonical.push(`${p} canonical=${canonical}`);

      const og = {
        title: metaByProperty(html, "og:title"),
        description: metaByProperty(html, "og:description"),
        url: metaByProperty(html, "og:url"),
        image: metaByProperty(html, "og:image"),
        locale: metaByProperty(html, "og:locale"),
        siteName: metaByProperty(html, "og:site_name"),
      };
      const twitterCard = metaByName(html, "twitter:card");
      const twitterSite = metaByName(html, "twitter:site");
      if (!og.title) f.og.push(`${p} og:title missing`);
      if (!og.description) f.og.push(`${p} og:description missing`);
      if (og.url !== canonical) f.og.push(`${p} og:url=${og.url} != canonical`);
      if (!og.image) f.og.push(`${p} og:image missing`);
      if (og.locale !== "en_CA") f.og.push(`${p} og:locale=${og.locale}`);
      if (!og.siteName) f.og.push(`${p} og:site_name missing`);
      if (twitterCard !== "summary_large_image") f.og.push(`${p} twitter:card=${twitterCard}`);
      if (TWITTER_HANDLE && !twitterSite) f.og.push(`${p} twitter:site missing`);

      if (og.image) {
        const local = localFileForUrl(og.image);
        if (!local) f.ogImage.push(`${p} og:image not on site host: ${og.image}`);
        else {
          const png = readPng(local);
          if (!png.exists) f.ogImage.push(`${p} og:image file missing: ${rel(local)}`);
          else if (!png.valid) f.ogImage.push(`${p} og:image not a PNG: ${rel(local)}`);
        }
      }

      const robots = metaByName(html, "robots");
      if (robots && /noindex/i.test(robots)) f.robots.push(`${p} robots=${robots}`);
      if (!/<html[^>]*\slang="en-CA"/.test(html)) f.lang.push(`${p} html lang != en-CA`);
      const themeColor = metaByName(html, "theme-color");
      if (themeColor !== "#0E2A4D") f.theme.push(`${p} theme-color=${themeColor}`);
      if (!html.includes('href="#main"')) f.skip.push(`${p} lacks href="#main"`);
      if (!html.includes('id="main"')) f.skip.push(`${p} lacks id="main"`);
    }
    for (const [title, ps] of titles) if (ps.length > 1) f.title.push(`duplicate title "${title}" on ${ps.join(", ")}`);
    for (const [, ps] of descs) if (ps.length > 1) f.desc.push(`duplicate description on ${ps.join(", ")}`);

    const n = pageEntries.length;
    verdict("2a", "Exactly one <h1> per page", f.h1, [], `${n} pages`);
    verdict("2b", "<title> non-empty, <=60 chars (strict on service/city/areas/home), unique", f.title, w.title, `${n} unique titles`);
    verdict("2c", "meta description 120-155 chars (strict on service/city/areas/home), unique", f.desc, w.desc, `${n} unique descriptions`);
    verdict("2d", "Canonical === site + path", f.canonical, [], `${n} pages`);
    verdict("2e", "OpenGraph + Twitter tags", f.og, [], `${n} pages`);
    verdict("2f", "og:image on site host and maps to a PNG in out/", f.ogImage, [], `${n} pages`);
    verdict("2g", "No noindex on public pages", f.robots, [], `${n} pages`);
    verdict("2h", '<html lang="en-CA">', f.lang, [], `${n} pages`);
    verdict("2i", "theme-color #0E2A4D", f.theme, [], `${n} pages`);
    verdict("2j", 'Skip link href="#main" + id="main"', f.skip, [], `${n} pages`);
  }

  // ---- 3. JSON-LD
  {
    const parseFails = [];
    const blocksByFile = new Map();
    for (const [file, html] of htmlText) {
      const blocks = jsonLdBlocks(html);
      blocksByFile.set(file, blocks);
      for (const b of blocks) if (b.error) parseFails.push(`${rel(file)}: ${b.error}`);
    }
    const totalBlocks = [...blocksByFile.values()].reduce((a, b) => a + b.length, 0);
    verdict("3a", "All JSON-LD blocks parse", parseFails, [], `${totalBlocks} blocks in ${htmlFiles.length} HTML files`);

    const nodesOf = (p) =>
      blocksByFile.get(pages.get(p).file).flatMap((b) => (b.data ? collectNodes(b.data) : []));

    const siteFails = [];
    const locksmithFails = [];
    const websiteFails = [];
    for (const [p] of pageEntries) {
      const nodes = nodesOf(p);
      const types = new Set(nodes.flatMap(typeList));
      if (!types.has("Locksmith")) siteFails.push(`${p} lacks Locksmith`);
      if (!types.has("WebSite")) siteFails.push(`${p} lacks WebSite`);

      const biz = nodes.find((node) => hasType(node, "Locksmith"));
      if (biz) {
        const bad = (msg) => locksmithFails.push(`${p}: ${msg}`);
        if (!String(biz["@id"] ?? "").endsWith("/#business")) bad(`@id=${biz["@id"]}`);
        if (biz.address?.addressLocality !== "Oshawa") bad(`addressLocality=${biz.address?.addressLocality}`);
        if (biz.address && "streetAddress" in biz.address) bad("address has streetAddress");
        if (typeof biz.geo?.latitude !== "number" || typeof biz.geo?.longitude !== "number") bad("geo latitude/longitude not numeric");
        if (!Array.isArray(biz.openingHoursSpecification) || biz.openingHoursSpecification.length !== 1) bad(`openingHoursSpecification length=${biz.openingHoursSpecification?.length}`);
        const areas = Array.isArray(biz.areaServed) ? biz.areaServed : [];
        const names = areas.map((a) => (typeof a === "string" ? a : a?.name)).filter(Boolean);
        if (areas.length !== 15 || new Set(names).size !== 15) bad(`areaServed has ${areas.length} entries / ${new Set(names).size} unique names`);
        if (!Array.isArray(biz.sameAs) || biz.sameAs.length < 2) bad(`sameAs length=${biz.sameAs?.length}`);
        else for (const u of biz.sameAs) if (!/^https:\/\//.test(String(u))) bad(`sameAs entry not https: ${u}`);
        if ("priceRange" in biz) bad("priceRange present");
        if (!Array.isArray(biz.knowsAbout) || biz.knowsAbout.length < 7) bad(`knowsAbout length=${biz.knowsAbout?.length}`);
        for (const key of ["image", "logo"]) {
          const local = biz[key] ? localFileForUrl(biz[key]) : null;
          if (!local || !isFile(local)) bad(`${key}=${biz[key]} does not map to a file in out/`);
        }
      }
      const site = nodes.find((node) => hasType(node, "WebSite"));
      if (site && !String(site.publisher?.["@id"] ?? "").endsWith("/#business")) {
        websiteFails.push(`${p}: WebSite.publisher.@id=${site.publisher?.["@id"]}`);
      }
    }
    verdict("3b", "Every public page has Locksmith + WebSite", siteFails, [], `${pageEntries.length} pages`);
    verdict("3c", "Locksmith node (id, address, geo, hours, areaServed, sameAs, image/logo)", locksmithFails, [], "identical valid node on every page");
    verdict("3d", "WebSite.publisher -> /#business", websiteFails, [], `${pageEntries.length} pages`);

    const serviceFails = [];
    for (const p of SERVICE_PATHS) {
      if (!pages.has(p)) { serviceFails.push(`${p} not built`); continue; }
      const nodes = nodesOf(p);
      const service = nodes.find((node) => hasType(node, "Service") && node["@id"] === `${SITE}${p}#service`);
      if (!service) serviceFails.push(`${p}: no Service with @id ${SITE}${p}#service`);
      else if (!String(service.provider?.["@id"] ?? "").endsWith("/#business")) serviceFails.push(`${p}: Service.provider.@id=${service.provider?.["@id"]}`);
      const faq = nodes.find((node) => hasType(node, "FAQPage"));
      if (!faq) serviceFails.push(`${p}: no FAQPage`);
      else {
        const questions = (Array.isArray(faq.mainEntity) ? faq.mainEntity : []).filter((q) => hasType(q, "Question"));
        if (questions.length < 5) serviceFails.push(`${p}: FAQPage has ${questions.length} Questions`);
        const noAnswer = questions.filter((q) => typeof q.acceptedAnswer?.text !== "string" || !q.acceptedAnswer.text.trim());
        if (noAnswer.length) serviceFails.push(`${p}: ${noAnswer.length} Questions lack acceptedAnswer.text`);
      }
      const crumbs = nodes.find((node) => hasType(node, "BreadcrumbList"));
      const items = crumbs?.itemListElement?.length ?? 0;
      if (items !== 3) serviceFails.push(`${p}: BreadcrumbList has ${items} items`);
    }
    verdict("3e", "Service pages: Service + FAQPage(>=5) + BreadcrumbList(3)", serviceFails, [], `${SERVICE_PATHS.length} pages`);

    // Sub-service pages (brief 6.A / 6.D)
    const subFails = [];
    const hubServiceId = `${SITE}${HUB_PATH}#service`;
    for (const p of SUB_SERVICE_PATHS) {
      if (!pages.has(p)) { subFails.push(`${p} not built`); continue; }
      const nodes = nodesOf(p);
      const bad = (msg) => subFails.push(`${p}: ${msg}`);
      const service = nodes.find((node) => hasType(node, "Service") && node["@id"] === `${SITE}${p}#service`);
      if (!service) bad(`no Service with @id ${SITE}${p}#service`);
      else {
        if (!String(service.provider?.["@id"] ?? "").endsWith("/#business")) bad(`Service.provider.@id=${service.provider?.["@id"]}`);
        if (service.isRelatedTo?.["@id"] !== hubServiceId) bad(`Service.isRelatedTo.@id=${service.isRelatedTo?.["@id"]}`);
        if ("hoursAvailable" in service) bad("Service has hoursAvailable");
        for (const key of ["offers", "priceRange", "aggregateRating", "review"]) if (key in service) bad(`Service has ${key}`);
        if (!service.name || !service.description || service.url !== `${SITE}${p}`) bad("Service name/description/url incomplete");
      }
      const faq = nodes.find((node) => hasType(node, "FAQPage"));
      if (!faq) bad("no FAQPage");
      const crumbs = nodes.find((node) => hasType(node, "BreadcrumbList"));
      const items = Array.isArray(crumbs?.itemListElement) ? crumbs.itemListElement : [];
      if (items.length !== 4) bad(`BreadcrumbList has ${items.length} items`);
      else {
        const itemUrl = (i) => (typeof i.item === "string" ? i.item : (i.item?.["@id"] ?? i.item?.url ?? i.item));
        if (itemUrl(items[2]) !== `${SITE}${HUB_PATH}`) bad(`BreadcrumbList item[2]=${itemUrl(items[2])} (expected hub)`);
        if (itemUrl(items[3]) !== `${SITE}${p}`) bad(`BreadcrumbList item[3]=${itemUrl(items[3])} (expected page URL)`);
      }
    }
    verdict("3h", "Sub-service pages: Service(@id, provider, isRelatedTo=hub, no hours) + FAQPage + BreadcrumbList(4: hub, page)", subFails, [], `${SUB_SERVICE_PATHS.length} pages`);

    // Hub Service node lists the three sub-services in hasOfferCatalog
    const hubFails = [];
    if (!pages.has(HUB_PATH)) hubFails.push(`${HUB_PATH} not built`);
    else {
      const hub = nodesOf(HUB_PATH).find((node) => hasType(node, "Service") && node["@id"] === hubServiceId);
      const offered = (hub?.hasOfferCatalog?.itemListElement ?? []).map((o) => o?.itemOffered?.["@id"]).filter(Boolean);
      for (const p of SUB_SERVICE_PATHS) if (!offered.includes(`${SITE}${p}#service`)) hubFails.push(`hub hasOfferCatalog lacks ${SITE}${p}#service`);
      if (offered.length !== SUB_SERVICE_PATHS.length) hubFails.push(`hub hasOfferCatalog has ${offered.length} offers`);
      if (hub && "hoursAvailable" in hub) hubFails.push("hub Service has hoursAvailable");
    }
    verdict("3i", "Hub Service.hasOfferCatalog lists exactly the three sub-service @ids", hubFails, [], "3 offers");

    // Graph hygiene on every page: @id prefix, @id/@type conflicts, one FAQPage / BreadcrumbList / business node
    const graphFails = [];
    for (const [p, { html, file }] of pageEntries) {
      const bad = (msg) => graphFails.push(`${p}: ${msg}`);
      const blocks = blocksByFile.get(file).filter((b) => b.data).map((b) => b.data);
      const ids = blocks.flatMap((b) => collectIds(b));
      for (const { id } of ids) if (!id.startsWith(SITE)) bad(`@id does not start with site: ${id}`);
      const typesById = new Map();
      for (const { id, types } of ids) {
        if (!types.length) continue;
        const key = [...types].sort().join("+");
        const seen = typesById.get(id);
        if (seen && seen !== key) bad(`@id ${id} used as ${seen} and ${key}`);
        typesById.set(id, seen ?? key);
      }
      const nodes = nodesOf(p);
      const faqPages = nodes.filter((n) => hasType(n, "FAQPage")).length;
      const crumbLists = nodes.filter((n) => hasType(n, "BreadcrumbList")).length;
      if (faqPages > 1) bad(`${faqPages} FAQPage nodes`);
      if (crumbLists > 1) bad(`${crumbLists} BreadcrumbList nodes`);
      const ldText = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]).join("\n");
      const bizCount = count(ldText, '"HomeAndConstructionBusiness"');
      if (bizCount !== 1) bad(`"HomeAndConstructionBusiness" appears ${bizCount}x in JSON-LD`);
      // Visible breadcrumb <li> count must equal the JSON-LD item count.
      const crumbNav = elementHtml(html, "nav", /aria-label="Breadcrumb"/i);
      const visibleCrumbs = (crumbNav.match(/<li[\s>]/gi) ?? []).length;
      const ldCrumbs = nodes.find((n) => hasType(n, "BreadcrumbList"))?.itemListElement?.length ?? 0;
      if (visibleCrumbs !== ldCrumbs) bad(`visible breadcrumbs ${visibleCrumbs} != JSON-LD items ${ldCrumbs}`);
    }
    verdict("3j", "Graph hygiene: @id prefix, no @id/@type conflicts, <=1 FAQPage/BreadcrumbList, one business node, visible crumbs == JSON-LD", graphFails, [], `${pageEntries.length} pages`);

    // FAQ parity: JSON-LD Question count == <summary> count in <main>, every Question name visible verbatim
    const faqFails = [];
    const minQuestions = (p) => (SUB_SERVICE_PATHS.includes(p) ? [5, 5] : SERVICE_PATHS.includes(p) ? [5, Infinity] : CITY_PATHS.includes(p) ? [4, Infinity] : [0, Infinity]);
    for (const p of [...SERVICE_PATHS, ...SUB_SERVICE_PATHS, ...CITY_PATHS, ...BLOG_POST_PATHS]) {
      const page = pages.get(p);
      if (!page) { faqFails.push(`${p} not built`); continue; }
      const main = mainHtml(page.html);
      const mainText = visibleText(main);
      const faq = nodesOf(p).find((n) => hasType(n, "FAQPage"));
      const questions = (Array.isArray(faq?.mainEntity) ? faq.mainEntity : []).filter((q) => hasType(q, "Question"));
      const summaries = (main.match(/<summary[\s>]/gi) ?? []).length;
      const [min, max] = minQuestions(p);
      if (questions.length < min || questions.length > max) faqFails.push(`${p}: ${questions.length} Questions (expected ${min === max ? min : `>=${min}`})`);
      if (!faq && !summaries) continue; // guide without a FAQ section
      if (questions.length !== summaries) faqFails.push(`${p}: ${questions.length} JSON-LD Questions vs ${summaries} <summary> in <main>`);
      for (const q of questions) {
        const name = String(q.name ?? "").replace(/\s+/g, " ").trim();
        if (!name || !mainText.includes(name)) faqFails.push(`${p}: Question not visible verbatim: "${name.slice(0, 60)}"`);
      }
    }
    verdict("3k", "FAQ parity: Questions (>=5 service, 5 sub, >=4 city) == <summary> count, names visible verbatim", faqFails, [], `${SERVICE_PATHS.length + SUB_SERVICE_PATHS.length + CITY_PATHS.length} pages + ${BLOG_POST_PATHS.length} guides`);

    const crumbFails = [];
    const expectCrumbs = (p, expected) => {
      if (!pages.has(p)) { crumbFails.push(`${p} not built`); return; }
      const lists = nodesOf(p).filter((node) => hasType(node, "BreadcrumbList"));
      if (expected === 0) {
        if (lists.length) crumbFails.push(`${p} has BreadcrumbList`);
        return;
      }
      const items = lists[0]?.itemListElement?.length ?? 0;
      if (lists.length !== 1 || items !== expected) crumbFails.push(`${p}: ${lists.length} BreadcrumbList(s), ${items} items (expected ${expected})`);
    };
    for (const p of CITY_PATHS) expectCrumbs(p, 3);
    for (const p of SUB_SERVICE_PATHS) expectCrumbs(p, 4);
    for (const p of [...BLOG_CATEGORY_PATHS, ...BLOG_POST_PATHS]) expectCrumbs(p, 3);
    for (const p of TWO_CRUMB_PATHS) expectCrumbs(p, 2);
    expectCrumbs("/", 0);
    verdict("3f", "BreadcrumbList counts (sub-services 4, cities/guides 3, hubs 2, home none)", crumbFails, [], `${CITY_PATHS.length + SUB_SERVICE_PATHS.length + TWO_CRUMB_PATHS.length + BLOG_CATEGORY_PATHS.length + BLOG_POST_PATHS.length + 1} pages`);

    const articleFails = [];
    for (const post of BLOG_POSTS) {
      const p = `/blog/${post.slug}/`;
      if (!pages.has(p)) { articleFails.push(`${p} not built`); continue; }
      const nodes = nodesOf(p);
      const article = nodes.find((node) => hasType(node, "BlogPosting"));
      if (!article) { articleFails.push(`${p}: no BlogPosting`); continue; }
      for (const key of ["headline", "description", "datePublished", "dateModified", "image", "url"]) {
        if (!article[key]) articleFails.push(`${p}: BlogPosting.${key} missing`);
      }
      if (article.url !== SITE + p) articleFails.push(`${p}: BlogPosting.url=${article.url}`);
      if (!String(article.publisher?.["@id"] ?? "").endsWith("/#business")) articleFails.push(`${p}: publisher.@id=${article.publisher?.["@id"]}`);
      if (String(article.headline).length > 110) articleFails.push(`${p}: headline over 110 chars`);
      const faq = nodes.find((node) => hasType(node, "FAQPage"));
      if (post.hasFaq && !faq) articleFails.push(`${p}: FAQ section but no FAQPage`);
      const ogType = metaByProperty(pages.get(p).html, "og:type");
      if (ogType !== "article") articleFails.push(`${p}: og:type=${ogType}`);
    }
    verdict("3g", "Guides: BlogPosting (+FAQPage) and og:type=article", articleFails, [], `${BLOG_POSTS.length} guides`);

    const ratingFails = [];
    for (const [file, blocks] of blocksByFile) {
      for (const b of blocks) {
        if (!b.data) continue;
        const types = collectTypes(b.data);
        if (types.has("AggregateRating") || types.has("Review")) ratingFails.push(`${rel(file)} JSON-LD has AggregateRating/Review`);
      }
    }
    const textExt = /\.(html|txt|xml|js|css|json|svg)$/;
    for (const file of allOutFiles.filter((f) => textExt.test(f))) {
      const text = readFileSync(file, "utf8");
      if (text.includes("AggregateRating")) ratingFails.push(`${rel(file)} contains "AggregateRating"`);
      if (/"@type"\s*:\s*"Review"/.test(text)) ratingFails.push(`${rel(file)} contains @type Review`);
    }
    verdict("3g", "No AggregateRating / Review anywhere in out/", ratingFails, [], "scanned JSON-LD + all text files");
  }

  // ---- 4. Heading order
  {
    const fails = [];
    for (const [p, { html }] of pageEntries) {
      const levels = [...html.matchAll(/<h([1-6])(?=[\s>])/gi)].map((m) => Number(m[1]));
      for (let i = 1; i < levels.length; i += 1) {
        if (levels[i] > levels[i - 1] + 1) fails.push(`${p}: h${levels[i - 1]} -> h${levels[i]}`);
      }
      if (p === "/contact/" && (html.match(/<h4[\s>]/gi) ?? []).length) fails.push("/contact/ contains <h4>");
    }
    verdict("4", "Heading levels never skip; /contact/ has no <h4>", fails, [], `${pageEntries.length} pages`);
  }

  // ---- 5. Internal links
  {
    const fails = [];
    const warns = new Set();
    for (const [p, { html }] of pageEntries) {
      const hrefs = [...html.matchAll(/href="([^"]*)"/g)].map((m) => decodeEntities(m[1]));
      for (const href of hrefs) {
        if (!href.startsWith("/") || href.startsWith("//") || href.startsWith("/_next/")) continue;
        const target = href.replace(/[#?].*$/, "");
        if (target === "") continue; // "#fragment"-only after stripping is not possible here, "/" stays "/"
        const asPage = path.join(OUT, target, "index.html");
        const asFile = path.join(OUT, target);
        if (target.endsWith("/")) {
          if (!isFile(asPage)) fails.push(`${p} -> ${href} (no ${rel(asPage)})`);
        } else if (isFile(asFile)) {
          // asset such as /og-image.png, /images/..., /favicon.ico
        } else if (isFile(asPage)) {
          warns.add(`${p} -> ${href} lacks trailing slash`);
        } else {
          fails.push(`${p} -> ${href} unresolved`);
        }
      }
    }
    const home = pages.get("/")?.html ?? "";
    const hashLinks = count(home, 'href="/services#');
    if (hashLinks) fails.push(`out/index.html has ${hashLinks} href="/services#..."`);
    verdict("5", "Internal hrefs resolve; no /services# links on home", fails, [...warns], "all internal hrefs resolve with trailing slashes");
  }

  // ---- 6. Noindex
  {
    const fails = [];
    const mustNoindex = htmlFiles.filter((f) => {
      const r = path.relative(OUT, f).split(path.sep).join("/");
      return (
        r === "share/index.html" ||
        ((r.startsWith("admin/") || r.startsWith("lp/")) && r.endsWith("/index.html"))
      );
    });
    for (const file of mustNoindex) {
      const robots = metaByName(htmlText.get(file), "robots");
      if (!robots || !/noindex/i.test(robots)) fails.push(`${rel(file)} robots=${robots}`);
    }
    if (!mustNoindex.some((f) => f.endsWith(`share${path.sep}index.html`))) fails.push("out/share/index.html missing");
    for (const [p, { html }] of pageEntries) {
      const robots = metaByName(html, "robots");
      if (robots && /noindex/i.test(robots)) fails.push(`${p} is noindex`);
    }
    verdict("6", "noindex on share/, admin/** and lp/**, never on public pages", fails, [], `${mustNoindex.length} private pages noindex`);
  }

  // ---- 7. robots.txt
  {
    const file = path.join(OUT, "robots.txt");
    const text = isFile(file) ? readFileSync(file, "utf8") : "";
    const fails = [];
    if (!text) fails.push("out/robots.txt missing");
    const rules = [
      ["User-Agent: *", /^user-agent:\s*\*\s*$/im],
      ["Allow: /", /^allow:\s*\/\s*$/im],
      ["Disallow: /admin/", /^disallow:\s*\/admin\/\s*$/im],
      ["Disallow: /share/", /^disallow:\s*\/share\/\s*$/im],
      ["Sitemap: https://www.jdhomeservices.ca/sitemap.xml", /^sitemap:\s*https:\/\/www\.jdhomeservices\.ca\/sitemap\.xml\s*$/im],
    ];
    for (const [label, re] of rules) if (!re.test(text)) fails.push(`missing "${label}"`);
    verdict("7", "robots.txt directives", fails, [], "all 5 directives present");
  }

  // ---- 8. Assets
  {
    const fails = [];
    const og = readPng(path.join(OUT, "og-image.png"));
    if (!og.exists) fails.push("out/og-image.png missing");
    else if (!og.valid) fails.push("out/og-image.png is not a valid PNG");
    else if (og.width !== 1200 || og.height !== 630) fails.push(`out/og-image.png is ${og.width}x${og.height}`);
    if (!isFile(path.join(OUT, "images", "logo.png"))) fails.push("out/images/logo.png missing");
    const cnameFile = path.join(OUT, "CNAME");
    const cname = isFile(cnameFile) ? readFileSync(cnameFile, "utf8").trim() : null;
    if (cname !== "www.jdhomeservices.ca") fails.push(`out/CNAME=${JSON.stringify(cname)}`);
    verdict("8", "og-image.png 1200x630 PNG, images/logo.png, CNAME", fails, [], `og-image ${og.width}x${og.height}, CNAME ok`);
  }

  // ---- 9. Stale references
  {
    const fails = [];
    const cssFiles = allOutFiles.filter((f) => f.endsWith(".css") && f.startsWith(path.join(OUT, "_next", "static")));
    const needles = ["fonts.googleapis.com", "/images/og-image.jpg", "logo.svg", "logo-white.svg", "logo-icon"];
    for (const file of [...htmlFiles, ...cssFiles]) {
      const text = htmlText.get(file) ?? readFileSync(file, "utf8");
      for (const needle of needles) {
        const hits = count(text, needle);
        if (hits) fails.push(`${rel(file)}: ${hits}x "${needle}"`);
      }
    }
    for (const file of cssFiles) {
      const css = readFileSync(file, "utf8");
      const nextDir = path.join(OUT, "_next") + path.sep;
      for (const block of css.matchAll(/@font-face\s*\{([^}]*)\}/g)) {
        for (const url of block[1].matchAll(/url\((['"]?)([^)'"]+)\1\)/g)) {
          const target = url[2];
          if (/^(?:data:|https?:|\/\/)/i.test(target)) {
            fails.push(`${rel(file)}: external font url ${target}`);
            continue;
          }
          const clean = target.replace(/[#?].*$/, "");
          const resolved = clean.startsWith("/")
            ? path.join(OUT, clean)
            : path.resolve(path.dirname(file), clean);
          if (!resolved.startsWith(nextDir)) fails.push(`${rel(file)}: font url ${target} resolves outside /_next/`);
          else if (!isFile(resolved)) fails.push(`${rel(file)}: font url ${target} -> missing ${rel(resolved)}`);
        }
      }
    }
    verdict("9", "No stale asset/font references in HTML + CSS", fails, [], `${htmlFiles.length} HTML + ${cssFiles.length} CSS scanned`);
  }

  // ---- 10. Deleted assets absent
  {
    const gone = ["file.svg", "globe.svg", "next.svg", "vercel.svg", "window.svg", "images/partners/fedex.svg"];
    const fails = gone.filter((f) => existsSync(path.join(OUT, f))).map((f) => `out/${f} exists`);
    verdict("10", "Deleted assets absent from out/", fails, [], `${gone.length} paths absent`);
  }

  // ---- 11. Home page images
  // alt="" is allowed (decorative); above-the-fold images marked fetchpriority="high" may load eagerly.
  // <noscript> tracking pixels (facebook.com/tr) are not content images and are exempt.
  {
    const fails = [];
    const homeHtml = (pages.get("/")?.html ?? "").replace(/<noscript>[\s\S]*?<\/noscript>/gi, (block) =>
      block.includes("facebook.com/tr") ? "" : block,
    );
    const imgs = tagsOf(homeHtml, "img");
    for (const img of imgs) {
      const problems = [];
      if (img.alt == null) problems.push("alt");
      if (!img.width) problems.push("width");
      if (!img.height) problems.push("height");
      if (img.loading !== "lazy" && (img.fetchpriority ?? img.fetchPriority) !== "high") problems.push("loading=lazy");
      if (problems.length) fails.push(`${img.src ?? "(no src)"} missing ${problems.join(", ")}`);
    }
    verdict("11", "<img> on home: alt, width, height, loading=lazy", fails, [], `${imgs.length} images`);
  }

  // ---- 12. Measurement gating
  {
    const expectId = process.env.VERIFY_SEO_EXPECT_GA_ID;
    const themeText = readFileSync(path.join(ROOT, "src/config/theme.ts"), "utf8");
    const analyticsOn = /analytics:\s*true/.test(themeText);
    const gtmId = analyticsOn ? process.env.NEXT_PUBLIC_GTM_ID || themeText.match(/gtmId:\s*"([^"]*)"/)?.[1] || "" : "";
    const fails = [];
    const home = pages.get("/")?.html ?? "";
    if (gtmId) {
      // next/script inlines the loader, which builds the gtm.js URL at runtime, so check the host and the ID separately.
      for (const [file, html] of htmlText) {
        if (!html.includes("googletagmanager.com/gtm.js") || !html.includes(gtmId)) fails.push(`${rel(file)} lacks the GTM loader for ${gtmId}`);
        if (!html.includes(`googletagmanager.com/ns.html?id=${gtmId}`)) fails.push(`${rel(file)} lacks the GTM noscript iframe`);
      }
    } else {
      for (const [file, html] of htmlText) if (html.includes("googletagmanager.com/gtm.js")) fails.push(`${rel(file)} contains GTM although none is configured`);
    }
    if (expectId) {
      if (!home.includes(`googletagmanager.com/gtag/js?id=${expectId}`)) fails.push(`gtag loader for ${expectId} not in out/index.html`);
    } else {
      for (const [file, html] of htmlText) {
        if (html.includes("googletagmanager.com/gtag/js")) fails.push(`${rel(file)} contains a gtag loader without NEXT_PUBLIC_GA_MEASUREMENT_ID`);
        if (html.includes("google-site-verification")) fails.push(`${rel(file)} contains google-site-verification`);
      }
    }
    const detail = `${gtmId ? `GTM ${gtmId} on ${htmlFiles.length} HTML files` : "no GTM configured"}; direct GA ${expectId ? `expected ${expectId}` : "absent"}; no site-verification tag`;
    verdict("12", "Measurement: GTM when configured, GA/site-verification only via env", fails, [], detail);
  }

  // ---- 13. Source hygiene
  {
    const fails = [];
    const read = (file) => (isFile(path.join(ROOT, file)) ? readFileSync(path.join(ROOT, file), "utf8") : null);
    const srcFiles = (await walk(path.join(ROOT, "src"))).filter((f) => /\.(tsx?|jsx?|mjs|cjs|css|md|json|html|txt|svg)$/.test(f));
    const greps = [
      ["SmartLockSpotlight", (t) => count(t, "SmartLockSpotlight"), () => true],
      ['"/services#', (t) => count(t, '"/services#'), () => true],
      ["*-opacity-* utilities", (t) => (t.match(/\b(?:bg|border|text)-opacity-/g) ?? []).length, () => true],
      ["!important in .tsx", (t) => count(t, "!important"), (f) => f.endsWith(".tsx")],
    ];
    for (const [label, counter, applies] of greps) {
      const hits = [];
      for (const file of [...srcFiles, path.join(ROOT, "CLAUDE.md")]) {
        if (!applies(file) || !isFile(file)) continue;
        const n = counter(readFileSync(file, "utf8"));
        if (n) hits.push(`${rel(file)} (${n})`);
      }
      if (hits.length) fails.push(`${label}: ${hits.join(", ")}`);
    }
    if ((read("package.json") ?? "").includes("next-seo")) fails.push("package.json references next-seo");
    if ((read("src/app/layout.tsx") ?? "").includes("application/ld+json")) fails.push("src/app/layout.tsx contains application/ld+json");
    const publicLayout = read("src/app/(public)/layout.tsx") ?? "";
    if (!/import[\s\S]*?\bMotionProvider\b[\s\S]*?from\s+["']/.test(publicLayout)) fails.push("MotionProvider not imported in (public)/layout.tsx");
    if (!/<MotionProvider[\s>]/.test(publicLayout)) fails.push("MotionProvider not used in (public)/layout.tsx");
    const globals = read("src/app/globals.css") ?? "";
    if (!/@layer base\s*\{[\s\S]*?\bh1\b[\s\S]*?\bcolor\s*:[\s\S]*?\}/.test(globals)) fails.push("globals.css lacks @layer base heading color rule");
    if (globals.includes("fonts.googleapis")) fails.push("globals.css still imports fonts.googleapis");
    const envExample = read(".env.example") ?? "";
    for (const key of ["NEXT_PUBLIC_GA_MEASUREMENT_ID", "NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION"]) {
      if (!envExample.includes(key)) fails.push(`.env.example lacks ${key}`);
    }
    const deploy = read(".github/workflows/deploy.yml") ?? "";
    const buildStep = deploy.slice(deploy.indexOf("name: Build"), deploy.indexOf("- name:", deploy.indexOf("name: Build") + 1));
    for (const key of ["NEXT_PUBLIC_GA_MEASUREMENT_ID", "NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION"]) {
      if (!new RegExp(`${key}:\\s*\\$\\{\\{\\s*secrets\\.${key}\\s*\\}\\}`).test(buildStep)) fails.push(`deploy.yml Build step lacks ${key} secret`);
    }
    for (const file of ["src/app/sitemap.ts", "src/app/robots.ts", "src/app/og-image.png/route.tsx"]) {
      if (!/export\s+const\s+dynamic\s*=\s*["']force-static["']/.test(read(file) ?? "")) fails.push(`${file} lacks dynamic = "force-static"`);
    }
    verdict("13", "Source hygiene (src/, CLAUDE.md, config files)", fails, [], `${srcFiles.length} src files scanned`);
  }

  // ---- 14. Content sanity
  {
    const fails = [];
    const warns = [];
    const notes = [];
    const patterns = [
      ["postal code", /\b[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z] ?\d[ABCEGHJ-NPRSTV-Z]\d\b/],
      ["street address", /\b\d{1,5}\s+(?:[A-Z][a-z]+\s+){1,3}(?:St|Street|Ave|Avenue|Rd|Road|Blvd|Boulevard|Dr|Drive|Ct|Court|Cres|Crescent|Ln|Lane|Way|Pkwy|Parkway)\b\.?/],
      ["licence number", /\blicen[cs]e\s*(?:no\.?|number|#)\s*:?\s*[A-Z0-9-]+|\blicen[cs]ed?\s*#\s*\d/i],
      ["years of experience", /\b\d+\+?\s*(?:years|yrs)\b|\byears\s+of\s+experience\b/i],
      ["customer count", /\b\d[\d,]*\+?\s*(?:happy\s+)?(?:customers|clients|homes|jobs|installations|reviews|locks)\b/i],
      ["percentage", /\b\d+(?:\.\d+)?\s?%/],
      ["dollar figure", /\$\s?\d|\b\d+\s?(?:dollars|CAD)\b/i],
    ];
    const sanityPaths = [...CITY_PATHS, ...SERVICE_PATHS, ...SUB_SERVICE_PATHS];
    for (const p of sanityPaths) {
      const page = pages.get(p);
      if (!page) { fails.push(`${p} not built`); continue; }
      const text = `${visibleText(mainHtml(page.html))} ${metaByName(page.html, "description") ?? ""}`;
      for (const [label, re] of patterns) {
        const hit = text.match(re);
        if (hit) fails.push(`${p}: ${label} "${hit[0]}"`);
      }
      const minutes = text.match(/[^.?!]*\bminutes?\b[^.?!]*/i);
      if (minutes) {
        if (CITY_PATHS.includes(p)) fails.push(`${p}: minute wording "${minutes[0].trim()}"`);
        else notes.push(`${p} mentions "${minutes[0].trim().slice(0, 60)}" (allowed on service pages)`);
      }
    }
    // Duplicate paragraphs across city pages (paragraphs that also appear on
    // non-city pages are shared components, not city copy, and are ignored)
    const shared = new Set();
    for (const [p, { html }] of pageEntries) {
      if (!CITY_PATHS.includes(p)) for (const para of paragraphsOf(mainHtml(html))) shared.add(para);
    }
    const blurbs = new Map();
    const paragraphOwners = new Map();
    for (const p of CITY_PATHS) {
      const page = pages.get(p);
      if (!page) continue;
      const main = mainHtml(page.html);
      const afterH1 = main.slice(main.search(/<h1[\s>]/i));
      const blurb = paragraphsOf(afterH1)[0] ?? "";
      const normalized = blurb.replace(new RegExp(cityName(p), "gi"), "{city}");
      blurbs.set(normalized, [...(blurbs.get(normalized) ?? []), p]);
      for (const para of paragraphsOf(main)) {
        if (para.length < 100 || shared.has(para)) continue;
        paragraphOwners.set(para, [...(paragraphOwners.get(para) ?? []), p]);
      }
    }
    for (const [, ps] of blurbs) if (ps.length > 1) warns.push(`identical hero blurb on ${ps.join(", ")}`);
    for (const [para, ps] of paragraphOwners) {
      if (ps.length > 1) warns.push(`paragraph "${para.slice(0, 50)}..." byte-identical on ${ps.length} city pages`);
    }
    verdict("14", "Content sanity (address, licence, years, counts, prices, minutes, duplicates)", fails, warns, `${sanityPaths.length} pages clean`);
    if (notes.length) results[results.length - 1].detail += `; note: ${notes.join("; note: ")}`;
  }

  // ---- 15. Link coverage (brief 6.D)
  {
    const fails = [];
    const hrefsIn = (html) => new Set(anchorHrefs(html).map((h) => h.replace(/[#?].*$/, "")));
    const need = (label, html, hrefs) => {
      const have = hrefsIn(html);
      for (const h of hrefs) if (!have.has(h)) fails.push(`${label} lacks href ${h}`);
    };
    const about = pages.get("/about/")?.html ?? "";
    need("out/index.html", pages.get("/")?.html ?? "", SUB_SERVICE_PATHS);
    need("hub page", pages.get(HUB_PATH)?.html ?? "", SUB_SERVICE_PATHS);
    need("out/services/index.html", pages.get("/services/")?.html ?? "", SUB_SERVICE_PATHS);
    need("out/about/index.html (footer proxy)", about, SUB_SERVICE_PATHS);
    need("<header> of out/about/index.html", elementHtml(about, "header"), SUB_SERVICE_PATHS);
    need("<header> of out/about/index.html", elementHtml(about, "header"), [HUB_PATH]);
    const blogHtml = BLOG_POST_PATHS.map((p) => pages.get(p)?.html ?? "");
    for (const sub of SUB_SERVICE_PATHS) {
      const n = blogHtml.filter((html) => hrefsIn(mainHtml(html)).has(sub)).length;
      if (!n) fails.push(`no guide links to ${sub} from its body`);
    }
    for (const p of BLOG_POST_PATHS) {
      const html = pages.get(p)?.html ?? "";
      if (BLOG_POSTS.find((b) => `/blog/${b.slug}/` === p)?.category === "garage-doors" && !hrefsIn(mainHtml(html)).has(HUB_PATH)) {
        fails.push(`${p} (garage guide) no longer links to the hub from its body`);
      }
    }
    const cityNeeds = [HUB_PATH, ...SUB_SERVICE_PATHS, ...OTHER_SERVICE_PATHS];
    for (const p of CITY_PATHS) {
      const page = pages.get(p);
      if (!page) { fails.push(`${p} not built`); continue; }
      need(`${p} <main>`, mainHtml(page.html), cityNeeds);
    }
    for (const p of SUB_SERVICE_PATHS) {
      const page = pages.get(p);
      if (!page) continue;
      const main = mainHtml(page.html);
      need(`${p} <main>`, main, [HUB_PATH, ...SUB_SERVICE_PATHS.filter((s) => s !== p), ...CITY_PATHS.filter((c) => c !== "/service-areas/oshawa/")]);
      // body anchor "garage door repair in Oshawa" -> hub
      const bodyLink = [...main.matchAll(/<a\s[^>]*?href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi)].find(
        (m) => /garage door repair in oshawa/i.test(visibleText(m[2])),
      );
      if (!bodyLink) fails.push(`${p}: no body link with anchor "garage door repair in Oshawa"`);
      else if (bodyLink[1] !== HUB_PATH) fails.push(`${p}: "garage door repair in Oshawa" points to ${bodyLink[1]}`);
    }
    // Anchor discipline (contract C6): any link text containing "installation" never points to the hub.
    for (const p of SCOPE_PATHS) {
      const html = pages.get(p)?.html ?? "";
      for (const m of html.matchAll(/<a\s[^>]*?href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi)) {
        const text = visibleText(m[2]);
        if (/installation/i.test(text) && decodeEntities(m[1]).replace(/[#?].*$/, "") === HUB_PATH && !/all garage door repairs|repair in oshawa/i.test(text)) {
          fails.push(`${p}: anchor "${text.slice(0, 50)}" containing "installation" points to the hub`);
        }
      }
    }
    verdict("15", "Link coverage: sub-services from home/hub/services/footer/header/guides; city pages -> 7 service hrefs; C6 anchors", fails, [], "all required links present");
  }

  // ---- 16. Targeting table (brief 6.0): titles and H1s
  {
    const fails = [];
    const h1 = (p) => h1Of(pages.get(p)?.html ?? "") ?? "";
    const title = (p) => titleOf(pages.get(p)?.html ?? "") ?? "";
    for (const p of [...SERVICE_PATHS, ...SUB_SERVICE_PATHS]) {
      if (!/Oshawa/.test(h1(p))) fails.push(`${p} H1 lacks "Oshawa": "${h1(p)}"`);
    }
    for (const p of CITY_PATHS) {
      const name = cityLabel(p);
      if (p === "/service-areas/oshawa/") {
        if (/garage door repair/i.test(h1(p))) fails.push(`Oshawa H1 contains "Garage Door Repair": "${h1(p)}"`);
        if (!/Oshawa/.test(h1(p))) fails.push(`Oshawa H1 lacks "Oshawa"`);
        const mainHrefs = anchorHrefs(mainHtml(pages.get(p)?.html ?? "")).map((h) => h.replace(/[#?].*$/, ""));
        if (!mainHrefs.includes(HUB_PATH)) fails.push("Oshawa page body does not link to the hub");
      } else {
        if (!/Garage Door Repair/.test(h1(p))) fails.push(`${p} H1 lacks "Garage Door Repair": "${h1(p)}"`);
        if (!h1(p).includes(name)) fails.push(`${p} H1 lacks "${name}": "${h1(p)}"`);
        if (!title(p).includes(name)) fails.push(`${p} title lacks "${name}": "${title(p)}"`);
      }
    }
    if (!/Durham Region/.test(h1(AREAS_PATH))) fails.push(`${AREAS_PATH} H1 lacks "Durham Region": "${h1(AREAS_PATH)}"`);
    const hubPhrase = /garage door repair oshawa/i;
    const titlesWithPhrase = pageEntries.filter(([, { html }]) => hubPhrase.test(titleOf(html) ?? "")).map(([p]) => p);
    if (titlesWithPhrase.length !== 1 || titlesWithPhrase[0] !== HUB_PATH) fails.push(`"Garage Door Repair Oshawa" in <title> of: ${titlesWithPhrase.join(", ") || "(none)"} (expected only ${HUB_PATH})`);
    if (hubPhrase.test(title(SPRING_PATH)) || hubPhrase.test(h1(SPRING_PATH))) fails.push("spring page title/H1 uses the bare phrase \"Garage Door Repair Oshawa\"");
    if (!/Garage Door Repair/.test(h1(HUB_PATH))) fails.push(`hub H1 lacks "Garage Door Repair": "${h1(HUB_PATH)}"`);
    if (!/Durham/.test(title("/")) || !/Oshawa/.test(title("/"))) fails.push(`home title lacks Oshawa/Durham: "${title("/")}"`);
    const mustMention = [
      ["/service-areas/courtice/", "Clarington"],
      ["/service-areas/bowmanville/", "Clarington"],
      ["/service-areas/whitby/", "Brooklin"],
    ];
    for (const [p, word] of mustMention) {
      if (!visibleText(mainHtml(pages.get(p)?.html ?? "")).includes(word)) fails.push(`${p} visible text lacks "${word}"`);
    }
    verdict("16", "Targeting: H1 rules (Oshawa on services, city H1s, Oshawa exception, areas Durham Region), one hub title phrase, Clarington/Brooklin", fails, [], `${SERVICE_PATHS.length + SUB_SERVICE_PATHS.length + CITY_PATHS.length + 2} pages`);
  }

  // ---- 17. Unique copy: word counts, duplicate sentences, city similarity, FAQ overlap
  {
    const fails = [];
    const warns = [];
    const detail = [];
    // Sentence ownership across all public pages (main content only).
    const owners = new Map();
    const pageSentences = new Map();
    for (const [p, { html }] of pageEntries) {
      const sentences = sentencesOf(mainHtml(html));
      pageSentences.set(p, sentences);
      for (const s of new Set(sentences)) owners.set(s, (owners.get(s) ?? 0) + 1);
    }
    // Boilerplate = appears on >= 2 other public pages (shared components). Short chunks
    // (chips, labels) that are shared the same way are excluded too.
    const isBoilerplate = (s) => (owners.get(s) ?? 0) >= 3;
    const uniqueSentences = (p) => pageSentences.get(p).filter((s) => !isBoilerplate(s));

    const thresholds = [
      ...CITY_PATHS.map((p) => [p, 600]),
      [HUB_PATH, 700],
      ...SUB_SERVICE_PATHS.map((p) => [p, 700]),
    ];
    const words = [];
    for (const [p, min] of thresholds) {
      const page = pages.get(p);
      if (!page) { fails.push(`${p} not built`); continue; }
      const total = uniqueSentences(p).reduce((n, s) => n + wordCount(s), 0);
      const exFaq = sentencesOf(mainHtml(page.html).replace(/<details[\s\S]*?<\/details>/gi, " "))
        .filter((s) => !isBoilerplate(s))
        .reduce((n, s) => n + wordCount(s), 0);
      words.push(`${cityName(p)} ${total} (${exFaq} ex-FAQ)`);
      if (total < min) fails.push(`${p}: ${total} unique words (< ${min})`);
      else if (exFaq < min) warns.push(`${p}: ${exFaq} unique words excluding FAQs (< ${min})`);
    }
    detail.push(`unique words: ${words.join(", ")}`);

    // Duplicate sentences (>= 60 chars) across the pairs the brief forbids.
    const groups = [];
    for (let i = 0; i < CITY_PATHS.length; i += 1) for (let j = i + 1; j < CITY_PATHS.length; j += 1) groups.push([CITY_PATHS[i], CITY_PATHS[j]]);
    for (const c of CITY_PATHS) for (const s of [...SERVICE_PATHS, ...SUB_SERVICE_PATHS]) groups.push([c, s]);
    for (let i = 0; i < SUB_SERVICE_PATHS.length; i += 1) for (let j = i + 1; j < SUB_SERVICE_PATHS.length; j += 1) groups.push([SUB_SERVICE_PATHS[i], SUB_SERVICE_PATHS[j]]);
    for (const s of SUB_SERVICE_PATHS) groups.push([s, HUB_PATH]);
    const reported = new Set();
    for (const [a, b] of groups) {
      if (!pages.has(a) || !pages.has(b)) continue;
      const setB = new Set(uniqueSentences(b).filter((s) => s.length >= 60));
      for (const s of new Set(uniqueSentences(a).filter((x) => x.length >= 60))) {
        if (!setB.has(s)) continue;
        const key = `${s}|${a}|${b}`;
        if (reported.has(key)) continue;
        reported.add(key);
        fails.push(`duplicate sentence on ${a} and ${b}: "${s.slice(0, 70)}..."`);
      }
    }

    // City similarity: place names -> token, 5-word shingle Jaccard <= 0.25 on de-boilerplated main text.
    const placeNames = new Set([...CITY_NAMES, "Clarington", "Brooklin", "Durham Region", "Durham"]);
    for (const p of CITY_PATHS) {
      const section = elementHtml(pages.get(p)?.html ?? "", "section", /aria-labelledby="city-neighbourhoods"/);
      for (const li of section.matchAll(/<li[\s>][^>]*>([\s\S]*?)<\/li>/gi)) placeNames.add(visibleText(li[1]));
    }
    const placeRe = new RegExp(`\\b(?:${[...placeNames].filter(Boolean).sort((x, y) => y.length - x.length).map(escapeRe).join("|")})\\b`, "g");
    const tokensOf = (p) =>
      uniqueSentences(p)
        .join(" ")
        .replace(placeRe, "PLACE")
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter(Boolean);
    const rawTokensOf = (p) =>
      pageSentences.get(p).join(" ").replace(placeRe, "PLACE").toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
    const builtCities = CITY_PATHS.filter((p) => pages.has(p));
    const shinglesByCity = new Map(builtCities.map((p) => [p, shingles(tokensOf(p))]));
    const rawShinglesByCity = new Map(builtCities.map((p) => [p, shingles(rawTokensOf(p))]));
    const sims = [];
    const rawSims = [];
    for (let i = 0; i < builtCities.length; i += 1) {
      for (let j = i + 1; j < builtCities.length; j += 1) {
        const a = builtCities[i];
        const b = builtCities[j];
        const sim = jaccard(shinglesByCity.get(a), shinglesByCity.get(b));
        sims.push(sim);
        rawSims.push(jaccard(rawShinglesByCity.get(a), rawShinglesByCity.get(b)));
        if (sim > 0.25) fails.push(`${cityName(a)}/${cityName(b)} shingle Jaccard ${sim.toFixed(2)} > 0.25`);
      }
    }
    if (sims.length) detail.push(`max city Jaccard ${Math.max(...sims).toFixed(2)} (boilerplate excluded; ${Math.max(...rawSims).toFixed(2)} on raw main text)`);

    // FAQ overlap: identical city questions after removing the city name; sub-page questions vs guide FAQ headings.
    const cityQuestions = new Map();
    const questionsOf = (p) => {
      const faq = jsonLdBlocks(pages.get(p)?.html ?? "").flatMap((b) => (b.data ? collectNodes(b.data) : [])).find((n) => hasType(n, "FAQPage"));
      return (Array.isArray(faq?.mainEntity) ? faq.mainEntity : []).map((q) => String(q.name ?? ""));
    };
    for (const p of CITY_PATHS) {
      for (const q of questionsOf(p)) {
        const key = normalizeQuestion(q.replace(new RegExp(`\\b${cityLabel(p)}\\b`, "gi"), " "));
        cityQuestions.set(key, [...(cityQuestions.get(key) ?? []), p]);
      }
    }
    for (const [key, ps] of cityQuestions) if (ps.length > 1) fails.push(`identical FAQ question on ${ps.join(", ")}: "${key.slice(0, 60)}"`);
    const blogQuestions = new Set(BLOG_POSTS.flatMap((b) => b.faqQuestions).map(normalizeQuestion));
    for (const p of SUB_SERVICE_PATHS) {
      for (const q of questionsOf(p)) if (blogQuestions.has(normalizeQuestion(q))) fails.push(`${p} FAQ "${q}" equals a guide FAQ heading`);
    }
    verdict("17", "Unique copy: >=600 words (city) / >=700 (hub, subs); no duplicate sentences; city Jaccard <= 0.25; FAQ overlap", fails, warns, detail.join("; "));
    if (fails.length || warns.length) results[results.length - 1].detail += `; ${detail.join("; ")}`;
  }

  // ---- 18. Content rules (brief 9) over visible text of /, /services/*, /service-areas/*
  {
    const fails = [];
    const textRules = [
      ["dollar figure", /\$\s?\d/],
      ["pricing claim", /\b(starting (at|from)|as low as|flat[- ]rate|per hour|hourly rate|no (trip|service|call[- ]out) (fee|charge)|discount|coupon|% off|financing)\b/i],
      ["years in business", /\b(since (19|20)\d\d|\d+\+? ?(years|yrs)|years of experience|decades?|established in)\b/i],
      ["customer/job count", /\b(hundreds|thousands|\d+[,\d]*\+?) (of )?(customers|clients|homes|jobs|doors|installs|installations|reviews)\b/i],
      ["licence/insurance/award claim", /\b(licen[cs]ed|insured|bonded|certified|accredited|WSIB|BBB|A\+ rat|award[- ]winning|number one|top[- ]rated|best in (Durham|Oshawa))\b|(?:^|\s)#1\b/i],
      ["warranty/lifetime claim", /\b(warrant(y|ies|eed)|lifetime|guarantee(d)? (parts|labour|labor|work))\b/i],
      ["percentage", /\b\d+(\.\d+)?\s?%/],
      ["product brand", /\b(LiftMaster|Chamberlain|Genie|Garaga|Clopay|Amarr|Wayne Dalton|myQ|Kwikset|Schlage|Weiser|Medeco|Hikvision|Dahua|Reolink|Lorex|Arlo)\b|\b(Ring|Nest) (camera|doorbell|cam|video|secure|protect|hub)\b/],
      ["response-time promise", /\b(minutes?|mins?|within (the|an|one) hour|in under an hour|same[- ]day|next[- ]day|rapid response|fast response|on[- ]site (in|within)|arrive (in|within)|ETA)\b/i],
      ["house/business lockout", /\b(house|home|residential|business|commercial) lockouts?\b/i],
      ["locksmith scope", /\b(key (cutting|duplication|copying)|car keys?|key fobs?|fob programming|transponder|ignition|safes|safe (opening|cracking|unlocking|combinations?)|access control|master key(ed)? system|high[- ]security locks?|smart lock installation)\b/i],
      ["commercial door scope", /\b(overhead doors?|loading dock|dock doors?|rolling (steel )?doors?|roll[- ]up doors?|industrial doors?|commercial sectional|warehouse doors?)\b/i],
      ["stock/one-visit claim", /\b(on the truck|in stock|stocked|carry (springs|parts)|one visit|first visit fix)\b/i],
      ["spec claim", /\b(high[- ]cycle|\d{1,2},?000 cycles)\b|\bR-?\d{1,2}\b/],
      ["American spelling", /\b(neighborhood|color|center|favorite)\b/i],
      ["trivia", /\b(population|founded in|incorporated in|family[- ]friendly)\b/i],
      ["staffing claim", /\b(family[- ]owned|owner[- ]operated|our team of)\b/i],
    ];
    const hoursRe = /\b(24\/7|24-7|24 hours?|24-hour|around the clock|after[- ]hours|emergency|overnight|holidays)\b/gi;
    const htmlRules = [
      ["role=menu", /role="menu(item)?"/],
      ["/services/undefined", /\/services\/undefined/],
      ["priceRange", /priceRange/],
      ["streetAddress/postalCode", /streetAddress|postalCode/],
      ["click here / learn more anchor", />\s*(click here|learn more)\s*</i],
      ["AggregateRating/Review", /AggregateRating|"Review"/],
    ];
    let scanned = 0;
    for (const p of SCOPE_PATHS) {
      const page = pages.get(p);
      if (!page) { fails.push(`${p} not built`); continue; }
      scanned += 1;
      const body = page.html.replace(/<noscript[\s\S]*?<\/noscript>/gi, " ");
      // Guide cards carry a reading-time label ("4 min read"); it is not a response-time claim.
      const text = `${titleOf(page.html) ?? ""} | ${metaByName(page.html, "description") ?? ""} | ${visibleText(body)}`.replace(/\b\d+ min read\b/g, " ");
      for (const [label, re] of textRules) {
        const hit = text.match(re);
        if (hit) fails.push(`${p}: ${label} "${hit[0]}"`);
      }
      // The car-lockout page is lockout context from top to bottom; everywhere else 24/7-style
      // wording must sit within 200 characters of "lockout" or "car".
      const lockoutPage = p === "/services/car-lockout/";
      for (const m of text.matchAll(hoursRe)) {
        if (lockoutPage) break;
        const window = text.slice(Math.max(0, m.index - 200), m.index + m[0].length + 200);
        if (!/lockout|\bcars?\b/i.test(window)) fails.push(`${p}: "${m[0]}" outside car-lockout context: "...${text.slice(Math.max(0, m.index - 40), m.index + 40)}..."`);
      }
      for (const [label, re] of htmlRules) if (re.test(page.html)) fails.push(`${p}: HTML contains ${label}`);
      for (const href of anchorHrefs(page.html)) {
        if (!href.startsWith("/") || href.startsWith("//")) continue;
        const target = href.replace(/[#?].*$/, "");
        if (target && !target.endsWith("/") && !/\.[a-z0-9]+$/i.test(target)) fails.push(`${p}: internal href without trailing slash "${href}"`);
      }
    }
    verdict("18", "Content rules (brief 9) on /, /services/*, /service-areas/*: no prices, years, claims, brands, ETAs, scope creep; 24/7 only near car lockout", fails, [], `${scanned} pages clean`);
  }

  // ---- 19. Placeholders and neighbourhood chip lists
  {
    const fails = [];
    const warns = [];
    const placeholderRe = /SCAFFOLD PLACEHOLDER|TODO|TBD|lorem|\{City\}|\[City\]|\{\{|XXX/;
    const loremRe = /\blorem\b/i;
    for (const [p, { html }] of pageEntries) {
      const text = `${titleOf(html) ?? ""} | ${metaByName(html, "description") ?? ""} | ${visibleText(html.replace(/<noscript[\s\S]*?<\/noscript>/gi, " "))}`;
      const hit = text.match(placeholderRe) ?? text.match(loremRe);
      if (hit) fails.push(`${p}: placeholder "${hit[0]}"`);
    }
    const sitemapText = isFile(path.join(OUT, "sitemap.xml")) ? readFileSync(path.join(OUT, "sitemap.xml"), "utf8") : "";
    if (placeholderRe.test(sitemapText)) fails.push("out/sitemap.xml contains a placeholder");
    const contentDir = path.join(ROOT, "src", "content");
    const contentFiles = existsSync(contentDir) ? (await walk(contentDir)).filter((f) => /\.(ts|tsx|md|json)$/.test(f)) : [];
    for (const file of contentFiles) {
      let text = readFileSync(file, "utf8");
      // Doc comments in .ts files may legitimately describe "{City}" templates; scan code and copy only.
      if (/\.tsx?$/.test(file)) text = text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
      const hit = text.match(placeholderRe) ?? text.match(loremRe);
      if (hit) fails.push(`${rel(file)}: placeholder "${hit[0]}"`);
    }
    for (const p of CITY_PATHS) {
      const page = pages.get(p);
      if (!page) continue;
      const section = elementHtml(page.html, "section", /aria-labelledby="city-neighbourhoods"/);
      if (!section) { fails.push(`${p}: no neighbourhoods section (aria-labelledby="city-neighbourhoods")`); continue; }
      const chips = (section.match(/<li[\s>]/gi) ?? []).length;
      const minChips = p === "/service-areas/courtice/" ? 4 : 5;
      if (chips > 10) fails.push(`${p}: ${chips} place chips (> 10)`);
      else if (chips < minChips) warns.push(`${p}: ${chips} place chips (< ${minChips})`);
      const prose = (section.match(/<p[\s>]/gi) ?? []).length;
      if (!prose) fails.push(`${p}: neighbourhoods section has no prose paragraph before the chips`);
    }
    verdict("19", "No placeholders in out/ or src/content/; neighbourhood chips 5-10 after prose", fails, warns, `${pageEntries.length} pages + ${contentFiles.length} content files`);
  }

  // ---- 20. Sitemap freshness and images
  {
    const fails = [];
    const warns = [];
    const xml = isFile(path.join(OUT, "sitemap.xml")) ? readFileSync(path.join(OUT, "sitemap.xml"), "utf8") : "";
    const entries = new Map();
    for (const m of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
      const loc = decodeEntities(m[1].match(/<loc>([^<]+)<\/loc>/)?.[1] ?? "");
      entries.set(loc.replace(SITE, ""), {
        lastmod: m[1].match(/<lastmod>([^<]+)<\/lastmod>/)?.[1] ?? "",
        images: [...m[1].matchAll(/<image:loc>([^<]+)<\/image:loc>/g)].map((i) => i[1]),
      });
    }
    const expectDate = (p, date, soft = false) => {
      const e = entries.get(p);
      const list = soft ? warns : fails;
      if (!e) list.push(`${p} missing from sitemap`);
      else if (!e.lastmod.startsWith(date)) list.push(`${p} lastmod=${e.lastmod} (expected ${date})`);
    };
    for (const p of [...SUB_SERVICE_PATHS, ...CITY_PATHS]) expectDate(p, "2026-10-07");
    for (const p of ["/", "/services/", ...SERVICE_PATHS, AREAS_PATH]) expectDate(p, "2026-10-07", true);
    expectDate("/privacy-policy/", "2026-09-28");
    for (const p of SUB_SERVICE_PATHS) {
      const e = entries.get(p);
      if (e && !e.images.length) fails.push(`${p} has no <image:loc>`);
      if (e && e.images.some((u) => u.includes("&"))) fails.push(`${p} image URL contains "&"`);
    }
    verdict("20", "Sitemap: sub-service + city lastmod 2026-10-07, privacy-policy 2026-09-28, sub routes carry <image:loc>", fails, warns, `${entries.size} entries`);
  }

  // ---------------------------------------------------------------- report --
  const cell = (s) => String(s).replace(/\|/g, "\\|").replace(/\n/g, " ");
  console.log("| # | Check | Status | Detail |");
  console.log("|---|-------|--------|--------|");
  for (const r of results) {
    const detail = r.detail.length > 220 ? `${r.detail.slice(0, 217)}...` : r.detail;
    console.log(`| ${r.id} | ${cell(r.check)} | ${r.status} | ${cell(detail)} |`);
  }
  const problems = results.filter((r) => r.status !== "PASS");
  if (problems.length) {
    console.log("\nFull details for non-PASS rows:");
    for (const r of problems) console.log(`- [${r.status}] ${r.id} ${r.check}\n    ${r.detail.split("; ").join("\n    ")}`);
  }
  const failCount = results.filter((r) => r.status === "FAIL").length;
  const warnCount = results.filter((r) => r.status === "WARN").length;
  console.log(`\n${results.length} rows: ${results.length - failCount - warnCount} PASS, ${warnCount} WARN, ${failCount} FAIL`);
  process.exitCode = failCount ? 1 : 0;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
