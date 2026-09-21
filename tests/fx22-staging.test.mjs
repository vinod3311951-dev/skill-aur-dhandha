import test from"node:test";
import assert from"node:assert/strict";
import fs from"node:fs";

const read=p=>fs.readFileSync(new URL("../"+p,import.meta.url),"utf8");

test("FX-22 staging HTML is explicitly noindex and private-review labelled",()=>{
  const html=read("index.html");
  assert.match(html,/name="robots" content="noindex, nofollow"/);
  assert.match(html,/name="googlebot" content="noindex, nofollow"/);
  assert.match(html,/Private Preview/);
});

test("FX-22 robots disallows all crawlers",()=>{
  const robots=read("robots.txt");
  assert.match(robots,/User-agent:\s*\*/);
  assert.match(robots,/Disallow:\s*\//);
});

test("FX-22 founder direct level select covers every core stage",()=>{
  const html=read("index.html"),app=read("src/app.js");
  assert.match(html,/id="review-level-input"/);
  assert.match(html,/min="1"/);
  assert.match(html,/max="100"/);
  assert.match(html,/id="review-level-go"/);
  assert.match(app,/CORE_STAGE_COUNT/);
  assert.match(app,/start\(id\)/);
});

test("FX-22 staging has no public share or cross-promo surface",()=>{
  const html=read("index.html"),app=read("src/app.js");
  assert.doesNotMatch(html,/navigator\.share|share-btn|share button/i);
  assert.doesNotMatch(html,/cross[- ]?promo/i);
  assert.match(app,/new CrossPromoAdapter\(\[\]\)/);
});

test("FX-22 analytics remains local-buffer only without a public sender",()=>{
  const app=read("src/app.js");
  assert.match(app,/new AnalyticsAdapter\(\)/);
  assert.doesNotMatch(app,/new AnalyticsAdapter\([^)]*(fetch|sendBeacon|http)/);
});

test("FX-22 service worker stages noindex robots asset under a new cache version",()=>{
  const sw=read("sw.js");
  assert.match(sw,/color-dominion-v22-staging/);
  assert.match(sw,/\.\/robots\.txt/);
});
