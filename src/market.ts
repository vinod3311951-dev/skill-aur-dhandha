const marketChoices=['Farm Produce','Product','My Skill/Service','Business Customers','Where Can I Sell?','Understand My Market'] as const;
let selectedMarket='';

const mic=()=>`<button class="mic" type="button" aria-label="Voice input"><span aria-hidden="true">●</span> Any Indian language</button>`;
const marketNav=(backId:string)=>`<nav class="nav" aria-label="Navigation"><button id="${backId}" type="button">← Back</button><button id="market-home" type="button">Home</button></nav>`;

const routes:Record<string,string[]>={
 'Farm Produce':['Local market','FPO','e-NAM','Retailer','Processor'],
 'Product':['Local market','Retailer','Distributor','Digital commerce','Institutional route'],
 'My Skill/Service':['Local market','Digital commerce','Institutional route'],
 'Business Customers':['Distributor','Institutional route','Processor'],
 'Where Can I Sell?':['Local market','Retailer','Distributor','Digital commerce','Institutional route'],
 'Understand My Market':['Local market','Retailer','Distributor','Digital commerce','Institutional route']
};

function renderMarket(){
 const app=document.querySelector<HTMLDivElement>('#app'); if(!app)return;
 app.innerHTML=`<main class="shell"><header><p class="eyebrow">Find My Market</p><h1>What do you want to find a market for?</h1><p>Choose the path that best matches what you want to sell or understand.</p></header><section class="actions">${marketChoices.map((x,i)=>`<button class="choice market-choice" data-market="${i}" type="button">${x}<span>›</span></button>`).join('')}</section><article class="card"><p><strong>Platform boundary:</strong> this navigator helps you understand routes to market. It does not create buyer/seller listings, chat, booking, payments, escrow or commissions.</p></article>${mic()}${marketNav('market-back')}</main>`;
}

function renderMarketDetails(){
 const app=document.querySelector<HTMLDivElement>('#app'); if(!app)return;
 const saved=JSON.parse(localStorage.getItem('skill-aur-dhandha-market-details')||'{}') as Record<string,string>;
 app.innerHTML=`<main class="shell"><header><p class="eyebrow">Find My Market · ${selectedMarket}</p><h1>Tell us the basics</h1><p>S21 — add only broad practical details. These inputs help route you; they do not create a listing or contact buyers.</p></header><form class="card" id="market-details"><label>Product or service<input name="offering" value="${saved.offering||''}" placeholder="What do you want to sell?"></label><label>Scale<input name="scale" value="${saved.scale||''}" placeholder="Example: small / local / growing"></label><label>Broad location<input name="location" value="${saved.location||''}" placeholder="City, district, state or broad area"></label><label>Timing<input name="timing" value="${saved.timing||''}" placeholder="Now, seasonal, occasional, ongoing..."></label><p>Use broad information only. Do not enter a home address, Aadhaar/PAN, bank details or payment information.</p><button class="choice" id="market-details-save" type="button">Save details<span>›</span></button></form><article class="card"><p>All four fields may be left blank in this bounded proof. Saving continues to relevant route categories.</p></article>${mic()}${marketNav('market-details-back')}</main>`;
}

function renderRoutes(){
 const app=document.querySelector<HTMLDivElement>('#app'); if(!app)return;
 const list=routes[selectedMarket]||routes['Understand My Market'];
 app.innerHTML=`<main class="shell"><header><p class="eyebrow">Find My Market · ${selectedMarket}</p><h1>Relevant routes to explore</h1><p>S22 — these are route categories to investigate, not buyer recommendations, listings or guaranteed sales channels.</p></header><section class="actions">${list.map((x,i)=>`<button class="choice market-route" data-route="${i}" type="button">${x}<span>›</span></button>`).join('')}</section><article class="card" id="route-note"><p>Select a route to see what it means. Evidence and practical checks follow in the next stage.</p></article><article class="card"><p><strong>Platform boundary:</strong> no buyer/seller authentication, listing, transaction, commission or guaranteed outcome is provided.</p></article>${mic()}${marketNav('market-routes-back')}</main>`;
}

function saveDetails(){
 const f=document.querySelector<HTMLFormElement>('#market-details');if(!f)return;
 localStorage.setItem('skill-aur-dhandha-market-details',JSON.stringify(Object.fromEntries(new FormData(f))));
 renderRoutes();
}

document.addEventListener('click',(event)=>{
 const target=event.target as HTMLElement;
 const homeMarket=target.closest<HTMLButtonElement>('[data-i="1"]');
 if(homeMarket){event.preventDefault();renderMarket();return;}
 const choice=target.closest<HTMLButtonElement>('.market-choice');
 if(choice){const index=Number(choice.dataset.market);const selected=marketChoices[index];if(selected){selectedMarket=selected;localStorage.setItem('skill-aur-dhandha-market-type',selected);renderMarketDetails();}return;}
 const route=target.closest<HTMLButtonElement>('.market-route');
 if(route){const list=routes[selectedMarket]||routes['Understand My Market'];const name=list[Number(route.dataset.route)];const out=document.querySelector<HTMLElement>('#route-note');if(name&&out)out.innerHTML=`<h2>${name}</h2><p>This is a route category to investigate for ${selectedMarket.toLowerCase()}. It is not a specific buyer recommendation or guaranteed sales channel.</p>`;return;}
 if(target.closest('#market-details-save')){saveDetails();return;}
 if(target.closest('#market-routes-back')){renderMarketDetails();return;}
 if(target.closest('#market-details-back')){renderMarket();return;}
 if(target.closest('#market-back')||target.closest('#market-home')){location.reload();}
});
