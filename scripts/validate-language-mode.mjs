import { readFileSync } from 'node:fs';

const main=readFileSync('src/main.ts','utf8');
const voice=readFileSync('src/voice.ts','utf8');
const language=readFileSync('src/language-service.ts','utf8');
const runtime=readFileSync('src/app-language-runtime.ts','utf8');
const api=readFileSync('api/bhashini.ts','utf8');

const checks=[
  ['App-wide runtime imported', main.includes("from './app-language-runtime'")],
  ['Regional selector includes appLanguages', main.includes('appLanguages.map')],
  ['Old split text and voice selectors removed', !main.includes('Text preference')&&!main.includes('voice-locale-select')&&!main.includes('Voice input language')],
  ['Unified copy covers typed interface and voice', main.includes('typed/displayed interface text')],
  ['Privacy and guidance disclaimer visible in core shell', main.includes('const legalNotice=()=>')&&main.includes('Guidance disclaimer')&&main.includes('Privacy:')],
  ['One language controls app and voice', main.includes('setAppLanguage')&&voice.includes('selectedAppLanguage().locale')],
  ['Voice recognition uses selected locale', voice.includes('recognition.lang=locale()')],
  ['Speech output uses selected locale', voice.includes('utterance.lang=locale()')],
  ['Language service follows selected app language', language.includes('selectedAppLanguage().locale')],
  ['BHASHINI secure proxy present', api.includes('BHASHINI_API_KEY')&&api.includes('BHASHINI_TRANSLATION_SERVICE_ID')],
  ['No client-side BHASHINI secret', !main.includes('BHASHINI_API_KEY')&&!runtime.includes('BHASHINI_API_KEY')&&!voice.includes('BHASHINI_API_KEY')],
  ['UI mutation observer translates new screens', runtime.includes('new MutationObserver')&&runtime.includes('scheduleTranslate')],
  ['Core navigation has local language fallback', runtime.includes("'Home'")&&runtime.includes("'Forward →'")],
  ['RTL languages supported', runtime.includes("found.code==='ur'||found.code==='ks'||found.code==='sd'")&&runtime.includes("lang.code==='ur'||lang.code==='ks'||lang.code==='sd'")]
];

let failed=false;
for(const [label,ok] of checks){
  console.log((ok?'PASS':'FAIL')+' — '+label);
  if(!ok)failed=true;
}
if(failed)process.exit(1);