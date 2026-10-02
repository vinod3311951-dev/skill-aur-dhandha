import { readdirSync, readFileSync, rmSync, mkdirSync, writeFileSync, copyFileSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import path from "node:path";

const root=process.cwd();
const payloadDir=path.join(root,"sarhad-payload");
const outDir=path.join(root,"public");

const files=readdirSync(payloadDir)
  .filter(name=>/^\d{3}\.txt$/.test(name))
  .sort();

if(!files.length)throw new Error("SARHAD payload files are missing");

const encoded=files.map(name=>readFileSync(path.join(payloadDir,name),"utf8")).join("");
const gz=Buffer.from(encoded,"base64");

const expected="c858351b991393a414bcedac20fbfb27801c990084dea23ca71f1b5ef17393e4";
const actual=createHash("sha256").update(gz).digest("hex");
if(actual!==expected)throw new Error(`SARHAD payload checksum mismatch: ${actual}`);

const manifest=JSON.parse(gunzipSync(gz).toString("utf8"));

rmSync(outDir,{recursive:true,force:true});
mkdirSync(outDir,{recursive:true});

let count=0;
for(const [urlPath,item] of Object.entries(manifest)){
  if(!item||typeof item.b64!=="string")continue;
  const relative=urlPath.replace(/^\/+/, "");
  if(!relative||relative.includes(".."))continue;
  const target=path.join(outDir,relative);
  mkdirSync(path.dirname(target),{recursive:true});
  writeFileSync(target,Buffer.from(item.b64,"base64"));
  count++;
}

if(!count||!readFileSync(path.join(outDir,"index.html")))throw new Error("SARHAD static output was not generated");

const editableRoot=path.join(root,"sarhad-inspect");
const editableFiles=[
  "index.html",
  "sw.js",
  "src/main.js",
  "src/phaser-reference.js",
  "src/styles.css",
  "src/game/config.js",
  "src/game/combat-state.js",
  "src/game/loadout-state.js",
  "src/game/diagnostics.js",
  "src/game/engine.js",
  "src/game/storage.js",
  "src/game/types.js",
  "assets/characters/captain-rudraa.svg",
  "assets/worlds/glacier-reach.svg",
  "assets/worlds/amber-desert.svg",
  "assets/worlds/pine-watch.svg",
  "assets/worlds/monsoon-pass.svg",
  "assets/worlds/glacier-line.svg",
  "assets/worlds/red-canyon.svg",
  "assets/worlds/night-ridge.svg"
];
for(const relative of editableFiles){
  const source=path.join(editableRoot,relative);
  if(!existsSync(source))throw new Error(`FX-01 editable source missing: ${relative}`);
  const target=path.join(outDir,relative);
  mkdirSync(path.dirname(target),{recursive:true});
  copyFileSync(source,target);
}
const phaserSource=path.join(root,"node_modules","phaser","dist","phaser.min.js");
if(!existsSync(phaserSource))throw new Error("Phaser 3 dependency missing; run npm install before build");
const phaserTarget=path.join(outDir,"vendor","phaser.min.js");
mkdirSync(path.dirname(phaserTarget),{recursive:true});
copyFileSync(phaserSource,phaserTarget);
console.log("Phaser 3.90.0 vendored into public/vendor for offline PWA use");

console.log(`FX-01 editable source overlay applied (${editableFiles.length} files)`);
console.log("FX-01 editable runtime source is authoritative");

writeFileSync(path.join(outDir,"robots.txt"),"User-agent: *\nAllow: /\n");
console.log(`Sarhad Sniper static build generated ${count} files from ${files.length} payload chunks`);
