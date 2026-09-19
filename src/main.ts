import './style.css';
import { calculateDiagnostic } from './diagnostic-engine';

type Issue = 'sales'|'customers'|'profit'|'growth'|'unknown'|'machine-select'|'machine-breakdown';
type BizType = 'home'|'manufacturing'|'retail'|'service'|'online'|'other';
type Step = 'home'|'issue'|'history'|'question'|'faults'|'solution'|'machine'|'research'|'done';

type AnswerMap = Record<string,string>;

const root=document.querySelector<HTMLDivElement>('#app');
if(!root) throw new Error('App root missing');
const app=root;

const KEY='business-sudhaar-session-v1';
const LANG_KEY='business-sudhaar-language';
const langMeta={
  en:{locale:'en-IN',label:'English'},hi:{locale:'hi-IN',label:'हिन्दी'},bn:{locale:'bn-IN',label:'বাংলা'},
  gu:{locale:'gu-IN',label:'ગુજરાતી'},kn:{locale:'kn-IN',label:'ಕನ್ನಡ'},ml:{locale:'ml-IN',label:'മലയാളം'},
  mr:{locale:'mr-IN',label:'मराठी'},ta:{locale:'ta-IN',label:'தமிழ்'},te:{locale:'te-IN',label:'తెలుగు'},
  pa:{locale:'pa-IN',label:'ਪੰਜਾਬੀ'},or:{locale:'or-IN',label:'ଓଡ଼ିଆ'},as:{locale:'as-IN',label:'অসমীয়া'},
  brx:{locale:'brx-IN',label:'Bodo'},doi:{locale:'doi-IN',label:'Dogri'},ks:{locale:'ks-IN',label:'Kashmiri'},
  kok:{locale:'kok-IN',label:'Konkani'},mai:{locale:'mai-IN',label:'Maithili'},mni:{locale:'mni-IN',label:'Manipuri (Meitei)'},
  ne:{locale:'ne-IN',label:'Nepali'},sa:{locale:'sa-IN',label:'Sanskrit'},sat:{locale:'sat-IN',label:'Santali'},sd:{locale:'sd-IN',label:'Sindhi'},
  ur:{locale:'ur-IN',label:'اردو'}
} as const;
type LangCode=keyof typeof langMeta;
const localCore:Record<string,Record<string,string>>={
  hi:{'← BACK':'← वापस','⌂ HOME':'⌂ होम','NEXT →':'आगे →','🎙 SPEAK':'🎙 बोलें','🔊 LISTEN':'🔊 सुनें','CHECK MY BUSINESS':'मेरे व्यवसाय की जाँच करें','Business Sudhaar':'बिज़नेस सुधार','BHASHINI language':'BHASHINI भाषा'},
  bn:{'← BACK':'← ফিরে যান','⌂ HOME':'⌂ হোম','NEXT →':'আগে →','🎙 SPEAK':'🎙 বলুন','🔊 LISTEN':'🔊 শুনুন','CHECK MY BUSINESS':'আমার ব্যবসা পরীক্ষা করুন','Business Sudhaar':'বিজনেস সুধার','BHASHINI language':'BHASHINI ভাষা'},
  gu:{'← BACK':'← પાછા','⌂ HOME':'⌂ હોમ','NEXT →':'આગળ →','🎙 SPEAK':'🎙 બોલો','🔊 LISTEN':'🔊 સાંભળો','CHECK MY BUSINESS':'મારો વ્યવસાય તપાસો','Business Sudhaar':'બિઝનેસ સુધાર','BHASHINI language':'BHASHINI ભાષા'},
  kn:{'← BACK':'← ಹಿಂದೆ','⌂ HOME':'⌂ ಮುಖಪುಟ','NEXT →':'ಮುಂದೆ →','🎙 SPEAK':'🎙 ಮಾತನಾಡಿ','🔊 LISTEN':'🔊 ಕೇಳಿ','CHECK MY BUSINESS':'ನನ್ನ ವ್ಯವಹಾರ ಪರಿಶೀಲಿಸಿ','Business Sudhaar':'ಬಿಸಿನೆಸ್ ಸುಧಾರ್','BHASHINI language':'BHASHINI ಭಾಷೆ'},
  ml:{'← BACK':'← പിന്നോട്ട്','⌂ HOME':'⌂ ഹോം','NEXT →':'മുന്നോട്ട് →','🎙 SPEAK':'🎙 സംസാരിക്കുക','🔊 LISTEN':'🔊 കേൾക്കുക','CHECK MY BUSINESS':'എന്റെ ബിസിനസ് പരിശോധിക്കുക','Business Sudhaar':'ബിസിനസ് സുധാർ','BHASHINI language':'BHASHINI ഭാഷ'},
  mr:{'← BACK':'← मागे','⌂ HOME':'⌂ होम','NEXT →':'पुढे →','🎙 SPEAK':'🎙 बोला','🔊 LISTEN':'🔊 ऐका','CHECK MY BUSINESS':'माझा व्यवसाय तपासा','Business Sudhaar':'बिझनेस सुधार','BHASHINI language':'BHASHINI भाषा'},
  ta:{'← BACK':'← பின்','⌂ HOME':'⌂ முகப்பு','NEXT →':'அடுத்து →','🎙 SPEAK':'🎙 பேசுங்கள்','🔊 LISTEN':'🔊 கேளுங்கள்','CHECK MY BUSINESS':'என் வணிகத்தை சரிபார்க்கவும்','Business Sudhaar':'பிசினஸ் சுதார்','BHASHINI language':'BHASHINI மொழி'},
  te:{'← BACK':'← వెనక్కి','⌂ HOME':'⌂ హోమ్','NEXT →':'ముందుకు →','🎙 SPEAK':'🎙 మాట్లాడండి','🔊 LISTEN':'🔊 వినండి','CHECK MY BUSINESS':'నా వ్యాపారాన్ని తనిఖీ చేయండి','Business Sudhaar':'బిజినెస్ సుధార్','BHASHINI language':'BHASHINI భాష'},
  pa:{'← BACK':'← ਪਿੱਛੇ','⌂ HOME':'⌂ ਹੋਮ','NEXT →':'ਅੱਗੇ →','🎙 SPEAK':'🎙 ਬੋਲੋ','🔊 LISTEN':'🔊 ਸੁਣੋ','CHECK MY BUSINESS':'ਮੇਰਾ ਕਾਰੋਬਾਰ ਜਾਂਚੋ','Business Sudhaar':'ਬਿਜ਼ਨਸ ਸੁਧਾਰ','BHASHINI language':'BHASHINI ਭਾਸ਼ਾ'},
  or:{'← BACK':'← ପଛକୁ','⌂ HOME':'⌂ ହୋମ','NEXT →':'ଆଗକୁ →','🎙 SPEAK':'🎙 କୁହନ୍ତୁ','🔊 LISTEN':'🔊 ଶୁଣନ୍ତୁ','CHECK MY BUSINESS':'ମୋ ବ୍ୟବସାୟ ଯାଞ୍ଚ କରନ୍ତୁ','Business Sudhaar':'ବିଜନେସ ସୁଧାର','BHASHINI language':'BHASHINI ଭାଷା'},
  as:{'← BACK':'← পিছলৈ','⌂ HOME':'⌂ হোম','NEXT →':'আগলৈ →','🎙 SPEAK':'🎙 কওক','🔊 LISTEN':'🔊 শুনক','CHECK MY BUSINESS':'মোৰ ব্যৱসায় পৰীক্ষা কৰক','Business Sudhaar':'বিজনেছ সুধাৰ','BHASHINI language':'BHASHINI ভাষা'},
  ur:{'← BACK':'← واپس','⌂ HOME':'⌂ ہوم','NEXT →':'آگے →','🎙 SPEAK':'🎙 بولیں','🔊 LISTEN':'🔊 سنیں','CHECK MY BUSINESS':'میرا کاروبار چیک کریں','Business Sudhaar':'بزنس سدھار','BHASHINI language':'BHASHINI زبان'}
};
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
  <header><p class="eyebrow">Business Sudhaar</p><h1>${title}</h1>${progress?`<p class="bs-progress">${progress}</p>`:''}<div class="bs-voice-tools"><button id="voice-input" type="button">🎙 SPEAK</button><button id="voice-read" type="button">🔊 LISTEN</button></div><p id="voice-status" class="bs-voice-status" aria-live="polite"></p></header>
  ${body}
  ${step!=='home'?nav():''}
