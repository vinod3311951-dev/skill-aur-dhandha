export type PartnerSurface={id:string;label:string;contexts:string[];examples:string[]};

// Architecture only: no commercial partner is surfaced until independently verified.
export const partnerSurfaces:PartnerSurface[]=[
{id:'skills',label:'Skills & learning tools',contexts:['learn','skill','course','creator','digital'],examples:['course providers','practice tools','software','creator tools']},
{id:'farm',label:'Farm inputs & market-enablement tools',contexts:['farm','agriculture','farmer','nursery','produce'],examples:['approved equipment','packing/grading tools','logistics tools','farm productivity tools']},
{id:'home',label:'Home-business supplies',contexts:['home-based','home business','tiffin','baking','tailoring','beauty'],examples:['packaging','small equipment','business software','delivery/logistics tools']},
{id:'repair',label:'Repair & technical tools',contexts:['repair','mechanic','garage','solar','charging'],examples:['tools','safety equipment','diagnostic equipment','training']},
{id:'manufacturing',label:'Small manufacturing equipment',contexts:['manufacturing','machine','processing','recycling'],examples:['machines','packaging equipment','safety equipment','maintenance']},
{id:'digital',label:'Digital business tools',contexts:['digital','online','marketing','website','bookkeeping'],examples:['software','hosting','design tools','accounting tools']},
{id:'market',label:'Market enablement',contexts:['market','retailer','distributor','commerce','sell'],examples:['catalogue tools','packaging','logistics','payments/business software']}
];

export const affiliateRules=[
'Keep official government routes free of affiliate tracking and visually separate from commercial resources.',
'Never sell leads, personal contact details, farmer/customer identities or application data.',
'Only surface a commercial partner after destination, commercial rights, disclosure wording and user relevance are verified.',
'Label every compensated link clearly as Affiliate / Sponsored before the user opens it.',
'Affiliate compensation must never change calculator results, comparison factors, eligibility guidance or opportunity ordering.',
'No fake discount, false scarcity, guaranteed income, guaranteed approval or unverified seller/product claim.',
'Prefer category-level choice and multiple credible options over pay-to-rank placement.',
'Record partner, destination, category, disclosure, verification date and commercial terms in a provenance register before release.'
] as const;

const text=()=>document.querySelector('#app main')?.textContent?.toLowerCase()||'';
const applicable=()=>partnerSurfaces.filter(s=>s.contexts.some(c=>text().includes(c))).slice(0,3);
function inject(){const main=document.querySelector<HTMLElement>('#app main');if(!main||main.querySelector('[data-affiliate-readiness]'))return;const matches=applicable();if(!matches.length)return;const card=document.createElement('article');card.className='card';card.dataset.affiliateReadiness='true';card.innerHTML=`<p class="eyebrow">RESOURCE OPTIONS</p><h2>Useful tools & services</h2><p>This area is partner-ready, but no paid recommendation is active yet. Future commercial links will be clearly labelled and kept separate from official government routes.</p><p><strong>Relevant categories:</strong> ${matches.map(x=>x.label).join(' · ')}</p><p><strong>Protection:</strong> no lead selling, no pay-to-rank results, and no change to calculators or comparisons because of commission.</p>`;const nav=main.querySelector('nav.nav');nav?main.insertBefore(card,nav):main.append(card);}
const observer=new MutationObserver(()=>queueMicrotask(inject));observer.observe(document.documentElement,{subtree:true,childList:true});queueMicrotask(inject);
