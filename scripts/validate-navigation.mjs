import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const checks=[
  ['src/main.ts',['Find My Path','Find My Market','Paisa Check','Learn & Grow','Government Help','data-i="0"','app-language','app-settings','utility-back','skill-return-to-path','voice-locale-select','skill-voice-locale']],
  ['src/path-routes.ts',['skill-return-to-path','open-media-entertainment','open-start-business','Compare before deciding','International / Abroad Jobs — Official Route']],
  ['src/guided-filters.ts',['skill-return-to-path','open-start-business','Skip / Not sure']],
  ['src/possibilities.ts',['s13-back','s13-home','business-journey-back','business-compare-picker-back','business-compare-back','farm-market-routes','data-machine-explorer','open-paisa-business']],
  ['src/manufacturing-machines.ts',['machine-budget','machine-detail-back']],
  ['src/market.ts',['market-back','market-home','market-routes-back','market-checks-back','market-compare-picker-back','market-compare-back']],
  ['src/paisa.ts',['paisa-back','paisa-home','paisa-input-back','paisa-result-back','paisa-whatif-back','paisa-report-back','paisa-business-back','paisa-business-result-back','paisa-csv','paisa-business-export','paisa-business-print']],
  ['src/learn.ts',['learn-roadmap-back','learn-readiness-back','open-ai-learning','open-future-careers']],
  ['src/ai-learning.ts',['open-future-careers','open-learn']],
  ['src/future-careers.ts',['future-back','future-home','future-detail-back','future-save','open-learn']],
  ['src/media-entertainment.ts',['media-back','media-home','media-save','media-paisa']],
  ['src/gov.ts',['gov-mode-select','gov-home']],
  ['src/export-affiliate-opportunities.ts',['export-back','export-home','export-detail-back','open-export-affiliate-opportunities']],
  ['src/export-market-bridge.ts',['open-export-market-bridge','open-export-affiliate-opportunities']],
  ['src/business-analysis.ts',['Business Analysis','Find my business gaps','ba-back','ba-home','ba-paisa','ba-print','ba-export','Choose current condition']]
];

const failures=[];
for(const [file,tokens] of checks){
  const text=read(file);
  for(const token of tokens) if(!text.includes(token)) failures.push(`${file}: missing ${token}`);
}
const index=read('index.html');
for(const module of ['main','voice','language-service','self-marketing','home-business-tips','affiliate-readiness','path-routes','guided-filters','possibilities','manufacturing-machines','media-entertainment','future-careers','export-affiliate-opportunities','export-market-bridge','market','paisa','learn','ai-learning','gov']){
  if(!index.includes(`/src/${module}.ts`)) failures.push(`index.html: missing /src/${module}.ts`);
}
if(failures.length){
  console.error('Navigation contract failures:\n'+failures.map(x=>' - '+x).join('\n'));
  process.exit(1);
}
console.log(`Navigation contract PASS: ${checks.length} modules plus index shell.`);
