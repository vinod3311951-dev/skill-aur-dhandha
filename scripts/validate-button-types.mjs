import fs from 'node:fs';
import path from 'node:path';

const root='src';
const files=fs.readdirSync(root).filter(name=>name.endsWith('.ts'));
const failures=[];
for(const name of files){
  const file=path.join(root,name);
  const text=fs.readFileSync(file,'utf8');
  const matches=[...text.matchAll(/<button(?![^>]*\btype=)[^>]*>/g)];
  for(const match of matches)failures.push(`${file}: button missing explicit type -> ${match[0]}`);
}
if(failures.length){
  console.error('Button type contract failures:\n'+failures.map(x=>' - '+x).join('\n'));
  process.exit(1);
}
console.log(`Button type contract PASS: ${files.length} TypeScript modules checked.`);