</main>`;wireNav();wireVoice();const lang=(localStorage.getItem(LANG_KEY)||'en') as LangCode;document.documentElement.lang=langMeta[lang]?.locale||'en-IN';document.documentElement.dir=(lang==='ur'||lang==='ks'||lang==='sd')?'rtl':'ltr';if(lang!=='en')queueMicrotask(()=>translateVisibleScreen(lang));}
function nav(){return `<nav class="bs-nav" aria-label="Journey navigation"><button id="back" type="button">← BACK</button><button id="home" type="button">⌂ HOME</button><button id="next" type="button">NEXT →</button></nav>`;}
function wireNav(){
  const back=app.querySelector<HTMLButtonElement>('#back');
  const home=app.querySelector<HTMLButtonElement>('#home');
  const next=app.querySelector<HTMLButtonElement>('#next');
  back?.addEventListener('click',goBack);
  home?.addEventListener('click',()=>{step='home';save();render();});
  next?.addEventListener('click',goNext);
  if(next && ((step==='issue'&&!answers.issue)||(step==='history'&&historyIndex===-1&&!answers.businessType)||(step==='history'&&historyIndex>=0&&!answers[history[historyIndex].id])||(step==='question'&&!answers[relevantQuestions()[questionIndex]?.id]))) next.disabled=true;
}
function privacy(){return `<div class="bs-front-notices">
  <p class="home-legal"><strong>Privacy:</strong> No account, name, phone, email, exact address, documents, bank details or contact list are required. Core assessment stays on this device. If you use BHASHINI translation, only the text needed for that request is sent to the language-processing service. Business Sudhaar does not store audio.</p>
  <p class="home-legal"><strong>Business guidance disclaimer:</strong> Business Sudhaar gives deterministic guidance from the answers you choose. It is not an audited financial assessment and does not guarantee profits, business results, vendor quality, repairs, finance, schemes or government benefits. Verify external terms before acting.</p>
