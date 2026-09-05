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
 * Dependencies: none (node:fs, node:fs/promises, node:path only).
 */
import { readFile, readdir } from "node:fs/promises";
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "out");
const SITE = "https://www.jdhomeservices.ca";

const SERVICE_PATHS = [
  "/services/locksmith/",
  "/services/car-lockout/",
  "/services/garage-door-repair-installation/",
];
const CITY_PATHS = [
  "/service-areas/oshawa/",
  "/service-areas/whitby/",
  "/service-areas/ajax/",
  "/service-areas/pickering/",
  "/service-areas/courtice/",
  "/service-areas/bowmanville/",
];
const TWO_CRUMB_PATHS = [
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
  "/service-areas/",
  ...CITY_PATHS,
  "/about/",
  "/contact/",
  "/privacy-policy/",
];
const EXCLUDED_DIRS = [
  /^_next(\/|$)/,
  /^404(\/|$)/,
  /^admin(\/|$)/,
  /^share(\/|$)/,
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
      if (/\/(admin|share)\//.test(loc)) hygiene.push(`sitemap lists ${loc}`);
      if (!loc.startsWith(`${SITE}/`)) hygiene.push(`bad prefix: ${loc}`);
      if (!loc.endsWith("/")) hygiene.push(`no trailing slash: ${loc}`);
    }
    const urlBlocks = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)];
    const noLastmod = urlBlocks.filter((m) => !/<lastmod>[^<]+<\/lastmod>/.test(m[1]));
    if (noLastmod.length) hygiene.push(`${noLastmod.length} <url> entries lack <lastmod>`);
    if (urlBlocks.length !== locs.length) hygiene.push("<url>/<loc> count mismatch");
    verdict("1b", "Sitemap hygiene (no admin/share, host+slash, lastmod)", hygiene, [], `${locs.length} entries`);
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

      const title = titleOf(html);
      if (!title) f.title.push(`${p} missing <title>`);
      else {
        if (title.length > 70) f.title.push(`${p} title ${title.length} chars`);
        else if (title.length > 60) w.title.push(`${p} title ${title.length} chars`);
        titles.set(title, [...(titles.get(title) ?? []), p]);
      }

      const desc = metaByName(html, "description");
      if (!desc) f.desc.push(`${p} missing description`);
      else {
        if (desc.length < 50 || desc.length > 160) f.desc.push(`${p} description ${desc.length} chars`);
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
      if (!twitterSite) f.og.push(`${p} twitter:site missing`);

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
      if (themeColor !== "#1B3A5F") f.theme.push(`${p} theme-color=${themeColor}`);
      if (!html.includes('href="#main"')) f.skip.push(`${p} lacks href="#main"`);
      if (!html.includes('id="main"')) f.skip.push(`${p} lacks id="main"`);
    }
    for (const [title, ps] of titles) if (ps.length > 1) f.title.push(`duplicate title "${title}" on ${ps.join(", ")}`);
    for (const [, ps] of descs) if (ps.length > 1) f.desc.push(`duplicate description on ${ps.join(", ")}`);

    const n = pageEntries.length;
    verdict("2a", "Exactly one <h1> per page", f.h1, [], `${n} pages`);
    verdict("2b", "<title> non-empty, <=60 chars, unique", f.title, w.title, `${n} unique titles`);
    verdict("2c", "meta description 50-155 chars, unique", f.desc, w.desc, `${n} unique descriptions`);
    verdict("2d", "Canonical === site + path", f.canonical, [], `${n} pages`);
    verdict("2e", "OpenGraph + Twitter tags", f.og, [], `${n} pages`);
    verdict("2f", "og:image on site host and maps to a PNG in out/", f.ogImage, [], `${n} pages`);
    verdict("2g", "No noindex on public pages", f.robots, [], `${n} pages`);
    verdict("2h", '<html lang="en-CA">', f.lang, [], `${n} pages`);
    verdict("2i", "theme-color #1B3A5F", f.theme, [], `${n} pages`);
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
        if (!Array.isArray(biz.sameAs) || biz.sameAs.length !== 2) bad(`sameAs length=${biz.sameAs?.length}`);
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
        if (questions.length !== 5) serviceFails.push(`${p}: FAQPage has ${questions.length} Questions`);
        const noAnswer = questions.filter((q) => typeof q.acceptedAnswer?.text !== "string" || !q.acceptedAnswer.text.trim());
        if (noAnswer.length) serviceFails.push(`${p}: ${noAnswer.length} Questions lack acceptedAnswer.text`);
      }
      const crumbs = nodes.find((node) => hasType(node, "BreadcrumbList"));
      const items = crumbs?.itemListElement?.length ?? 0;
      if (items !== 3) serviceFails.push(`${p}: BreadcrumbList has ${items} items`);
    }
    verdict("3e", "Service pages: Service + FAQPage(5) + BreadcrumbList(3)", serviceFails, [], `${SERVICE_PATHS.length} pages`);

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
    for (const p of TWO_CRUMB_PATHS) expectCrumbs(p, 2);
    expectCrumbs("/", 0);
    verdict("3f", "BreadcrumbList counts (cities 3, hubs 2, home none)", crumbFails, [], `${CITY_PATHS.length + TWO_CRUMB_PATHS.length + 1} pages`);

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
      return r === "share/index.html" || (r.startsWith("admin/") && r.endsWith("/index.html"));
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
    verdict("6", "noindex on share/ and admin/**, never on public pages", fails, [], `${mustNoindex.length} private pages noindex`);
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

  // ---- 11. Partner images
  {
    const fails = [];
    const imgs = tagsOf(pages.get("/")?.html ?? "", "img");
    for (const img of imgs) {
      const problems = [];
      if (!img.alt) problems.push("alt");
      if (!img.width) problems.push("width");
      if (!img.height) problems.push("height");
      if (img.loading !== "lazy") problems.push("loading=lazy");
      if (problems.length) fails.push(`${img.src ?? "(no src)"} missing ${problems.join(", ")}`);
    }
    verdict("11", "<img> on home: alt, width, height, loading=lazy", fails, [], `${imgs.length} images`);
  }

  // ---- 12. Measurement gating
  {
    const expectId = process.env.VERIFY_SEO_EXPECT_GA_ID;
    const fails = [];
    if (expectId) {
      const home = pages.get("/")?.html ?? "";
      if (!home.includes(`googletagmanager.com/gtag/js?id=${expectId}`)) fails.push(`gtag loader for ${expectId} not in out/index.html`);
      verdict("12", `GA loader present for ${expectId}`, fails, [], `googletagmanager.com/gtag/js?id=${expectId} found in out/index.html`);
    } else {
      for (const [file, html] of htmlText) {
        if (html.includes("googletagmanager.com")) fails.push(`${rel(file)} contains googletagmanager.com`);
        if (html.includes("google-site-verification")) fails.push(`${rel(file)} contains google-site-verification`);
      }
      verdict("12", "No GA / site-verification without env vars", fails, [], `${htmlFiles.length} HTML files clean`);
    }
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
    const cityName = (p) => p.split("/").filter(Boolean).pop();
    for (const p of [...CITY_PATHS, ...SERVICE_PATHS]) {
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
    verdict("14", "Content sanity (address, licence, years, counts, prices, minutes, duplicates)", fails, warns, "9 pages clean");
    if (notes.length) results[results.length - 1].detail += `; note: ${notes.join("; note: ")}`;
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
