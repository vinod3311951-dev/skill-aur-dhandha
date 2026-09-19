import './style.css';

type Issue = 'sales'|'customers'|'profit'|'growth'|'unknown'|'machine-select'|'machine-breakdown';
type BizType = 'home'|'manufacturing'|'retail'|'service'|'online'|'other';
type Step = 'home'|'issue'|'history'|'question'|'faults'|'solution'|'machine'|'research'|'done';

type AnswerMap = Record<string,string>;

const root=document.querySelector<HTMLDivElement>('#app');
if(!root) throw new Error('App root missing');
const app=root;

const KEY='business-sudhaar-session-v1';
const LANG_KEY='business-sudhaar-language';
let step:Step='home';
let historyIndex=-1;
let questionIndex=0;
let bizType:BizType='other';
let issue:Issue='unknown';
let answers:AnswerMap={};

const issueChoices:{id:Issue;label:string;hint:string}[]=[
  {id:'sales',label:'Sales are down',hint:'Find where sales are slipping'},
  {id:'customers',label:'I need more customers',hint:'Check visibility, enquiries and repeat business'},
  {id:'profit',label:'Profit is too low',hint:'Check margin, costs and pricing'},
  {id:'growth',label:'I want to grow',hint:'Check whether the business is ready to expand'},
  {id:'machine-select',label:'I need to select a machine',hint:'For home business or manufacturing'},
  {id:'machine-breakdown',label:'A machine has broken down',hint:'Check repair, replacement and vendor routes'},
  {id:'unknown',label:"I don't know what is wrong",hint:'Run a broad business check'}
];

const businessTypes:{id:BizType;label:string}[]=[
  {id:'home',label:'Home business'},
  {id:'manufacturing',label:'Manufacturing unit'},
  {id:'retail',label:'Shop / retail'},
  {id:'service',label:'Service / skill business'},
  {id:'online',label:'Digital / online'},
  {id:'other',label:'Other'}
];

const history=[
  {id:'age',q:'How long has this business been operating?',o:['Less than 1 year','1–3 years','3–7 years','More than 7 years']},
  {id:'model',q:'Where does most of the work happen?',o:['From home','Shop / office','Workshop / factory','Mostly online','Mixed']},
  {id:'workers',q:'How many people usually work in the business?',o:['Just me','2–5 people','6–20 people','More than 20 people']},
  {id:'trend',q:'Compared with 6–12 months ago, business is…',o:['Improving','Mostly stable','Declining','Too irregular to tell']},
  {id:'tracking',q:'How closely do you track sales and major costs?',o:['Weekly','Monthly','Sometimes','Not tracked']}
];

type Q={id:string;q:string;o:string[];tags:Issue[]};
const questions:Q[]=[
  {id:'sales',q:'What best describes sales right now?',o:['Growing','Stable','Falling','Very irregular','Not tracked'],tags:['sales','profit','growth','unknown']},
  {id:'customers',q:'What best describes customer flow?',o:['Growing','Stable','Falling','Too dependent on a few customers','Not tracked'],tags:['sales','customers','growth','unknown']},
  {id:'repeat',q:'How strong is repeat business?',o:['Strong','Some repeat','Low repeat','Not tracked'],tags:['customers','sales','growth','unknown']},
  {id:'margin',q:'After direct costs, your margin feels…',o:['Healthy','Tight','Negative','Not calculated'],tags:['profit','sales','growth','unknown']},
  {id:'cash',q:'How often does cash feel short even when sales happen?',o:['Rarely','Sometimes','Often','Almost always','Not sure'],tags:['profit','growth','unknown']},
  {id:'pricing',q:'When did you last check whether prices cover current costs?',o:['Within 3 months','3–12 months ago','More than a year ago','Never / not sure'],tags:['profit','sales','unknown']},
  {id:'marketing',q:'How predictable are new enquiries?',o:['Predictable','Mixed','Weak','Almost none','Not tracked'],tags:['customers','sales','growth','unknown']},
  {id:'operations',q:'How often do delays, stock, quality or process problems affect delivery?',o:['Rarely','Sometimes','Often','Very often'],tags:['growth','profit','sales','unknown']},
  {id:'capacity',q:'Can the business handle more orders without major disruption?',o:['Yes comfortably','With small changes','No, capacity is tight','Not sure'],tags:['growth','unknown']},
  {id:'machine-category',q:'What will the machine mainly be used for?',o:['Food processing / preparation','Packaging / sealing / labelling','Cutting / stitching / printing','Fabrication / workshop work','Agriculture processing','Other / not sure'],tags:['machine-select','machine-breakdown']},
  {id:'machine-capacity',q:'What output level do you need?',o:['Home / small batch','Small commercial','Medium production','High / continuous production'],tags:['machine-select']},
  {id:'machine-budget',q:'What purchase budget band are you considering?',o:['Under ₹50,000','₹50,000–₹2 lakh','₹2–₹10 lakh','Above ₹10 lakh','Not sure yet'],tags:['machine-select']},
  {id:'machine-automation',q:'What level of automation do you prefer?',o:['Manual','Semi-automatic','Automatic','Not sure'],tags:['machine-select']},
  {id:'machine-power',q:'What power setup is available?',o:['Normal domestic supply','Three-phase supply','Either is possible','Not sure'],tags:['machine-select']},
  {id:'machine-condition',q:'Would you consider a used machine?',o:['New only','Used is okay if verified','Either','Not sure'],tags:['machine-select']},
  {id:'machine-impact',q:'How dependent is current production on this machine?',o:['Low','Moderate','High','Production is stopped'],tags:['machine-breakdown']},
  {id:'machine-downtime',q:'How much business time has already been lost?',o:['Less than a day','1–3 days','4–7 days','More than a week'],tags:['machine-breakdown']},
  {id:'machine-service',q:'Is authorised service / spare-part support available?',o:['Yes locally','Yes but slow','Unclear','No known support'],tags:['machine-breakdown']},
  {id:'machine-warranty',q:'What is the warranty/service status?',o:['Under warranty','Service contract only','Out of warranty','Not sure'],tags:['machine-breakdown']},
  {id:'machine-economics',q:'Compared with replacement cost, expected repair cost is…',o:['Below 20%','20–40%','Above 40%','Unknown'],tags:['machine-breakdown']}
];

