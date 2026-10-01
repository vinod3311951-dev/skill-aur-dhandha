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

// FX-01 source-of-truth overlay.
// The historical compressed payload remains the binary asset reservoir during the Audit-1 rebuild,
// while editable application source under sarhad-inspect becomes authoritative for HTML/CSS/JS/SW.
// This removes the need to keep patching generated output while preserving current production assets.
const editableRoot=path.join(root,"sarhad-inspect");
const editableFiles=[
  "index.html",
  "sw.js",
  "src/main.js",
  "src/styles.css",
  "src/game/config.js",
  "src/game/diagnostics.js",
  "src/game/engine.js",
  "src/game/storage.js",
  "src/game/types.js",
  "assets/characters/captain-rudraa.svg",
  "assets/worlds/glacier-reach.svg"
];
for(const relative of editableFiles){
  const source=path.join(editableRoot,relative);
  if(!existsSync(source))throw new Error(`FX-01 editable source missing: ${relative}`);
  const target=path.join(outDir,relative);
  mkdirSync(path.dirname(target),{recursive:true});
  copyFileSync(source,target);
}
console.log(`FX-01 editable source overlay applied (${editableFiles.length} files)`);

// FX-01: runtime fixes now live in editable sarhad-inspect source.
console.log("FX-01 editable runtime source is authoritative");


// Founder-approved early-build notice: patch only the generated static entry page.
const indexPath=path.join(outDir,"index.html");
let indexHtml=readFileSync(indexPath,"utf8");
if(indexHtml.split("</main>").length!==2||indexHtml.split("</head>").length!==2)
  throw new Error("SARHAD early-build footer insertion anchor missing or ambiguous");
const footer=`<p id="fx-early-build" style="
  position:relative;
  margin:0;
  padding:7px 10px 9px;
  text-align:center;
  font:11px system-ui,sans-serif;
  color:rgba(255,255,255,0.48);
  background:#08100d;
  pointer-events:none;
  ">Early build — not for public release.</p>`;
indexHtml=indexHtml.replace("</main>","</main>\n"+footer);
writeFileSync(path.join(outDir,"robots.txt"),"User-agent: *\nDisallow: /\n");
writeFileSync(indexPath,indexHtml);
console.log(`Sarhad Sniper static build generated ${count} files from ${files.length} payload chunks`);
