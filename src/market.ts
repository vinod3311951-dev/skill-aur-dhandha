const marketChoices=['Farm Produce','Product','My Skill/Service','Business Customers','Where Can I Sell?','Understand My Market'] as const;
let selectedMarket='';

const mic=()=>`<button class="mic" type="button" aria-label="Voice input"><span aria-hidden="true">●</span> Any Indian language</button>`;
const marketNav=(backId:string)=>`<nav class="nav" aria-label="Navigation"><button id="${backId}" type="button">← Back</button><button id="market-home" type="button">Home</button></nav>`;

function renderMarket(){
 const app=document.querySelector<HTMLDivElement>('#app'); if(!app)return;
 app.innerHTML=`<main class="shell"><header><p class="eyebrow">Find My Market</p><h1>What do you want to find a market for?</h1><p>Choose the path that best matches what you want to sell or understand.</p></header><section class="actions">${marketChoices.map((x,i)=>`<button class="choice market-choice" data-market="${i}" type="button">${x}<span>›</span></button>`).join('')}</section><article class="card"><p><strong>Platform boundary:</strong> this navigator helps you understand routes to market. It does not create buyer/seller listings, chat, booking, payments, escrow or commissions.</p></article>${mic()}${marketNav('market-back')}</main>`;
}

function renderMarketDetails(){
 const app=document.querySelector<HTMLDivElement>('#app'); if(!app)return;
 const saved=JSON.parse(localStorage.getItem('skill-aur-dhandha-market-details')||'{}') as Record<string,string>;
 app.innerHTML=`<main class="shell"><header><p class="eyebrow">Find My Market · ${selectedMarket}</p><h1>Tell us the basics</h1><p>S21 — add only broad practical details. These inputs help route you; they do not create a listing or contact buyers.</p></header><form class="card" id="market-details"><label>Product or service<input name="offering" value="${saved.offering||''}" placeholder="What do you want to sell?"></label><label>Scale<input name="scale" value="${saved.scale||''}" placeholder="Example: small / local / growing"></label><label>Broad location<input name="location" value="${saved.location||''}" placeholder="City, district, state or broad area"></label><label>Timing<input name="timing" value="${saved.timing||''}" placeholder="Now, seasonal, occasional, ongoing..."></label><p>Use broad information only. Do not enter a home address, Aadhaar/PAN, bank details or payment information.</p><button class="choice" id="market-details-save" type="button">Save details<span>›</span></button></form><article class="card" id="market-details-result"><p>All four fields may be left blank in this bounded proof; S22 route cards are the next build stage.</p></article>${mic()}${marketNav('market-details-back')}</main>`;
}

function saveDetails(){const f=document.querySelector<HTMLFormElement>('#market-details');if(!f)return;localStorage.setItem('skill-aur-dhandha-market-details',JSON.stringify(Object.fromEntries(new FormData(f))));const out=document.querySelector<HTMLElement>('#market-details-result');if(out)out.innerHTML='<h2>Details saved on this device</h2><p>No account, marketplace listing or buyer contact was created. S22 relevant route cards are the next build stage.</p>';}

document.addEventListener('click',(event)=>{
 const target=event.target as HTMLElement;
 const homeMarket=target.closest<HTMLButtonElement>('[data-i="1"]');
 if(homeMarket){event.preventDefault();renderMarket();return;}
 const choice=target.closest<HTMLButtonElement>('.market-choice');
 if(choice){const index=Number(choice.dataset.market);const selected=marketChoices[index];if(selected){selectedMarket=selected;localStorage.setItem('skill-aur-dhandha-market-type',selected);renderMarketDetails();}return;}
 if(target.closest('#market-details-save')){saveDetails();return;}
 if(target.closest('#market-details-back')){renderMarket();return;}
 if(target.closest('#market-back')||target.closest('#market-home')){location.reload();}
});
