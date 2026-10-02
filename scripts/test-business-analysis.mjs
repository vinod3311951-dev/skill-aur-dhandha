import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';

fs.rmSync('.tmp-analysis-test',{recursive:true,force:true});
execFileSync(process.platform==='win32'?'npx.cmd':'npx',['tsc','src/business-analysis-core.ts','--target','ES2022','--module','ES2022','--moduleResolution','Bundler','--outDir','.tmp-analysis-test'],{stdio:'inherit'});
const mod=await import(pathToFileURL(process.cwd()+'/.tmp-analysis-test/business-analysis-core.js').href+'?v='+Date.now());
const {analyseBusiness,businessSignals,businessTypes}=mod;
const assert=(ok,msg)=>{if(!ok)throw new Error(msg)};

assert(businessTypes.includes('Farmer / Agriculture'),'farmer business type');
assert(businessTypes.includes('Home-based'),'home business type');
assert(businessTypes.includes('Service / Skill'),'skill/service business type');
assert(businessSignals.length>=15,'15 diagnostic signals');

let gaps=analyseBusiness({
 sales:'Falling',customers:'Falling',margin:'Negative / loss',repeat:'Low',
 competition:'High',marketing:'Weak response',stock:'Too much unused stock/capacity',
 cash:'High',digital:'Weak / none',operations:'Frequent problems',
 pricing:'Mostly guesswork',supplier:'Frequent disruption',staff:'Overloaded',
 complaints:'High',measurement:'No regular tracking'
});
for(const expected of ['Sales','Customer flow','Margin','Retention','Competition','Marketing','Inventory / capacity','Cash flow','Digital discovery','Operations','Pricing','Supply','Capacity','Quality','Measurement']){
 assert(gaps.some(g=>g.area===expected),'missing gap '+expected);
}

gaps=analyseBusiness({
 sales:'Growing',customers:'Growing',margin:'Healthy',repeat:'Strong',
 competition:'Low',marketing:'Working well',stock:'Healthy',cash:'Low',
 digital:'Strong',operations:'Reliable',pricing:'Validated with customers/costs',
 supplier:'Reliable',staff:'Balanced',complaints:'Low',measurement:'Track key numbers weekly'
});
assert(gaps.length===0,'healthy signals should not fabricate gaps');

console.log('Business Analysis diagnostic tests PASS');
fs.rmSync('.tmp-analysis-test',{recursive:true,force:true});
