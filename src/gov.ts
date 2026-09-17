const govModes=['Business Support','Jobs & Skills','Farmer Support','MSME Support','Financial Benefits','Registrations/Approvals','Not Sure'] as const;
let govMode='Not Sure';
const gmic=()=>`<button class="mic" type="button" aria-label="Voice input"><span aria-hidden="true">●</span> Any Indian language</button>`;
const gnav=(id:string)=>`<nav class="nav" aria-label="Navigation"><button id="${id}" type="button">← Back</button><button id="gov-home" type="button">Home</button></nav>`;
const explain:Record<string,string>={
 'Business Support':'Explore official routes that may help with starting, formalising or understanding a business. The right route depends on your activity, location and current rules.',
 'Jobs & Skills':'Explore official employment and skill-development gateways. Availability, eligibility and services vary by programme and location.',
 'Farmer Support':'Explore official agriculture and scheme-discovery routes. Crop, land, geography and programme rules can affect relevance.',
 'MSME Support':'Explore official MSME information and registration routes. Business type and current definitions or requirements matter.',
 'Financial Benefits':'Explore government benefit and scheme information. This app does not decide eligibility, sanction money or promise a benefit.',
 'Registrations/Approvals':'Explore official registration and approval gateways. Required registrations depend on the actual activity and jurisdiction.',
 'Not Sure':'Start with broad official scheme discovery, then narrow the route using your real activity and circumstances.'
};
type Route={name:string,url:string,note:string};
const routeMap:Record<string,Route[]>={
 'Business Support':[
  {name:'myScheme',url:'https://www.myscheme.gov.in/',note:'Government scheme discovery gateway; check the scheme page and official eligibility.'},
  {name:'National Single Window System',url:'https://www.nsws.gov.in/',note:'Official business approvals and clearances gateway; requirements depend on the proposed activity.'},
  {name:'Udyam Registration',url:'https://udyamregistration.gov.in/',note:'Official MSME registration portal; verify current requirements before proceeding.'}],
 'Jobs & Skills':[
  {name:'National Career Service',url:'https://www.ncs.gov.in/',note:'Official career and employment service gateway; listings and services are external to this app.'},
  {name:'Skill India Digital / DGT',url:'https://dgt.skillindiadigital.gov.in/',note:'Official skill-training gateway; check current course and participation details there.'},
  {name:'e-Shram',url:'https://eshram.gov.in/',note:'Official e-Shram portal; check current scope and registration conditions on the portal.'}],
 'Farmer Support':[
  {name:'myScheme',url:'https://www.myscheme.gov.in/',note:'Use filters to explore schemes that may be relevant; the app does not determine eligibility.'},
  {name:'Ministry of Agriculture & Farmers Welfare',url:'https://agriwelfare.gov.in/',note:'Official ministry information and programme gateway.'}],
 'MSME Support':[
  {name:'Udyam Registration',url:'https://udyamregistration.gov.in/',note:'Official MSME registration portal.'},
  {name:'Ministry of MSME',url:'https://msme.gov.in/',note:'Official ministry information on MSME programmes and initiatives.'},
  {name:'myScheme',url:'https://www.myscheme.gov.in/',note:'Scheme discovery; verify the individual scheme rules on the official destination.'}],
 'Financial Benefits':[
  {name:'myScheme',url:'https://www.myscheme.gov.in/',note:'Discover government schemes; potential relevance is not confirmation of eligibility or payment.'}],
 'Registrations/Approvals':[
  {name:'National Single Window System',url:'https://www.nsws.gov.in/',note:'Official approvals and clearances gateway.'},
  {name:'Udyam Registration',url:'https://udyamregistration.gov.in/',note:'Official MSME registration portal where relevant.'},
  {name:'FoSCoS / FSSAI',url:'https://foscos.fssai.gov.in/',note:'Official food-business licensing and registration system where food activity is involved.'}],
 'Not Sure':[
  {name:'myScheme',url:'https://www.myscheme.gov.in/',note:'Broad government scheme discovery gateway.'},
  {name:'National Single Window System',url:'https://www.nsws.gov.in/',note:'Business approval discovery where a business activity is involved.'}]
};
function govStart(){const a=document.querySelector<HTMLDivElement>('#app');if(!a)return;a.innerHTML=`<main class="shell"><header><p class="eyebrow">Government Help</p><h1>What kind of help are you exploring?</h1><p>S50 — choose a category. This app explains and routes; it does not process government applications.</p></header><section class="actions">${govModes.map((x,i)=>`<button class="choice gov-mode" data-gov="${i}" type="button">${x}<span>›</span></button>`).join('')}</section><article class="card"><p>Do not enter Aadhaar, PAN, bank details, passwords, OTPs or application credentials here.</p></article>${gmic()}${gnav('gov-back')}</main>`;}
function govExplain(){const a=document.querySelector<HTMLDivElement>('#app');if(!a)return;a.innerHTML=`<main class="shell"><header><p class="eyebrow">Government Help · ${govMode}</p><h1>What this category means</h1><p>S51 — plain-language orientation before you choose an external route.</p></header><article class="card"><p>${explain[govMode]}</p><p><strong>Important:</strong> programme rules can change. Treat this as guidance, not a determination of eligibility.</p></article><button class="choice" id="gov-routes" type="button">See potentially relevant routes<span>›</span></button>${gmic()}${gnav('gov-explain-back')}</main>`;}
function govRoutes(){const a=document.querySelector<HTMLDivElement>('#app');if(!a)return;const routes=routeMap[govMode]||routeMap['Not Sure'];a.innerHTML=`<main class="shell"><header><p class="eyebrow">Government Help · ${govMode}</p><h1>Potentially relevant routes</h1><p>S52 — these routes may be relevant. This is never definitive eligibility.</p></header>${routes.map((r,i)=>`<article class="card"><h2>${r.name}</h2><p>${r.note}</p><button class="choice gov-destination" data-route="${i}" type="button">View official destination<span>›</span></button></article>`).join('')}<article class="card"><p>Check current eligibility, documents, fees, deadlines and conditions on the official destination itself.</p></article>${gmic()}${gnav('gov-routes-back')}</main>`;}
function govDestination(index:number){const a=document.querySelector<HTMLDivElement>('#app');if(!a)return;const routes=routeMap[govMode]||routeMap['Not Sure'];const r=routes[index]||routes[0];a.innerHTML=`<main class="shell"><header><p class="eyebrow">Government Help · Official route</p><h1>${r.name}</h1><p>S53 — the official source is visible before you leave Skill Aur Dhandha.</p></header><article class="card"><p>${r.note}</p><p><strong>Official destination:</strong> ${r.url}</p></article><a class="choice" href="${r.url}" target="_blank" rel="noopener noreferrer">Open official destination<span>↗</span></a><article class="card"><p><strong>Boundary:</strong> Skill Aur Dhandha does not determine eligibility, submit applications, collect government fees, track application status or guarantee approval or benefits.</p></article>${gmic()}${gnav('gov-destination-back')}</main>`;}
document.addEventListener('click',e=>{const t=e.target as HTMLElement;const launch=t.closest<HTMLButtonElement>('[data-i="4"]');if(launch){e.preventDefault();govStart();return;}const m=t.closest<HTMLButtonElement>('.gov-mode');if(m){govMode=govModes[Number(m.dataset.gov)]||'Not Sure';govExplain();return;}if(t.closest('#gov-routes')){govRoutes();return;}const d=t.closest<HTMLButtonElement>('.gov-destination');if(d){govDestination(Number(d.dataset.route)||0);return;}if(t.closest('#gov-destination-back')){govRoutes();return;}if(t.closest('#gov-routes-back')){govExplain();return;}if(t.closest('#gov-explain-back')){govStart();return;}if(t.closest('#gov-back')||t.closest('#gov-home'))location.reload();});