function relevantQuestions(){const list=questions.filter(q=>q.tags.includes(issue));return issue==='unknown'?list.slice(0,8):list;}
function save(){localStorage.setItem(KEY,JSON.stringify({bizType,issue,answers,step,historyIndex,questionIndex}));}
function esc(s:string){return s.replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]||m));}
function shell(title:string,body:string,progress=''){app.innerHTML=`<main class="shell bs-shell">
  <header><p class="eyebrow">Business Sudhaar</p><h1>${title}</h1>${progress?`<p class="bs-progress">${progress}</p>`:''}</header>
  ${body}
  ${step!=='home'?nav():''}
</main>`;wireNav();}
function nav(){return `<nav class="bs-nav" aria-label="Journey navigation"><button id="back" type="button">← BACK</button><button id="next" type="button">NEXT →</button></nav>`;}
function wireNav(){
  const back=app.querySelector<HTMLButtonElement>('#back');
  const next=app.querySelector<HTMLButtonElement>('#next');
  back?.addEventListener('click',goBack);
  next?.addEventListener('click',goNext);
  if(next && ((step==='issue'&&!answers.issue)||(step==='history'&&historyIndex===-1&&!answers.businessType)||(step==='history'&&historyIndex>=0&&!answers[history[historyIndex].id])||(step==='question'&&!answers[relevantQuestions()[questionIndex]?.id]))) next.disabled=true;
}
function privacy(){return `<p class="home-legal"><strong>Privacy:</strong> No account, name, phone, email, exact address, documents, bank details or contact list are required. Core assessment stays on this device. If you use translation, only the text needed for that request is sent to our language-processing provider. Business Sudhaar does not store audio.</p>`;}

