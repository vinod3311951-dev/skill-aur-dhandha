import { readFileSync } from 'node:fs';

const main=readFileSync('src/main.ts','utf8');
const manifest=readFileSync('public/manifest.webmanifest','utf8');
const sw=readFileSync('public/sw.js','utf8');
const api=readFileSync('api/bhashini.ts','utf8');

const checks=[
  ['No new-tab targets', !main.includes('target="_blank"')],
  ['Exactly three action-plan steps', main.includes('return steps.slice(0,3);')],
  ['Business Sudhaar manifest branding', manifest.includes('"name":"Business Sudhaar"')||manifest.includes('"name": "Business Sudhaar"')],
  ['Business Sudhaar cache namespace', sw.includes("business-sudhaar-v2")],
  ['BHASHINI server proxy present', api.includes('BHASHINI_API_KEY')&&api.includes('BHASHINI_TRANSLATION_SERVICE_ID')],
  ['No browser-side BHASHINI credential', !main.includes('BHASHINI_API_KEY')&&!main.includes('BHASHINI_TRANSLATION_SERVICE_ID')],
  ['Same-tab official/vendor links', !main.includes('target="_blank"')],
  ['Deterministic local session key', main.includes("business-sudhaar-session-v1")]
];

let failed=false;
for(const [label,ok] of checks){
  console.log((ok?'PASS':'FAIL')+' — '+label);
  if(!ok)failed=true;
}
if(failed)process.exit(1);
