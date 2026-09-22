import { readdirSync, readFileSync, rmSync, mkdirSync, writeFileSync } from "node:fs";
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
console.log(`Sarhad Sniper static build generated ${count} files from ${files.length} payload chunks`);
