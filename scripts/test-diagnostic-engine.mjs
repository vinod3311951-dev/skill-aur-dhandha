import { readFileSync } from 'node:fs';
import ts from 'typescript';

const source=readFileSync('src/diagnostic-engine.ts','utf8');
const js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;
const mod=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
const calc=mod.calculateDiagnostic;

const base={businessType:'retail',age:'1–3 years',model:'Shop / office',workers:'2–5 people',tracking:'Weekly'};

const scenarios={
  sales:{...base,trend:'Declining',sales:'Falling',customers:'Stable',repeat:'Some repeat',margin:'Healthy',pricing:'Within 3 months',marketing:'Mixed',operations:'Sometimes'},
  customers:{...base,trend:'Mostly stable',customers:'Falling',repeat:'Low repeat',marketing:'Almost none'},
  profit:{...base,trend:'Mostly stable',sales:'Stable',margin:'Negative',cash:'Often',pricing:'Never / not sure',operations:'Sometimes'},
  growth:{...base,trend:'Improving',sales:'Growing',customers:'Growing',repeat:'Strong',margin:'Healthy',cash:'Rarely',marketing:'Predictable',operations:'Very often',capacity:'No, capacity is tight'},
  machine:{...base,'machine-category':'Packaging / sealing / labelling','machine-impact':'Production is stopped','machine-downtime':'4–7 days','machine-service':'No known support','machine-warranty':'Out of warranty','machine-economics':'Above 40%'}
};

const results={
  sales:calc('sales','retail',scenarios.sales),
  customers:calc('customers','retail',scenarios.customers),
  profit:calc('profit','retail',scenarios.profit),
  growth:calc('growth','retail',scenarios.growth),
  machine:calc('machine-breakdown','manufacturing',scenarios.machine)
};

function assert(ok,label){if(!ok){console.error('FAIL — '+label);process.exitCode=1;}else console.log('PASS — '+label);}

for(const [name,r] of Object.entries(results)){
  assert(r.actions.length===3,name+' returns exactly three actions');
  assert(new Set(r.actions).size===3,name+' actions are unique');
  assert(r.faults.length>=1&&r.faults.length<=3,name+' returns concise faults');
  assert(Number.isFinite(r.signalScore)&&r.signalScore>=0&&r.signalScore<=100,name+' score bounded 0–100');
}

const signatures=Object.values(results).map(r=>r.actions.join('|'));
assert(new Set(signatures).size===signatures.length,'Different issue patterns do not repeat the same action plan');

const first=calc('profit','retail',scenarios.profit);
const second=calc('profit','retail',scenarios.profit);
assert(JSON.stringify(first)===JSON.stringify(second),'Same inputs produce identical deterministic output');

const changed=calc('profit','retail',{...scenarios.profit,margin:'Healthy',cash:'Rarely',pricing:'Within 3 months'});
assert(JSON.stringify(first)!==JSON.stringify(changed),'Material answer changes alter the result');

if(process.exitCode)process.exit(process.exitCode);