</div>`;}

function render(){
  if(step==='home'){
    shell('Improve one business problem',`
      <article class="card bs-hero"><h2>Choose. Check. Fix.</h2><p>Answer only what matters. Business Sudhaar calculates the shortfall silently, summarises the likely faults and gives one clear action plan.</p>
      <button class="choice bs-start" id="start" type="button">CHECK MY BUSINESS <span>›</span></button></article>
      <div class="bs-home-tools">
        <label class="bs-language-inline"><span>🌐 BHASHINI language</span><select id="home-language" aria-label="BHASHINI regional language">${languages.map(([code,label])=>`<option value="${code}" ${(localStorage.getItem(LANG_KEY)||'en')===code?'selected':''}>${label}</option>`).join('')}</select></label>
        <p class="bs-bhashini-note">Regional-language translation uses the BHASHINI server-side language layer when configured; English remains the safe fallback.</p>
      </div>
      ${privacy()}`);
    app.querySelector('#start')?.addEventListener('click',()=>{step='issue';save();render();});
    app.querySelector<HTMLSelectElement>('#home-language')?.addEventListener('change',e=>{const lang=(e.currentTarget as HTMLSelectElement).value as LangCode;localStorage.setItem(LANG_KEY,lang);document.documentElement.lang=langMeta[lang].locale;document.documentElement.dir=(lang==='ur'||lang==='ks'||lang==='sd')?'rtl':'ltr';render();});
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

function diagnostic(){
  return calculateDiagnostic(issue,bizType,answers);
}
function renderFaults(){
  const result=diagnostic();
  shell('What appears to be wrong',`<article class="card bs-result">
    <div class="score-ring"><strong>${result.signalScore}</strong><span>/100 ${esc(result.scoreLabel.toLowerCase())}</span></div>
    <p><strong>Calculated shortfall: ${result.shortfall} points.</strong> ${esc(result.formula)}</p>
    <h2>Fault summary</h2>
    <ol>${result.faults.map(x=>`<li>${esc(x)}</li>`).join('')}</ol>
    <div class="bs-dimension-list">${result.dimensions.filter(x=>x.pressure>0).slice(0,4).map(x=>`<div><span>${esc(x.label)}</span><strong>${x.pressure}% pressure</strong></div>`).join('')}</div>
  </article>`,'Assessment complete');
}
function renderSolution(){
  const result=diagnostic();
  shell('Your step-by-step plan',`<article class="card">
    <ol class="bs-plan">${result.actions.map(x=>`<li>${esc(x)}</li>`).join('')}</ol>
    <div class="metric-box"><span>Track one number</span><strong>${esc(result.metric)}</strong></div>
    <p class="caution">The actions are generated from the highest-pressure signals in this assessment, so different answer patterns can produce different priorities. Change one major lever at a time, then re-check.</p>
  </article>`,'Three priority actions');
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
  <section class="actions"><a class="choice" href="https://udyamregistration.gov.in/" rel="noopener">Udyam Registration — official MSME portal <span>›</span></a><a class="choice" href="https://champions.gov.in/" rel="noopener">MSME CHAMPIONS — guidance & grievance support <span>›</span></a><a class="choice" href="https://www.msme.gov.in/" rel="noopener">Ministry of MSME — schemes & programmes <span>›</span></a><a class="choice" href="https://samadhaan.msme.gov.in/" rel="noopener">MSME Samadhaan — delayed payments <span>›</span></a><a class="choice" href="https://sambandh.msme.gov.in/" rel="noopener">MSME Sambandh — public procurement <span>›</span></a></section>
  <p class="home-legal"><strong>Research disclaimer:</strong> External information can change. Verify eligibility, fees, terms, vendor claims and scheme details on the linked official/provider site before acting.</p>`,'Optional final layer');
}
const languages=(Object.entries(langMeta) as [LangCode,{locale:string;label:string}][]).map(([code,meta])=>[code,meta.label] as const);

