const tips=[
['Start with a narrow offer','Choose one product/service and one likely customer group before adding varieties.'],
['Use existing space carefully','List the space, storage, water/power, noise, hygiene, access and family constraints before buying equipment.'],
['Pilot before fixed spending','Test a small batch or limited service schedule before committing to rent, machinery, large inventory or advertising.'],
['Calculate the full cost','Include materials/stock, packaging, utilities, delivery, platform fees, marketing, rework/wastage, equipment and your time.'],
['Separate household and business assumptions','Keep a simple business record even when the activity runs from home; do not treat household cash as business profit.'],
['Make it easy to discover you','Use truthful social-media posts, local digital listings and messaging channels where appropriate. Show the offer, service area/delivery reach and one clear enquiry method.'],
['Build proof, not hype','Use genuine work samples and customer feedback only with permission. Never fabricate reviews, results, scarcity or earnings.'],
['Protect privacy','Do not publish your Aadhaar, PAN, bank details, passwords, OTPs or unnecessary home/family information.'],
['Check neighbours and local conditions','Noise, visitors, parking, waste, food handling, deliveries or equipment may create local constraints even for a home activity.'],
['Verify requirements before selling','Check current official/local requirements relevant to the activity, location, food/product safety, tax and business form rather than assuming home-based means exempt.'],
['Keep rights clean','Use only photos, music, video, fonts, templates, designs and other assets you own or have permission/licence to use commercially.'],
['Track useful numbers','Track genuine enquiries, conversion, repeat orders, average order value, delivery/rework and cash collected—not follower counts alone.']
];
const panel=()=>`<article class="card home-business-tips" data-home-business-tips><p class="eyebrow">HOME BUSINESS · PRACTICAL TIPS</p><h2>Start small, prove demand, then expand</h2><ol>${tips.map(([h,p])=>`<li><strong>${h}:</strong> ${p}</li>`).join('')}</ol><p class="caution"><strong>GUIDANCE:</strong> home-based does not mean zero-cost, automatically permitted or guaranteed profitable. Validate your actual activity, address/local conditions, customer demand and current requirements before spending.</p></article>`;
const inject=()=>{const main=document.querySelector<HTMLElement>('#app main');if(!main||main.querySelector('[data-home-business-tips]'))return;const text=(main.textContent||'').toLowerCase();if(!text.includes('home-based')&&!text.includes('home business'))return;const nav=main.querySelector('nav.nav');nav?.insertAdjacentHTML('beforebegin',panel());};
const app=document.querySelector('#app');if(app){new MutationObserver(()=>queueMicrotask(inject)).observe(app,{childList:true,subtree:true});inject();}
export {tips,panel};