function render(){
  if(step==='home'){
    shell('Improve one business problem',`
      <article class="card bs-hero"><h2>Choose. Check. Fix.</h2><p>Answer only what matters. Business Sudhaar calculates the shortfall silently, summarises the likely faults and gives one clear action plan.</p>
      <button class="choice bs-start" id="start" type="button">CHECK MY BUSINESS <span>›</span></button></article>
      <div class="bs-home-tools"><button class="text-action" id="lang">🌐 Regional languages</button></div>
      ${privacy()}`);
    app.querySelector('#start')?.addEventListener('click',()=>{step='issue';save();render();});
    app.querySelector('#lang')?.addEventListener('click',renderLanguage);
    return;
  }
  if(step==='issue'){
    shell('What needs improvement?',`<section class="actions">${issueChoices.map(x=>`<button class="choice ${answers.issue===x.id?'selected':''}" data-issue="${x.id}" type="button"><span class="choice-copy"><strong>${x.label}</strong><small>${x.hint}</small></span><span>›</span></button>`).join('')}</section>`,'Step 1 · Choose one issue');
    app.querySelectorAll<HTMLButtonElement>('[data-issue]').forEach(b=>b.addEventListener('click',()=>{issue=b.dataset.issue as Issue;answers.issue=issue;save();render();}));
    return;
  }
  if(step==='history'){
    if(historyIndex===-1){
      const visibleTypes=(issue==='machine-select'||issue==='machine-breakdown')?businessTypes.filter(x=>x.id==='home'||x.id==='manufacturing'):businessTypes;
      shell('What kind of business is this?',`<section class="actions">${visibleTypes.map(x=>`<button class="choice ${answers.businessType===x.id?'selected':''}" data-biz="${x.id}" type="button">${x.label}<span>›</span></button>`).join('')}</section>`,`Business history · 1 of ${history.length+1}`);
      app.querySelectorAll<HTMLButtonElement>('[data-biz]').forEach(b=>b.addEventListener('click',()=>{bizType=b.dataset.biz as BizType;answers.businessType=bizType;save();render();}));
      return;
    }
    const item=history[historyIndex];
    shell(item.q,`<section class="actions">${item.o.map(o=>`<button class="choice ${answers[item.id]===o?'selected':''}" data-answer="${esc(o)}" type="button">${esc(o)}<span>›</span></button>`).join('')}</section>`,`Business history · ${historyIndex+2} of ${history.length+1}`);
    app.querySelectorAll<HTMLButtonElement>('[data-answer]').forEach(b=>b.addEventListener('click',()=>{answers[item.id]=b.dataset.answer||'';save();render();}));
    return;
  }
  if(step==='question'){
    const qs=relevantQuestions();
    const q=qs[questionIndex];
    shell(q.q,`<section class="actions">${q.o.map(o=>`<button class="choice ${answers[q.id]===o?'selected':''}" data-answer="${esc(o)}" type="button">${esc(o)}<span>›</span></button>`).join('')}</section>`,`Current condition · ${questionIndex+1} of ${qs.length}`);
    app.querySelectorAll<HTMLButtonElement>('[data-answer]').forEach(b=>b.addEventListener('click',()=>{answers[q.id]=b.dataset.answer||'';save();render();}));
    return;
  }
  if(step==='faults'){renderFaults();return;}
  if(step==='solution'){renderSolution();return;}
  if(step==='machine'){renderMachine();return;}
  if(step==='research'){renderResearch();return;}
  if(step==='done'){shell('Done for now',`<article class="card"><h2>Your plan is saved on this device</h2><p>Act on the steps first. Recheck the business after you have enough new information to compare.</p><button class="choice" id="restart" type="button">Start a fresh check <span>›</span></button></article>`);app.querySelector('#restart')?.addEventListener('click',()=>{localStorage.removeItem(KEY);answers={};issue='unknown';bizType='other';historyIndex=-1;questionIndex=0;step='home';render();});}
}

