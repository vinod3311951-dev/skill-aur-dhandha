import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';

fs.rmSync('.tmp-calc-test',{recursive:true,force:true});
execFileSync(process.platform==='win32'?'npx.cmd':'npx',['tsc','src/business-calculator-core.ts','--target','ES2022','--module','ES2022','--moduleResolution','Bundler','--outDir','.tmp-calc-test'],{stdio:'inherit'});
const {calculateBusiness}=await import(pathToFileURL(process.cwd()+'/.tmp-calc-test/business-calculator-core.js').href+'?v='+Date.now());

const base={price:100,units:100,raw:2000,rent:1000,setup:5000,marketing:500,branding:250,packaging:500,distribution:250,transport:250,employees:1,salary:1000,utilities:250,otherStartup:1000};
const assert=(ok,msg)=>{if(!ok)throw new Error(msg)};

let r=calculateBusiness(base);
assert(r.sales===10000,'sales arithmetic');
assert(r.staff===1000,'staff arithmetic');
assert(r.fixedMonthly===3500,'fixed monthly arithmetic');
assert(r.monthly===6000,'monthly cost arithmetic');
assert(r.surplus===4000,'operating surplus arithmetic');
assert(r.startup===6000,'startup arithmetic');
assert(r.variablePerUnit===25,'variable cost per unit');
assert(r.unitContribution===75,'unit contribution');
assert(r.breakEvenUnits===47,'break-even rounding');
assert(Math.abs(r.recoveryMonths-1.5)<1e-9,'startup recovery');

r=calculateBusiness({...base,units:0});
assert(r.sales===0,'zero units gives zero sales');
assert(r.variablePerUnit===null,'zero units blocks per-unit calculation');
assert(r.breakEvenUnits===null,'zero units blocks break-even');
assert(r.edgeNotes.some(x=>x.includes('Units/orders are 0')),'zero units warning');

r=calculateBusiness({...base,price:0});
assert(r.margin===null,'zero sales blocks margin');
assert(r.breakEvenUnits===null,'zero price/non-positive contribution blocks break-even');
assert(r.edgeNotes.some(x=>x.includes('Selling price is 0')),'zero price warning');

r=calculateBusiness({...base,raw:10000,packaging:1000});
assert(r.surplus<0,'loss scenario stays negative');
assert(r.recoveryMonths===null,'loss blocks startup recovery');
assert(r.edgeNotes.some(x=>x.includes('operating shortfall')),'loss warning');
assert(r.edgeNotes.some(x=>x.includes('contribution is not positive')),'non-positive contribution warning');

r=calculateBusiness({...base,setup:0,otherStartup:0});
assert(r.startup===0,'zero startup supported');
assert(r.recoveryMonths===0,'zero startup recovery is zero with positive surplus');

console.log('Business calculator edge-case tests PASS');
fs.rmSync('.tmp-calc-test',{recursive:true,force:true});