async function translateBatch(texts:string[],targetLanguage:string,sourceLanguage='en'){
  if(targetLanguage===sourceLanguage||!texts.length)return texts;
  try{
    const response=await fetch('/api/bhashini',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({texts,sourceLanguage,targetLanguage})
    });
    const data=await response.json();
    return response.ok&&Array.isArray(data.translated)&&data.translated.length===texts.length?data.translated:texts;
  }catch{return texts;}
}

async function translateVisibleScreen(targetLanguage:string){
  if(targetLanguage==='en')return;
  const main=app.querySelector('main');
  if(!main)return;
  const nodes:Text[]=[];
  const walker=document.createTreeWalker(main,NodeFilter.SHOW_TEXT);
  while(walker.nextNode()){
    const node=walker.currentNode as Text;
    if(node.parentElement?.closest('select,option'))continue;
    const value=node.textContent?.trim()||'';
    if(value.length>1&&!/^[-–—›←→₹0-9/.:·]+$/.test(value))nodes.push(node);
  }
  const unique=[...new Set(nodes.map(n=>n.textContent?.trim()||''))].slice(0,40);
  const translated=await translateBatch(unique,targetLanguage);
  const map=new Map(unique.map((value,index)=>[value,(translated[index]!==value?translated[index]:localCore[targetLanguage]?.[value])||value]));
  for(const node of nodes){
    const raw=node.textContent||'';
    const trimmed=raw.trim();
    const value=map.get(trimmed);
    if(value&&value!==trimmed)node.textContent=raw.replace(trimmed,value);
  }
}


