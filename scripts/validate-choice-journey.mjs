import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const failures=[];
const index=read('index.html');
const choice=read('src/choice-experience.ts');

for(const token of ['/src/choice-experience.ts']){
  if(!index.includes(token))failures.push('index.html missing '+token);
}
for(const removed of ['/src/self-marketing.ts','/src/research-lens.ts','/src/home-business-tips.ts']){
  if(index.includes(removed))failures.push('global injector still enabled: '+removed);
}
for(const token of ['5-step plan for','What can I do now?','Research centred on','data-choice-compare-open','Save this choice on this device','data-flow-next','data-flow-back']){
  if(!choice.includes(token))failures.push('choice experience missing '+token);
}
for(const token of ['#path-route-choice','#opportunity-select','#media-role','#guided-category-select','#future-career','#machine-choice','#export-product']){
  if(!choice.includes(token))failures.push('choice experience selector missing '+token);
}
for(const token of ['solar','ev charging','farm','food','manufactur','work|job|freelance']){
  if(!choice.toLowerCase().includes(token))failures.push('choice research resolver missing '+token);
}
if(choice.includes('new MutationObserver'))failures.push('choice experience must not use mutation-driven rerendering');
if(!choice.includes('Evidence mode:'))failures.push('practical paths need inline evidence mode');
if(!choice.includes('separateResearch'))failures.push('research-page applicability resolver missing');
if(!choice.includes("genericResearchPanels(main,true)"))failures.push('generic research must stay hidden before choice');
if(!choice.includes('data-flow-home'))failures.push('A-F flow missing Home control');
if(!choice.includes('data-flow-skip'))failures.push('optional compare/research skip control missing');
if(!choice.includes('skill-custom-choice')||!choice.includes('beginCustom'))failures.push('custom choices must use the shared A-F journey');
if(choice.includes('#gov-mode-select')||choice.includes('#learn-topic-select')||choice.includes('#market-type-select'))failures.push('utility dropdowns must not spawn nested A-F journeys');
if(failures.length){console.error('Choice journey contract failures:\n'+failures.map(x=>' - '+x).join('\n'));process.exit(1);}
console.log('Choice journey contract PASS: stable A-F flow with optional compare/research and shortcut utility destinations.');
