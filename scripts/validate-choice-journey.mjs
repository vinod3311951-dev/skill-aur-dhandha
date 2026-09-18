import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const failures=[];
const index=read('index.html');
const choice=read('src/choice-experience.ts');
const nav=read('src/navigation-runtime.ts');

for(const token of ['/src/navigation-runtime.ts','/src/choice-experience.ts']){
  if(!index.includes(token))failures.push('index.html missing '+token);
}
for(const removed of ['/src/self-marketing.ts','/src/research-lens.ts','/src/home-business-tips.ts']){
  if(index.includes(removed))failures.push('global injector still enabled: '+removed);
}
for(const token of ['5-step practice roadmap','Useful next actions','Research centred on','Compare with another choice','Save this choice on this device']){
  if(!choice.includes(token))failures.push('choice experience missing '+token);
}
for(const token of ['#path-route-choice','#opportunity-select','#media-role','#market-type-select','#learn-topic-select','#gov-mode-select']){
  if(!choice.includes(token))failures.push('choice experience selector missing '+token);
}
for(const token of ['solar','ev charging','farm','food','manufactur','work|job|freelance']){
  if(!choice.toLowerCase().includes(token))failures.push('choice research resolver missing '+token);
}
for(const token of ['history.back','popstate','stopImmediatePropagation','skillDepth']){
  if(!nav.includes(token))failures.push('navigation runtime missing '+token);
}
if(failures.length){
  console.error('Choice journey contract failures:\n'+failures.map(x=>' - '+x).join('\n'));
  process.exit(1);
}
console.log('Choice journey contract PASS: contextual roadmap, research, actions, compare and mobile history runtime present.');
