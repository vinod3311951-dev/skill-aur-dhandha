import fs from 'node:fs';
import path from 'node:path';

const dir='dist/assets';
const files=fs.existsSync(dir)?fs.readdirSync(dir):[];
const js=files.filter(f=>f.endsWith('.js')).map(f=>({name:f,size:fs.statSync(path.join(dir,f)).size}));
const total=js.reduce((a,x)=>a+x.size,0);
const largest=Math.max(0,...js.map(x=>x.size));
const kb=n=>Math.round(n/1024);
const MAX_TOTAL=550*1024;
const MAX_CHUNK=220*1024;

console.log('JS chunks:',js.map(x=>x.name+' '+kb(x.size)+'KB').join(', '));
console.log('Total JS:',kb(total)+'KB');
console.log('Largest JS chunk:',kb(largest)+'KB');

if(total>MAX_TOTAL||largest>MAX_CHUNK){
  console.error('Bundle budget exceeded: total <= 550KB and largest chunk <= 220KB required.');
  process.exit(1);
}
