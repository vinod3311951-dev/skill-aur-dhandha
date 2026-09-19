// @ts-nocheck

  const app=document.querySelector('#app');
  const primarySelectors=[
    '#path-route-choice','#opportunity-select','#media-role','#guided-category-select',
    '#future-career','#machine-choice','#export-product'
  ].join(',');

  const esc=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c));
  const genericBusiness={label:'Udyam — official MSME registration',url:'https://udyamregistration.gov.in/',note:'Use the official Government of India portal; registration information and classifications can change.'};
  const ncs={label:'National Career Service',url:'https://www.ncs.gov.in/',note:'Government employment/career portal. Verify each listing, employer and current terms.'};
  const skillIndia={label:'Skill India / DGT',url:'https://dgt.skillindiadigital.gov.in/',note:'Official skilling route for course, ITI and training information.'};
  const fssai={label:'FSSAI FoSCoS',url:'https://foscos.fssai.gov.in/',note:'Official food-business registration/licensing route. Check requirements for the exact activity.'};
  const enam={label:'e-NAM',url:'https://enam.gov.in/',note:'Official National Agriculture Market route; local/APMC applicability and commodity coverage vary.'};
  const apeda={label:'APEDA AgriXchange',url:'https://agriexchange.apeda.gov.in/',note:'Official export-market information route for relevant agricultural and processed products.'};
  const mnre={label:'MNRE rooftop solar programme',url:'https://mnre.gov.in/en/grid-connected-solar-rooftop-programme/',note:'Official renewable-energy programme information; verify current scheme period, vendor and DISCOM requirements.'};
  const power={label:'Ministry of Power',url:'https://powermin.gov.in/',note:'Use current Ministry/DISCOM guidance for charging and electricity-related requirements.'};
  const parivahan={label:'Parivahan — driving licence services',url:'https://parivahan.gov.in/',note:'Official Ministry of Road Transport & Highways service route. Licence class, tests, fees and state procedures must be checked there.'};
  const nsws={label:'National Single Window System',url:'https://www.nsws.gov.in/',note:'Government business-approval discovery platform. Its guidance is not exhaustive legal clearance; verify the relevant authority too.'};

  function separateResearch(choice,context){
    const s=(choice+' '+context).toLowerCase();
    if(/driving|driver|delivery|logistics/.test(s))return false;
    if(/home-based|home business|from home/.test(s))return false;
    return true;
  }

  function profile(choice,context){
    const s=(choice+' '+context).toLowerCase();
    if(/government|scheme|subsidy|official route|portal/.test(s))return{
      fast:true,actions:['government'],sources:[genericBusiness],
      roadmap:[
        `Confirm the exact help or scheme you need for ${choice}.`,
        'Check eligibility on the official destination, not on an agent or copied page.',
        'Check current documents, fees if any, dates and geography directly on the portal.',
        'Open the official route and complete the process there.',
        'Return only if you need another route or a comparison.'
      ],
      research:[
        `${choice} is an information-led route, so speed and source authenticity matter more than a long calculator journey.`,
        'Do not treat third-party summaries as the authority for eligibility, deadlines or required documents.'
      ]};
    if(/course|training|learn|skill|iti|apprentice|tutor|teacher|education/.test(s))return{
      fast:/course|training|iti|apprentice/.test(s),actions:['learn','market','government'],sources:[skillIndia,ncs],
      roadmap:[
        `Define the exact capability or outcome you want from ${choice}.`,
        'Set your current level, time available and preferred learning mode before paying.',
        'Practise one small observable task and keep proof of work you have the right to share.',
        'Check real entry routes, employer/client expectations and any qualification requirement.',
        'Check training cost and time before committing.'
      ],
      research:[
        `For ${choice}, research actual India roles/clients, proof-of-skill expectations, entry routes and regional-language demand.`,
        'Separate course marketing claims from recognised qualification, apprenticeship, job or client evidence.',
        'Use current official training/career routes where applicable; no course can guarantee placement or income.'
      ]};
    if(/solar/.test(s))return{
      fast:false,actions:['paisa','market','learn','government'],sources:[mnre,genericBusiness],
      roadmap:[
        `Define whether ${choice} means sales, survey, installation, electrical work, maintenance or a combined service.`,
        'Map required technical capability, safety practice, tools/PPE, travel and any qualified-person dependency.',
        'Calculate tools, transport, working capital, customer-acquisition and after-sales service costs.',
        'Validate customer segments, roof/site suitability, DISCOM/vendor process and local competition.',
        'Run a small low-risk service/partner test before committing to inventory or a larger setup.'
      ],
      research:[
        `Research ${choice} against current rooftop-solar adoption, residential/commercial customer types and service demand in your target state.`,
        'Check the current MNRE/national-portal and DISCOM process, empanelment/vendor rules where relevant, technical standards and subsidy boundaries.',
        'Check installer scope, warranty/AMC, response time and customer-acquisition terms—not just panel price.'
      ]};
    if(/ev charging|charging station/.test(s))return{
      fast:false,actions:['paisa','market','learn','government'],sources:[power,genericBusiness],
      roadmap:[
        `Choose the ${choice} use case: public, workplace, fleet, destination or residential support.`,
        'Check site access, sanctioned load/power, charger type, civil work, networking, safety and maintenance capability.',
        'Model equipment, electrical upgrade, rent, demand charges, software/network and utilisation assumptions.',
        'Validate traffic/vehicle mix, nearby chargers, dwell time and realistic utilisation.',
        'Verify current Ministry/DISCOM/local requirements before capital spending.'
      ],
      research:[
        `For ${choice}, demand depends heavily on location, vehicle mix, dwell time and charger utilisation.`,
        'Research local charging density, electricity connection constraints, charger interoperability/payment needs and maintenance response.',
        'Use current Ministry of Power, DISCOM and local-body guidance rather than copied older charging norms.'
      ]};
    if(/farm|agri|mushroom|nursery|beekeep|vermicompost|dairy|poultry|seed|flower|produce/.test(s))return{
      fast:false,actions:['paisa','market','learn','government'],sources:[enam,apeda],
      roadmap:[
        `Define the crop/product/service and buyer for ${choice} before deciding scale.`,
        'Check local climate/season, water/input, disease/quality and production capability.',
        'Calculate production, post-harvest, grading/packing, transport, spoilage and working-capital costs.',
        'Validate mandi/FPO/retailer/institutional or direct-market routes and payment timing.',
        'Pilot at a manageable scale and record yield, rejection, realised price and repeat demand.'
      ],
      research:[
        `Research ${choice} using local agro-climatic suitability plus current mandi/FPO/retailer demand—not national averages alone.`,
        'Check seasonality, price volatility, post-harvest loss, quality specifications and buyer concentration.',
        'Use e-NAM/APEDA or other relevant official agriculture sources where the commodity/route fits.'
      ]};
    if(/food|tiffin|baking|pickle|spice|snack|tea|chai|breakfast|juice|chaat|catering|kitchen|meal/.test(s))return{
      fast:false,actions:['paisa','market','learn','government'],sources:[fssai,genericBusiness],
      roadmap:[
        `Define one narrow ${choice} offer and one starting customer group.`,
        'Specify menu/product, batch size, quality/hygiene routine, packaging and delivery/footfall model.',
        'Calculate ingredients, packaging, utilities, wastage, labour/time, delivery/platform and fixed costs.',
        'Test local demand, repeat purchase, competing offers and a realistic selling-price range.',
        'Verify current food-business requirements and run a small paid pilot before scaling.'
      ],
      research:[
        `For ${choice}, focus on local repeat demand, ticket size, daypart/seasonality, delivery radius and food-cost sensitivity.`,
        'Compare direct/local competitors and delivery-platform substitutes separately because their cost structures differ.',
        'Check current FSSAI/FoSCoS requirements for the exact food activity and operating model.'
      ]};
    if(/manufactur|packag|fabricat|product|candle|textile|furniture|recycl|waste/.test(s))return{
      fast:false,actions:['paisa','market','learn','government'],sources:[genericBusiness,nsws],
      roadmap:[
        `Define the exact product specification and buyer for ${choice}.`,
        'Map process steps, machine/manual route, inputs, utilities, safety, quality control and capacity.',
        'Calculate equipment, installation, rejects/wastage, labour, power, maintenance and working capital.',
        'Validate buyer specifications, minimum order behaviour, distribution and competing suppliers.',
        'Run samples or a small batch before buying higher-capacity equipment.'
      ],
      research:[
        `Research ${choice} by buyer specification, local input availability, capacity utilisation and distribution economics.`,
        'Check whether small-batch/manual production can validate demand before machinery purchase.',
        'Verify sector, safety, pollution/local-body, tax and MSME requirements applicable to the exact process.'
      ]};
    if(/driving|driver|delivery|logistics/.test(s))return{
      fast:false,actions:['paisa','learn','government'],sources:[parivahan,ncs],
      roadmap:[
        'Define the exact driving/logistics role for '+choice+': passenger, delivery, commercial vehicle, local route or platform-linked work.',
        'Check the correct licence/vehicle class, safety expectations, route/time demands and any employer/platform requirements.',
        'Calculate licence/training, travel, device, fuel/vehicle contribution and work-search costs that apply to your situation.',
        'Check employed, owner-driver and platform-linked routes without assuming earnings from advertised gross figures.',
        'Verify licence/service requirements on Parivahan and verify each employer/platform independently before paying or joining.'
      ],
      research:[
        'For '+choice+', the useful evidence is role availability, licence class, local route demand, work hours and cost structure rather than a generic market-size page.',
        'Use Parivahan for official licence services and NCS for employment discovery where relevant.'
      ]};
    if(/work|job|freelance|service|repair|mechanic|beauty|tailor|bookkeep|digital|design|writing|video|photograph|creator|content/.test(s))return{
      fast:false,actions:['paisa','market','learn'],sources:[ncs,skillIndia],
      roadmap:[
        `Define the exact paid outcome a customer or employer expects from ${choice}.`,
        'List proof of skill, tools/software, travel/workspace and any safety or qualification requirement.',
        'Create one small demonstrable sample or practice task you are allowed to share.',
        'Validate real employer/client demand, common entry route, competition and acquisition channel.',
        'Check time-to-readiness and recurring costs before committing.'
      ],
      research:[
        `For ${choice}, use live role/service demand, required skills, proof-of-work and client/employer channels rather than generic earnings claims.`,
        'Check local versus remote competition, platform dependence, customer acquisition cost/time and repeat/referral potential.',
        'Use NCS/Skill India or relevant institutional sources where they fit; verify every employer/client independently.'
      ]};
    return{
      fast:false,actions:['paisa','market','learn','government'],sources:[genericBusiness],
      roadmap:[
        `Define the exact customer outcome and offer for ${choice}.`,
        'List skills, tools, space, suppliers and operating constraints.',
        'Calculate setup, recurring and working-capital assumptions before spending.',
        'Validate demand, competition, route to customer and repeat-purchase potential.',
        'Pilot at low risk, measure the result and expand only from your own evidence.'
      ],
      research:[
        `Research ${choice} as its own opportunity: customer, geography, demand drivers, competition, operating model and entry barriers.`,
        'Use current India-specific sources where available; mark unavailable figures as not verified rather than substituting global numbers.',
        'Separate VERIFIED FACT, YOUR CALCULATION, ESTIMATE-SCENARIO and GUIDANCE.'
      ]};
  }

  const readProfile=()=>{try{return JSON.parse(localStorage.getItem('skill-aur-dhandha-choice-profile')||'{}')}catch{return {}}};
  const profileOptions={
    age:['17 or under','18–24','25–34','35–49','50–59','60+'],
    time:['A few hours a week','Part-time','Most days','Full-time'],
    budget:['Very low / use what I have','Under ₹20,000','₹20,000–₹50,000','₹50,000–₹1 lakh','Above ₹1 lakh'],
    mode:['Home','Local / field','Shop / workspace','Online / remote','Flexible']
  };
  const factors=['Upfront cost','Recurring cost','Demand evidence','Competition','Time to readiness','Skill gap','Tools / space','Customer / employer route','Compliance','Seasonality','Digital opportunity','Scalability','Dependency risk','Proof needed','Long-term usefulness'];

  const factorPrompt={
    'Upfront cost':'List only setup, equipment, deposit, training and launch costs that apply.',
    'Recurring cost':'List monthly inputs, rent, travel, software, utilities, maintenance and promotion that apply.',
    'Demand evidence':'Check current local/online buyer, customer, employer or client evidence for this exact choice.',
    'Competition':'Count direct alternatives and substitutes competing for the same customer or role.',
    'Time to readiness':'Estimate learning, setup, approvals and first-customer/employer time separately.',
    'Skill gap':'Separate skills already held from training, qualification or supervised practice still needed.',
    'Tools / space':'List device, machine, vehicle, workspace, storage, power or safety needs that genuinely apply.',
    'Customer / employer route':'Name the realistic route to buyers, clients, employers, platforms, retailers, FPOs or institutions.',
    'Compliance':'Check only rules relevant to the exact activity on current official sources.',
    'Seasonality':'Check whether demand, output, weather, festivals, crop cycles or hiring periods change the opportunity.',
    'Digital opportunity':'Check whether online discovery, delivery, remote work, digital payments or content can materially help.',
    'Scalability':'Ask what must increase first: time, people, equipment, inventory, space, capital or customers.',
    'Dependency risk':'Identify dependence on one platform, buyer, supplier, employer, season, machine, location or licence.',
    'Proof needed':'List the sample, portfolio, trial, licence, qualification, references or product proof users expect.',
    'Long-term usefulness':'Check whether the skill, customer need or operating capability remains useful beyond one short trend.'
  };

  let active=null;
  const FLOW_RETURN_KEY='skill-aur-dhandha-choice-flow-return';

  function saveFlowReturn(){
    if(!active)return;
    try{sessionStorage.setItem(FLOW_RETURN_KEY,JSON.stringify(active));}catch{}
  }

  function clearFlowReturn(){
    try{sessionStorage.removeItem(FLOW_RETURN_KEY);}catch{}
  }

  function restoreFlowReturn(){
    if(!app)return false;
    let saved=null;
    try{saved=JSON.parse(sessionStorage.getItem(FLOW_RETURN_KEY)||'null');}catch{}
    if(!saved?.choice)return false;
    active=saved;
    app.innerHTML='<main class="shell" data-choice-active="true"><header><p class="eyebrow">Your practical plan</p><h1>'+esc(active.choice)+'</h1><p>Back to where you left off.</p></header><section data-choice-flow="true"></section></main>';
    renderStage();
    clearFlowReturn();
    return true;
  }

  function selectedChoice(select){
    const option=select.selectedOptions[0];
    if(!option)return '';
    const text=(option.textContent||'').replace(/^Suggested · /,'').trim();
    if(!select.value||/choose|select|skip|not sure|other\s*\/\s*enter|custom/i.test(text))return '';
    return text;
  }

  function actionButton(action){
    const map={paisa:['Calculate costs → Paisa Check','open-paisa-business'],market:['Check market → Find My Market','open-market']};
    const x=map[action];if(!x)return '';
    return '<button type="button" class="choice" data-choice-action="'+x[1]+'">'+x[0]+'<span>›</span></button>';
  }

  function profileField(key,label,value){
    return '<label>'+label+'<select data-choice-profile="'+key+'"><option value="">Optional</option>'+profileOptions[key].map(x=>'<option '+(value===x?'selected':'')+'>'+esc(x)+'</option>').join('')+'</select></label>';
  }

  function relevantProfileKeys(choice,context){
    const s=(choice+' '+context).toLowerCase();
    if(/course|training|learn|skill|iti|apprentice|tutor|teacher|education/.test(s))return ['time','budget','mode'];
    if(/driving|driver|delivery|logistics/.test(s))return ['age','time','budget'];
    if(/farm|agri|mushroom|nursery|beekeep|vermicompost|dairy|poultry|seed|flower|produce/.test(s))return ['time','budget','mode'];
    if(/food|tiffin|baking|pickle|spice|snack|tea|chai|breakfast|juice|chaat|catering|kitchen|meal|manufactur|packag|fabricat|product|candle|textile|furniture|recycl|waste/.test(s))return ['time','budget','mode'];
    if(/work|job|freelance|service|repair|mechanic|beauty|tailor|bookkeep|digital|design|writing|video|photograph|creator|content/.test(s))return ['time','budget','mode'];
    return ['age','time','budget','mode'];
  }

  const profileLabels={age:'Age group',time:'Time available',budget:'Starting budget',mode:'Preferred operating mode'};

  function stageList(flow){
    if(flow.p.fast)return ['plan','actions','next'];
    const list=['profile','plan','actions'];
    if(flow.showResearch)list.push('research');
    list.push('next');
    return list;
  }

  function genericResearchPanels(main,hidden){
    for(const panel of main.querySelectorAll('.research-panel'))panel.hidden=hidden;
    for(const button of main.querySelectorAll('button.choice')){
      if(/needs\s*&\s*requirements/i.test(button.textContent||''))button.hidden=true;
    }
  }

  function []{
    return [...select.options].map(o=>(o.textContent||'').replace(/^Suggested · /,'').trim()).filter(x=>x&&x!==choice&&!/choose|select|skip|not sure|other \/ enter/i.test(x)).slice(0,40);
  }

  function begin(select){
    if(!app)return;
    const main=app.querySelector('main');if(!main)return;
    const choice=selectedChoice(select);
    genericResearchPanels(main,true);
    if(!choice){exitFlow(false);return;}
    const context=[main.querySelector('.eyebrow')?.textContent||'',main.querySelector('h1')?.textContent||''].join(' ');
    const p=profile(choice,context);
    active={
      choice,
      context,
      p,
      showResearch:separateResearch(choice,context),
      selectId:select.id,
      options:[],
      stage:0
    };
    main.dataset.choiceActive='true';
    renderStage();
  }

  function beginCustom(choice,context='Custom choice',options=[]){
    if(!app||!choice)return;
    const main=app.querySelector('main');if(!main)return;
    const clean=String(choice).trim();if(!clean)return;
    const p=profile(clean,context);
    active={choice:clean,context,p,showResearch:separateResearch(clean,context),selectId:'custom',options,stage:0};
    genericResearchPanels(main,true);
    main.dataset.choiceActive='true';
    renderStage();
  }

  function flowHost(){
    if(!app)return null;
    let host=app.querySelector('[data-choice-flow]');
    if(host)return host;
    const main=app.querySelector('main');if(!main)return null;
    host=document.createElement('section');
    host.setAttribute('data-choice-flow','true');
    const panel=main.querySelector('.dropdown-panel')||main.querySelector('.card');
    panel?.insertAdjacentElement('afterend',host);
    return host;
  }

  function renderStage(){
    if(!active||!app)return;
    const host=flowHost();if(!host)return;
    const stages=stageList(active);
    active.stage=Math.max(0,Math.min(active.stage,stages.length-1));
    const key=stages[active.stage];
    const saved=readProfile();
    const labels={profile:'B · Tell us a little',plan:'C · Your practical plan',actions:'D · What can I do now?',research:'E · Research (optional)',next:'Final · Your next useful step'};
    const progress=labels[key]||('Step '+(active.stage+1));
    let body='';

    if(key==='profile'){
      const keys=relevantProfileKeys(active.choice,active.context);
      body='<p class="eyebrow">'+progress+'</p><h2>Quick reality filters</h2><p>Only the broad details useful for this choice.</p>'+
        keys.map(k=>profileField(k,profileLabels[k],saved[k]||'')).join('');
    }

    if(key==='plan'){
      body='<p class="eyebrow">'+progress+'</p><h2>5-step plan for '+esc(active.choice)+'</h2><ol>'+active.p.roadmap.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ol>';
    }

    if(key==='actions'){
      body='<p class="eyebrow">'+progress+'</p><h2>What can I do now?</h2><p>Choose only what helps. These are shortcuts, not compulsory steps.</p><div class="actions">'+active.p.actions.map(actionButton).join('')+'</div><p><strong>Tip:</strong> Use Paisa Check for your own numbers and Find My Market for demand and buyer-route checks.</p>';
    }

    if(key==='research'){
      body='<p class="eyebrow">'+progress+'</p><h2>Research centred on '+esc(active.choice)+'</h2><p>This step is optional. Use it when you want deeper market context before deciding.</p>'+
        '<ul>'+active.p.research.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>'+
        active.p.sources.map(s=>'<a class="choice" href="'+s.url+'" target="_blank" rel="noopener noreferrer">'+esc(s.label)+'<span>↗</span></a><p class="source-note"><strong>Source note:</strong> '+esc(s.note)+'</p>').join('');
    }

    if(key==='next'){
      const noResearch=!active.showResearch;
      body='<p class="eyebrow">'+progress+'</p><h2>Next step for '+esc(active.choice)+'</h2>'+
        (noResearch?'<p><strong>Evidence mode:</strong> this practical path does not need a separate market-research page. Use your roadmap, your own calculations and the relevant official routes below.</p>':'<p>Your roadmap, calculations/actions and research are now available for this choice.</p>')+
        active.p.sources.map(s=>'<a class="choice" href="'+s.url+'" target="_blank" rel="noopener noreferrer">'+esc(s.label)+'<span>↗</span></a><p class="source-note"><strong>Source note:</strong> '+esc(s.note)+'</p>').join('')+
        '<button type="button" class="choice" data-choice-save>Save this choice on this device<span>›</span></button><p data-choice-save-status role="status"></p>';
    }

    const optional=key==='research'?'<button type="button" class="choice" data-flow-skip>Skip for now<span>›</span></button>':'';
    host.innerHTML='<article class="card choice-experience"><p><strong>Selected:</strong> '+esc(active.choice)+'</p>'+body+optional+
      '<nav class="flow-nav" aria-label="Choice journey"><button type="button" data-flow-back>← Back</button><button type="button" data-flow-home>Home</button><button type="button" data-flow-next '+(active.stage===stages.length-1?'disabled':'')+'>Forward →</button></nav></article>';

    const main=app.querySelector('main');
    if(main)genericResearchPanels(main,true);
    host.scrollIntoView({block:'start',behavior:'auto'});
  }

  function saveProfile(){
    if(!app)return;
    const host=app.querySelector('[data-choice-flow]');if(!host)return;
    const data={};
    for(const s of host.querySelectorAll('[data-choice-profile]'))data[s.dataset.choiceProfile]=s.value;
    localStorage.setItem('skill-aur-dhandha-choice-profile',JSON.stringify(data));
  }

  function gotoStage(index){
    if(!active)return;
    const stages=stageList(active);
    active.stage=Math.max(0,Math.min(index,stages.length-1));
    renderStage();
  }

  function exitFlow(clear=true){
    if(!app)return;
    app.querySelector('[data-choice-flow]')?.remove();
    const main=app.querySelector('main');if(main)delete main.dataset.choiceActive;
    if(clear){active=null;clearFlowReturn();}
  }

  document.addEventListener('change',e=>{
    const t=e.target;
    if(t?.matches?.(primarySelectors)){queueMicrotask(()=>{if(t.isConnected&&t.matches(primarySelectors))begin(t);});return;}
    if(t?.matches?.('[data-choice-profile]'))saveProfile();
  });

  document.addEventListener('click',e=>{
    const t=e.target;
    if(!t?.closest)return;

    if(t.closest('[data-flow-next]')){
      saveProfile();
      if(active)gotoStage(active.stage+1);
      return;
    }
    if(t.closest('[data-flow-skip]')){
      saveProfile();
      if(active)gotoStage(active.stage+1);
      return;
    }
    if(t.closest('[data-flow-home]')){
      location.href='/';
      return;
    }
    if(t.closest('[data-flow-back]')){
      if(!active)return;
      if(active.stage===0){exitFlow(false);return;}
      gotoStage(active.stage-1);
      return;
    }

    const action=t.closest('[data-choice-action]')?.dataset.choiceAction;
    if(action){saveFlowReturn();document.dispatchEvent(new Event(action));return;}

    if(t.closest('[data-choice-save]')){
      if(!active)return;
      localStorage.setItem('skill-aur-dhandha-last-choice',JSON.stringify({choice:active.choice,screen:active.context,savedAt:new Date().toISOString()}));
      const status=app?.querySelector('[data-choice-save-status]');if(status)status.textContent='Choice saved locally on this device.';
      return;
    }

  });

  const captureReturnIds=new Set(['market-back','paisa-business-back']);
  document.addEventListener('click',e=>{
    const target=e.target?.closest?.('button');if(!target||!captureReturnIds.has(target.id))return;
    let hasReturn=false;try{hasReturn=!!sessionStorage.getItem(FLOW_RETURN_KEY);}catch{}
    if(!hasReturn)return;
    e.preventDefault();e.stopImmediatePropagation();restoreFlowReturn();
  },true);

  document.addEventListener('skill-custom-choice',e=>{const d=e.detail||{};beginCustom(d.choice||'',d.context||'Custom choice',Array.isArray(d.options)?d.options:[]);});

  document.addEventListener('skill-flow-forward',()=>{
    if(!active)return;
    const stages=stageList(active);
    if(active.stage<stages.length-1)gotoStage(active.stage+1);
  });

  document.addEventListener('skill-flow-back',()=>{
    if(!active)return;
    if(active.stage===0)exitFlow(false);
    else gotoStage(active.stage-1);
  });

  window.addEventListener('pageshow',()=>{
    const main=app?.querySelector('main');
    if(main&&main.querySelector(primarySelectors))genericResearchPanels(main,true);
  });

  if(app){
    queueMicrotask(()=>{
      const main=app.querySelector('main');
      if(main&&main.querySelector(primarySelectors))genericResearchPanels(main,true);
    });
  }

export {};
