const marketChoices=['Farm Produce','Product','My Skill/Service','Business Customers','Where Can I Sell?','Understand My Market'] as const;

function renderMarket(){
 const app=document.querySelector<HTMLDivElement>('#app');
 if(!app) return;
 app.innerHTML=`<main class="shell"><header><p class="eyebrow">Find My Market</p><h1>What do you want to find a market for?</h1><p>Choose the path that best matches what you want to sell or understand.</p></header><section class="actions">${marketChoices.map((x,i)=>`<button class="choice market-choice" data-market="${i}" type="button">${x}<span>›</span></button>`).join('')}</section><article class="card"><p><strong>Platform boundary:</strong> this navigator helps you understand routes to market. It does not create buyer/seller listings, chat, booking, payments, escrow or commissions.</p></article><button class="mic" type="button" aria-label="Voice input"><span aria-hidden="true">●</span> Any Indian language</button><nav class="nav" aria-label="Navigation"><button id="market-back" type="button">← Back</button><button id="market-home" type="button">Home</button></nav></main>`;
}

document.addEventListener('click',(event)=>{
 const target=event.target as HTMLElement;
 const homeMarket=target.closest<HTMLButtonElement>('[data-i="1"]');
 if(homeMarket){event.preventDefault();renderMarket();return;}
 const choice=target.closest<HTMLButtonElement>('.market-choice');
 if(choice){
  const index=Number(choice.dataset.market);
  const selected=marketChoices[index];
  if(selected){localStorage.setItem('skill-aur-dhandha-market-type',selected);}
  return;
 }
 if(target.closest('#market-back')||target.closest('#market-home')){location.reload();}
});
