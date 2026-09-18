// @ts-nocheck

  const app=document.querySelector('#app');
  const primarySelectors=[
    '#path-route-choice','#opportunity-select','#media-role','#guided-category-select',
    '#market-type-select','#market-route-select','#learn-mode-select','#learn-topic-select',
    '#gov-mode-select','#future-career','#machine-choice','#export-product'
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
    if(/agri|farm|mushroom|nursery|beekeep|vermicompost|dairy|poultry|seed|flower|produce/.test(s))return false;
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
        'Compare training cost and time with a second path before committing.'
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
        'Compare local installers on scope, warranty/AMC, response time and customer acquisition—not just panel price.'
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
        'Compare employed, owner-driver and platform-linked routes without assuming earnings from advertised gross figures.',
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
        'Compare time-to-readiness and recurring costs with one alternative path.'
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
    age:['17 or under','18–24','25–34','35–49','50–59','60+','Skip'],
    time:['A few hours a week','Part-time','Most days','Full-time','Skip'],
    budget:['Very low / use what I have','Under ₹20,000','₹20,000–₹50,000','₹50,000–₹1 lakh','Above ₹1 lakh','Skip'],
    mode:['Home','Local / field','Shop / workspace','Online / remote','Flexible','Skip']
  };
  const profileField=(key,label,value)=>`<label>${label}<select data-choice-profile="${key}"><option value="">Skip / Not sure</option>${profileOptions[key].map(x=>`<option ${value===x?'selected':''}>${esc(x)}</option>`).join('')}</select></label>`;

  const factors=['Upfront cost','Recurring cost','Demand evidence','Competition','Time to readiness','Skill gap','Tools / space','Customer / employer route','Compliance','Seasonality','Digital opportunity','Scalability','Dependency risk','Proof needed','Long-term usefulness'];

  function actionButton(action){
    const map={paisa:['Calculate my assumptions → Paisa Check','open-paisa-business'],market:['Demand / competition → Find My Market','open-market'],learn:['Skill gap → Learn & Grow','open-learn'],government:['Compliance / support → Government Help','open-government-help']};
    const x=map[action];if(!x)return '';
    return `<button type="button" class="choice" data-choice-action="${x[1]}">${x[0]}<span>›</span></button>`;
  }

  function selectedChoice(select){
    const option=select.selectedOptions[0];
    if(!option)return '';
    const text=(option.textContent||'').replace(/^Suggested · /,'').trim();
    if(!select.value||/choose|select|skip|not sure/i.test(text))return '';
    return text;
  }

  function sync(){
    if(!app)return;
    const main=app.querySelector('main');if(!main)return;
    const select=main.querySelector(primarySelectors);
    const old=main.querySelector('[data-choice-experience]');
    for(const button of main.querySelectorAll('button.choice')){
      if(/needs\s*&\s*requirements/i.test(button.textContent||''))button.hidden=true;
    }
    if(!select){old?.remove();return;}
    const choice=selectedChoice(select);
    if(!choice){
      old?.remove();
      for(const p of main.querySelectorAll('.research-panel'))p.hidden=true;
      return;
    }
    const context=[main.querySelector('.eyebrow')?.textContent||'',main.querySelector('h1')?.textContent||''].join(' ');
    const p=profile(choice,context);
    const showResearch=separateResearch(choice,context);
    const savedProfile=readProfile();
    const profileNote=[
      savedProfile.age&&savedProfile.age!=='Skip'?`Age: ${savedProfile.age}`:'',
      savedProfile.time&&savedProfile.time!=='Skip'?`Time: ${savedProfile.time}`:'',
      savedProfile.budget&&savedProfile.budget!=='Skip'?`Budget: ${savedProfile.budget}`:'',
      savedProfile.mode&&savedProfile.mode!=='Skip'?`Mode: ${savedProfile.mode}`:''
    ].filter(Boolean).join(' · ');
    for(const panel of main.querySelectorAll('.research-panel'))if(!panel.hasAttribute('data-choice-experience'))panel.hidden=true;
    const options=[...select.options].map(o=>(o.textContent||'').replace(/^Suggested · /,'').trim()).filter(x=>x&&x!==choice&&!/choose|select|skip|not sure|other \/ enter/i.test(x));
    const compareOptions=options.slice(0,40);
    const html=`<article class="card choice-experience" data-choice-experience>
      <p class="eyebrow">YOUR SELECTED PATH · ${esc(choice)}</p>
      <h2>${p.fast?'Fast route':'5-step practice roadmap'}</h2>
      <ol>${p.roadmap.map(x=>`<li>${esc(x)}</li>`).join('')}</ol>
      ${p.fast?'':`<section class="choice-profile"><h3>Quick reality filters</h3><p>Broad answers only; skip anything you do not want to answer.</p>${profileField('age','Age group',savedProfile.age||'')}${profileField('time','Time available',savedProfile.time||'')}${profileField('budget','Starting budget',savedProfile.budget||'')}${profileField('mode','Preferred operating mode',savedProfile.mode||'')}${profileNote?`<p><strong>Current filters:</strong> ${esc(profileNote)}</p>`:''}</section>`}
      <h3>Useful next actions</h3>
      <div class="actions">${p.actions.map(actionButton).join('')}</div>
      <section class="choice-research">
        <h3>${showResearch?'Research centred on '+esc(choice):'Evidence & official routes'}</h3>
        ${showResearch?`<ul>${p.research.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:'<p>This path does not need a separate research page. Use the roadmap, your own calculations and the relevant official routes below.</p>'}
        ${p.sources.map(s=>`<a class="choice" href="${s.url}" target="_blank" rel="noopener noreferrer">${esc(s.label)}<span>↗</span></a><p class="source-note"><strong>Source note:</strong> ${esc(s.note)}</p>`).join('')}
      </section>
      ${compareOptions.length?`<section class="choice-compare"><h3>Compare with another choice</h3><label>Second choice<select data-choice-compare>${compareOptions.map(x=>`<option>${esc(x)}</option>`).join('')}</select></label><button type="button" class="choice" data-choice-compare-open>Compare these two<span>›</span></button><div data-choice-compare-result></div></section>`:''}
      <button type="button" class="choice" data-choice-save>Save this choice on this device<span>›</span></button>
      <p data-choice-save-status role="status"></p>
    </article>`;
    if(old)old.outerHTML=html;
    else{
      const panel=select.closest('.dropdown-panel')||select.closest('.card');
      panel?.insertAdjacentHTML('afterend',html);
    }
  }

  document.addEventListener('change',e=>{
    const t=e.target;
    if(t?.matches?.(primarySelectors)){queueMicrotask(sync);return;}
    if(t?.matches?.('[data-choice-profile]')){
      const box=t.closest('[data-choice-experience]');if(!box)return;
      const data={};
      for(const s of box.querySelectorAll('[data-choice-profile]'))data[s.dataset.choiceProfile]=s.value;
      localStorage.setItem('skill-aur-dhandha-choice-profile',JSON.stringify(data));
      queueMicrotask(sync);
    }
  });

  document.addEventListener('click',e=>{
    const t=e.target;
    const action=t?.closest?.('[data-choice-action]')?.dataset.choiceAction;
    if(action){document.dispatchEvent(new Event(action));return;}
    if(t?.closest?.('[data-choice-save]')){
      const main=app?.querySelector('main'),select=main?.querySelector(primarySelectors);if(!select)return;
      const choice=selectedChoice(select);if(!choice)return;
      localStorage.setItem('skill-aur-dhandha-last-choice',JSON.stringify({choice,screen:main?.querySelector('h1')?.textContent||'',savedAt:new Date().toISOString()}));
      const status=main?.querySelector('[data-choice-save-status]');if(status)status.textContent='Choice saved locally on this device.';
      return;
    }
    if(t?.closest?.('[data-choice-compare-open]')){
      const box=t.closest('[data-choice-experience]');if(!box)return;
      const main=app?.querySelector('main'),primary=main?.querySelector(primarySelectors),secondary=box.querySelector('[data-choice-compare]');
      const a=primary?selectedChoice(primary):'',b=secondary?.value||'';if(!a||!b)return;
      const result=box.querySelector('[data-choice-compare-result]');
      if(result)result.innerHTML=`<div class="table-wrap"><table><thead><tr><th>Factor</th><th>${esc(a)}</th><th>${esc(b)}</th></tr></thead><tbody>${factors.map(f=>`<tr><th>${esc(f)}</th><td>Validate for ${esc(a)} using current local/official evidence.</td><td>Validate for ${esc(b)} using the same evidence standard.</td></tr>`).join('')}</tbody></table></div><p><strong>GUIDANCE:</strong> compare the same evidence for both choices; no automatic winner is declared.</p>`;
      return;
    }
  });

  if(app){
    queueMicrotask(sync);
    document.addEventListener('click',()=>queueMicrotask(sync));
    document.addEventListener('change',()=>queueMicrotask(sync));
    window.addEventListener('pageshow',()=>queueMicrotask(sync));
  }

export {};