function score(){
  let risk=0, possible=0;
  const negative=['Falling','Very irregular','Declining','Too irregular to tell','Low repeat','Tight','Negative','Not calculated','Often','Almost always','Weak','Almost none','Very often','No, capacity is tight','Production is stopped','Unclear','No known support','Above 40%'];
  const warning=['Stable','Sometimes','Some repeat','Mixed','Moderate','High','More than a year ago','Never / not sure','Not tracked','Unknown'];
  for(const [key,v] of Object.entries(answers)){
    if(['issue','businessType','age','model','workers','machine-category','machine-capacity','machine-budget','machine-automation','machine-power','machine-condition'].includes(key))continue;
    possible+=2;
    if(negative.some(x=>v.includes(x)))risk+=2;
    else if(warning.some(x=>v.includes(x)))risk+=1;
  }
  const health=possible?Math.max(0,Math.round(100-(risk/possible)*100)):50;
  return {health,shortfall:100-health};
}
function faults(){
  const f:string[]=[];
  const a=answers;
  if(a.sales?.includes('Falling')||a.trend==='Declining')f.push('Sales momentum is weakening.');
  if(a.customers?.includes('Falling')||a.marketing?.includes('Weak')||a.marketing?.includes('Almost none'))f.push('Customer acquisition is not strong enough.');
  if(['Tight','Negative','Not calculated'].includes(a.margin))f.push('Margin visibility or margin strength needs attention.');
  if(a.cash==='Often'||a.cash==='Almost always')f.push('Cash pressure may be hiding the real operating shortfall.');
  if(a.pricing==='More than a year ago'||a.pricing==='Never / not sure')f.push('Pricing may not reflect current costs.');
  if(a.operations==='Often'||a.operations==='Very often')f.push('Operational friction is affecting delivery or cost.');
  if(a.capacity==='No, capacity is tight')f.push('Growth is constrained by current capacity.');
  if(a.tracking==='Not tracked')f.push('Weak measurement makes it harder to identify the true cause.');
  if(issue==='machine-breakdown')f.push('Machine downtime is creating an operational dependency that needs a repair-versus-replace decision.');
  if(issue==='machine-select')f.push('Machine selection should be driven by output need, serviceability and total operating cost—not only purchase price.');
  if(!f.length)f.push('No severe fault is obvious from the answers; the biggest opportunity is disciplined tracking and one measurable improvement.');
  return f.slice(0,5);
}
function renderFaults(){
  const s=score(); const fs=faults();
  shell('What appears to be wrong',`<article class="card bs-result"><div class="score-ring"><strong>${s.health}</strong><span>/100 health</span></div><p><strong>Calculated shortfall: ${s.shortfall} points.</strong> This is a deterministic guidance score from your answers, not an audited financial rating.</p><h2>Fault summary</h2><ol>${fs.map(x=>`<li>${esc(x)}</li>`).join('')}</ol></article>`,'Assessment complete');
}
function plan(){
  const fs=faults();
  const steps:string[]=[];
  if(fs.some(x=>x.includes('Sales')))steps.push('Separate sales by product/service and compare the last 4–8 weeks. Stop guessing which line is falling.');
  if(fs.some(x=>x.includes('Customer')))steps.push('Track enquiries, conversions and repeat customers for one week. Choose the weakest stage and improve that stage first.');
  if(fs.some(x=>x.includes('Margin')))steps.push('Recalculate selling price minus direct unit cost for the top-selling items. Flag items with weak or negative contribution.');
  if(fs.some(x=>x.includes('Cash')))steps.push('List weekly cash-in and unavoidable cash-out. Identify the largest timing mismatch before taking on new spending.');
  if(fs.some(x=>x.includes('Pricing')))steps.push('Recheck current input costs and compare margin versus markup before changing price.');
  if(fs.some(x=>x.includes('Operational')))steps.push('Write down the top three recurring delays/errors and remove one root cause before adding volume.');
  if(fs.some(x=>x.includes('capacity')))steps.push('Measure real weekly capacity and bottleneck time before committing to expansion.');
  if(issue==='machine-breakdown')steps.push('Record downtime, repair quote, warranty/service status and replacement cost; compare total business interruption before deciding.');
  if(issue==='machine-select')steps.push('Define required output, power/space, service support, consumables and budget before comparing machines.');
  while(steps.length<3)steps.push('Track one number weekly—sales, enquiries, gross margin or downtime—and compare after the change.');
  return steps.slice(0,3);
}
function renderSolution(){
  const metric=issue==='customers'?'Weekly qualified enquiries':issue==='profit'?'Gross margin on top products':issue.startsWith('machine')?'Machine downtime / productive hours':'Weekly sales';
  shell('Your step-by-step plan',`<article class="card"><ol class="bs-plan">${plan().map(x=>`<li>${esc(x)}</li>`).join('')}</ol><div class="metric-box"><span>Track one number</span><strong>${metric}</strong></div><p class="caution">Work through these steps before adding more complexity. Results depend on your inputs and business conditions.</p></article>`,'One action screen');
}
function needsMachine(){return (bizType==='home'||bizType==='manufacturing')&&(issue==='machine-select'||issue==='machine-breakdown');}
function machineSummary(){
  if(issue==='machine-select'){
    const values=[
      answers['machine-category'],
      answers['machine-capacity'],
      answers['machine-budget'],
      answers['machine-automation'],
      answers['machine-power'],
      answers['machine-condition']
    ].filter(Boolean);
    return values.length?values.join(' · '):'Use, capacity, budget, automation, power and condition should be confirmed before vendor search.';
  }
  const repair=answers['machine-economics'];
  const support=answers['machine-service'];
  if(repair==='Below 20%'&&support==='Yes locally')return 'Repair-first is worth checking because expected repair share is low and local support exists.';
  if(repair==='Above 40%'||support==='No known support')return 'Compare replacement seriously because repair economics or support may be weak.';
  return 'Compare one qualified repair quote with one replacement quote, including downtime and future service cost.';
}
function renderMachine(){
  const title=issue==='machine-breakdown'?'Repair, spares or replacement':'Find the right machine';
  shell(title,`<article class="card"><div class="metric-box"><span>${issue==='machine-select'?'Requirement summary':'Decision direction'}</span><strong>${esc(machineSummary())}</strong></div><h2>Before opening a vendor site</h2><ul><li>Confirm required output/capacity.</li><li>Check power, space and installation needs.</li><li>Confirm warranty, service response and spare-part availability.</li><li>Compare total operating cost—not only purchase price.</li><li>For breakdowns, avoid hazardous electrical/mechanical repair unless handled by a qualified technician.</li></ul></article>
  <section class="actions"><a class="choice" href="https://www.moglix.com/" rel="noopener sponsored">Search industrial products on Moglix <span>↗</span></a><a class="choice" href="https://www.indiamart.com/" rel="noopener">Search suppliers on IndiaMART <span>↗</span></a><a class="choice" href="https://www.tradeindia.com/Seller/Machinery/" rel="noopener">Search machinery on TradeIndia <span>↗</span></a></section>
  <p class="home-legal"><strong>Vendor disclaimer:</strong> Links are for discovery. Business Sudhaar does not verify sellers, machines, prices, repairs, warranties or transactions. A link may be marked sponsored/affiliate only when an approved tracking arrangement is configured.</p>`,'Vendor discovery · no lead collection');
}
function renderResearch(){
  shell('Research & official help',`<article class="card"><h2>Proven-source research</h2><p>Use these after the action plan when you need current sector, scheme or compliance information. Core diagnosis does not change based on these links.</p></article>
  <section class="actions"><a class="choice" href="https://udyamregistration.gov.in/" rel="noopener">Udyam Registration — official MSME portal <span>↗</span></a><a class="choice" href="https://champions.gov.in/" rel="noopener">MSME CHAMPIONS — guidance & grievance support <span>↗</span></a><a class="choice" href="https://www.msme.gov.in/" rel="noopener">Ministry of MSME — schemes & programmes <span>↗</span></a><a class="choice" href="https://samadhaan.msme.gov.in/" rel="noopener">MSME Samadhaan — delayed payments <span>↗</span></a></section>
  <p class="home-legal"><strong>Research disclaimer:</strong> External information can change. Verify eligibility, fees, terms, vendor claims and scheme details on the linked official/provider site before acting.</p>`,'Optional final layer');
}
function renderLanguage(){
  const saved=localStorage.getItem(LANG_KEY)||'English';
  const langs=['English','हिन्दी','বাংলা','ગુજરાતી','ಕನ್ನಡ','മലയാളം','मराठी','தமிழ்','తెలుగు','ਪੰਜਾਬੀ','ଓଡ଼ିଆ','অসমীয়া'];
  shell('Regional languages',`<article class="card"><label>Preferred language<select id="language">${langs.map(x=>`<option ${saved===x?'selected':''}>${x}</option>`).join('')}</select></label><p><strong>BHASHINI integration:</strong> this PWA is prepared for server-side BHASHINI speech/translation. Until credentials are configured, English remains the verified text path and device speech can be used as fallback.</p><p>No BHASHINI key will be exposed in browser code.</p></article>`);
  app.querySelector<HTMLSelectElement>('#language')?.addEventListener('change',e=>localStorage.setItem(LANG_KEY,(e.currentTarget as HTMLSelectElement).value));
}
function goNext(){
  if(step==='issue'){step='history';historyIndex=-1;}
  else if(step==='history'){
    if(historyIndex<history.length-1)historyIndex++; else {step='question';questionIndex=0;}
  } else if(step==='question'){
    const qs=relevantQuestions();
    if(questionIndex<qs.length-1)questionIndex++; else step='faults';
  } else if(step==='faults') step='solution';
  else if(step==='solution') step=needsMachine()?'machine':'research';
  else if(step==='machine') step='research';
  else if(step==='research') step='done';
  save();render();
}
function goBack(){
  if(step==='issue')step='home';
  else if(step==='history'){if(historyIndex>=0)historyIndex--;else step='issue';}
  else if(step==='question'){if(questionIndex>0)questionIndex--;else{step='history';historyIndex=history.length-1;}}
  else if(step==='faults'){step='question';questionIndex=Math.max(0,relevantQuestions().length-1);}
  else if(step==='solution')step='faults';
  else if(step==='machine')step='solution';
  else if(step==='research')step=needsMachine()?'machine':'solution';
  else if(step==='done')step='research';
  save();render();
}

function hydrate(){
  try{
    const s=JSON.parse(localStorage.getItem(KEY)||'{}');
    if(s && typeof s==='object'){bizType=s.bizType||bizType;issue=s.issue||issue;answers=s.answers||answers;step=s.step||step;historyIndex=Number.isInteger(s.historyIndex)?s.historyIndex:historyIndex;questionIndex=Number.isInteger(s.questionIndex)?s.questionIndex:questionIndex;}
  }catch{}
}
hydrate();

render();