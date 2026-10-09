#!/usr/bin/env node
/**
 * Submits every URL in the sitemap to IndexNow (Bing, Copilot, Yandex, Seznam, Naver), so a deploy
 * is picked up in days instead of waiting for a crawl. ChatGPT search runs on Bing's index.
 *
 * Reads out/sitemap.xml when present (after `npm run build`), otherwise the live sitemap.
 * The key file lives at public/<KEY>.txt and is served from the site root.
 *
 * Usage: node scripts/indexnow.mjs [--dry-run]
 */
import { existsSync, readFileSync } from "node:fs";

const HOST = "www.jdhomeservices.ca";
const KEY = "e451c642fdcffb95b143eafdaa3d7a78";
const ENDPOINT = "https://api.indexnow.org/indexnow";
const dryRun = process.argv.includes("--dry-run");

const xml = existsSync("out/sitemap.xml")
  ? readFileSync("out/sitemap.xml", "utf8")
  : await (await fetch(`https://${HOST}/sitemap.xml`)).text();

const urlList = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((match) => match[1].trim())
  .filter((url) => new URL(url).host === HOST);

if (urlList.length === 0) {
  console.error("indexnow: no URLs found in the sitemap");
  process.exit(1);
}

const payload = { host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList };

if (dryRun) {
  console.log(`indexnow: dry run, would submit ${urlList.length} URLs`);
  process.exit(0);
}

const response = await fetch(ENDPOINT, {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify(payload),
});

// 200 = accepted, 202 = accepted and the key is still being validated.
console.log(`indexnow: submitted ${urlList.length} URLs -> HTTP ${response.status}`);
if (response.status !== 200 && response.status !== 202) {
  console.error(await response.text());
  process.exit(1);
}