function selectedLang():LangCode{
  const value=(localStorage.getItem(LANG_KEY)||'en') as LangCode;
  return value in langMeta?value:'en';
}
function selectedLocale(){return langMeta[selectedLang()].locale;}
function normalizeVoice(s:string){return s.toLowerCase().replace(/[^a-z0-9\u0900-\u0d7f\u0600-\u06ff]+/g,' ').trim();}
function currentVoiceCandidates(){
  const out:{label:string;el:HTMLElement}[]=[];
  app.querySelectorAll<HTMLElement>('button[data-issue],button[data-biz],button[data-answer],#start,#back,#home,#next').forEach(el=>{
    let label='';
    if(el.dataset.answer)label=el.dataset.answer;
    else if(el.dataset.issue)label=issueChoices.find(x=>x.id===el.dataset.issue)?.label||'';
    else if(el.dataset.biz)label=businessTypes.find(x=>x.id===el.dataset.biz)?.label||'';
    else if(el.id==='start')label='check my business';
    else if(el.id==='back')label='back';
    else if(el.id==='home')label='home';
    else if(el.id==='next')label='next';
    if(label)out.push({label,el});
  });
  return out;
}
async function activateVoiceChoice(raw:string){
  const lang=selectedLang();
  const english=(await translateBatch([raw],'en',lang))[0]||raw;
  const heard=normalizeVoice(english);
  const candidates=currentVoiceCandidates();
  let best:{score:number;el:HTMLElement}|null=null;
  for(const item of candidates){
    const target=normalizeVoice(item.label);
    let score=heard===target?100:(heard.includes(target)||target.includes(heard)?80:0);
    if(!score){
      const a=new Set(heard.split(' ')),b=new Set(target.split(' '));
      const overlap=[...a].filter(x=>b.has(x)).length;
      score=overlap/Math.max(1,b.size)*60;
    }
    if(!best||score>best.score)best={score,el:item.el};
  }
  if(best&&best.score>=35){best.el.click();setVoiceStatus('');return;}
  setVoiceStatus(lang==='en'?'I could not match that choice. Please tap an option.':'Voice heard, but the choice could not be matched. Please tap an option.');
}
function setVoiceStatus(text:string){const el=app.querySelector<HTMLElement>('#voice-status');if(el)el.textContent=text;}
function startVoiceInput(){
  const w=window as typeof window & {SpeechRecognition?:new()=>any;webkitSpeechRecognition?:new()=>any};
  const Ctor=w.SpeechRecognition||w.webkitSpeechRecognition;
  if(!Ctor){setVoiceStatus('Voice recognition is not available in this browser.');return;}
  const recognition=new Ctor();
  recognition.lang=selectedLocale();
  recognition.interimResults=false;
  recognition.maxAlternatives=1;
  recognition.onstart=()=>setVoiceStatus('Listening…');
  recognition.onerror=()=>setVoiceStatus('Voice input could not be completed. You can still tap an option.');
  recognition.onresult=(event:any)=>{
    const transcript=event?.results?.[0]?.[0]?.transcript||'';
    setVoiceStatus(transcript?('Heard: '+transcript):'');
    if(transcript)void activateVoiceChoice(transcript);
  };
  recognition.start();
}
function speakScreen(){
  if(!('speechSynthesis' in window)){setVoiceStatus('Spoken output is not available in this browser.');return;}
  const main=app.querySelector('main');
  if(!main)return;
  const text=[...main.querySelectorAll<HTMLElement>('h1,h2,.bs-progress,.choice,.metric-box,li,.home-legal')]
    .filter(el=>!el.closest('.bs-nav'))
    .map(el=>el.innerText.trim()).filter(Boolean).slice(0,18).join('. ');
  if(!text)return;
  window.speechSynthesis.cancel();
  const utterance=new SpeechSynthesisUtterance(text);
  utterance.lang=selectedLocale();
  window.speechSynthesis.speak(utterance);
}
function wireVoice(){
  app.querySelector('#voice-input')?.addEventListener('click',startVoiceInput);
  app.querySelector('#voice-read')?.addEventListener('click',speakScreen);
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