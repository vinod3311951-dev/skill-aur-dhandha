import { readFileSync } from 'node:fs';

const main=readFileSync('src/main.ts','utf8');
const engine=readFileSync('src/diagnostic-engine.ts','utf8');
const style=readFileSync('src/style.css','utf8');
const manifest=readFileSync('public/manifest.webmanifest','utf8');
const sw=readFileSync('public/sw.js','utf8');
const api=readFileSync('api/bhashini.ts','utf8');

const checks=[
  ['No new-tab targets', !main.includes('target="_blank"')],
  ['Back/Home/Next nav present', main.includes('← BACK')&&main.includes('⌂ HOME')&&main.includes('NEXT →')],
  ['Three-column nav layout', /grid-template-columns:1fr 1fr 1fr/.test(style)],
  ['Exactly three prioritized actions', engine.includes('actions:actions.slice(0,3)')],
  ['Issue-weighted deterministic engine', engine.includes('const weights:Record<Issue')&&engine.includes('issue-weighted average')],
  ['Business Sudhaar manifest branding', manifest.includes('"name":"Business Sudhaar"')||manifest.includes('"name": "Business Sudhaar"')],
  ['Business Sudhaar cache namespace', sw.includes("business-sudhaar-v2")],
  ['BHASHINI visible on front page', main.includes('BHASHINI language')&&main.includes('bs-bhashini-note')],
  ['Voice controls visible', main.includes('voice-input')&&main.includes('voice-read')],
  ['Voice follows selected interface locale', main.includes('recognition.lang=selectedLocale()')&&main.includes('utterance.lang=selectedLocale()')],
  ['Regional core navigation fallback present', main.includes("'← BACK'")&&main.includes("'⌂ HOME'")&&main.includes("'NEXT →'")],
  ['Voice can activate current choices', main.includes('activateVoiceChoice')&&main.includes('currentVoiceCandidates')],
  ['Front-page privacy notice present', main.includes('<strong>Privacy:</strong>')],
  ['Front-page business guidance disclaimer present', main.includes('<strong>Business guidance disclaimer:</strong>')],
  ['BHASHINI server proxy present', api.includes('BHASHINI_API_KEY')&&api.includes('BHASHINI_TRANSLATION_SERVICE_ID')],
  ['No browser-side BHASHINI credential', !main.includes('BHASHINI_API_KEY')&&!main.includes('BHASHINI_TRANSLATION_SERVICE_ID')],
  ['Same-tab official/vendor links', !main.includes('target="_blank"')],
  ['Deterministic local session key', main.includes("business-sudhaar-session-v1")],
  ['Profile fields excluded from scoring', engine.includes("Business profile fields are not scored")],
  ['No runtime AI diagnosis', !main.toLowerCase().includes('openai')&&!engine.toLowerCase().includes('openai')]
];

let failed=false;
for(const [label,ok] of checks){
  console.log((ok?'PASS':'FAIL')+' — '+label);
  if(!ok)failed=true;
}
if(failed)process.exit(1);