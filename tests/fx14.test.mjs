import test from"node:test";import assert from"node:assert/strict";import fs from"node:fs";
const read=p=>fs.readFileSync(new URL("../"+p,import.meta.url),"utf8");
test("PWA shell exists",()=>{assert.equal(fs.existsSync(new URL("../manifest.webmanifest",import.meta.url)),true);assert.equal(fs.existsSync(new URL("../sw.js",import.meta.url)),true);const m=JSON.parse(read("manifest.webmanifest"));assert.equal(m.name,"Color Dominion");assert.equal(m.display,"standalone")});
test("required UX surfaces are wired",()=>{const h=read("index.html");for(const id of["map-screen","settings-screen","how-screen","pause-overlay","error-screen","restore-preview"])assert.match(h,new RegExp('id="'+id+'"'))});
test("presentation identity hooks exist",()=>{const a=read("src/app.js");assert.match(a,/showRestore/);assert.match(a,/CD-SFX-011-color-bloom-v1/);assert.match(a,/renderMap/);assert.match(a,/reducedMotion/)});
test("copyright register exists",()=>{const p=read("docs/ip/IP_PROVENANCE_REGISTER.md");assert.match(p,/Color Dominion/);assert.match(p,/ORIGINAL_FACTORY_X/);assert.equal(fs.existsSync(new URL("../docs/ip/TRADEMARK_NAME_CHECK.md",import.meta.url)),true)});
