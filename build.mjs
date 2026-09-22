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

// FX-23 functional repair layer.
// The original packaged game remains the source of truth; these deterministic patches fix
// mobile mission-card activation and provide a verification-only deep-level route.
const mainPath=path.join(outDir,"src","main.js");
let main=readFileSync(mainPath,"utf8");

const anchor="let resetArmed = false;";
if(!main.includes(anchor))throw new Error("Sarhad repair anchor missing: resetArmed");
main=main.replace(anchor, anchor+"\nconst FX23_VERIFICATION_MODE = new URLSearchParams(location.search).get('fx23') === '1';");

const worldUnlock="function worldUnlocked(worldId) {\n    if (worldId === 1)";
if(!main.includes(worldUnlock))throw new Error("Sarhad repair anchor missing: worldUnlocked");
main=main.replace(worldUnlock,"function worldUnlocked(worldId) {\n    if (FX23_VERIFICATION_MODE)\n        return true;\n    if (worldId === 1)");

const missionUnlock="function missionUnlocked(mission) {\n    if (!worldUnlocked(mission.worldId))";
if(!main.includes(missionUnlock))throw new Error("Sarhad repair anchor missing: missionUnlocked");
main=main.replace(missionUnlock,"function missionUnlocked(mission) {\n    if (FX23_VERIFICATION_MODE)\n        return true;\n    if (!worldUnlocked(mission.worldId))");

const bindAnchor="function handleVisibilityChange() {";
if(!main.includes(bindAnchor))throw new Error("Sarhad repair anchor missing: handleVisibilityChange");
const fallback=`
function handleMissionMapDelegatedClick(event) {
    const node = event.target instanceof Element
        ? event.target.closest('[data-mission-id],[data-world-id]')
        : null;
    if (!node)
        return;
    if (node instanceof HTMLButtonElement && node.disabled)
        return;

    if (screen === 'worldSelect' && node.hasAttribute('data-world-id')) {
        const worldId = Number(node.dataset.worldId);
        if (!Number.isFinite(worldId) || !worldUnlocked(worldId))
            return;
        selectedWorldId = worldId;
        renderMissionSelect();
        return;
    }

    if (screen === 'missionSelect' && node.hasAttribute('data-mission-id')) {
        const missionId = node.dataset.missionId ?? '';
        const mission = MISSIONS.find((item) => item.id === missionId);
        if (!mission || !missionUnlocked(mission))
            return;
        selectedMission = mission;
        selectedWorldId = mission.worldId;
        renderBriefing();
    }
}
app.addEventListener('click', handleMissionMapDelegatedClick);

`;
main=main.replace(bindAnchor,fallback+bindAnchor);

writeFileSync(mainPath,main);
console.log("Sarhad FX-23 functional repair applied: delegated mission-map taps + verification mode");
console.log(`Sarhad Sniper static build generated ${count} files from ${files.length} payload chunks`);
