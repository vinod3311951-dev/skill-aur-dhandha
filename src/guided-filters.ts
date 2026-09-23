const app=document.querySelector<HTMLDivElement>('#app');
const categories=['Food','Retail','Service / Skill','Manufacturing','Agriculture / Farm Business','Digital / Online','Home-based'] as const;
const esc=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c));
const root=()=>{location.href='/'};
const returnToPath=()=>{document.dispatchEvent(new CustomEvent('skill-return-to-path'))};

function renderCategories(){
  if(!app)return;
  app.innerHTML=`<main class="shell">
    <header><p class="eyebrow">Start a Business</p><h1>Choose a category</h1><p>Pick the closest fit. You can change it anytime.</p></header>
    <article class="card dropdown-panel">
      <label>Business category
        <select id="guided-category-select">
          <option value="">Choose a category</option>
          ${categories.map(x=>`<option value="${esc(x)}">${x}</option>`).join('')}
        </select>
      </label>
      <p>No profile form is required before you explore.</p>
    </article>
    <button class="mic" type="button" aria-label="Voice input"><span aria-hidden="true">●</span> Voice input</button>
    <nav class="nav"><button id="guided-back" type="button">← Back</button><button id="guided-home" type="button">Home</button></nav>
  </main>`;
  document.querySelector('#guided-back')?.addEventListener('click',returnToPath);
  document.querySelector('#guided-home')?.addEventListener('click',root);
  document.querySelector<HTMLSelectElement>('#guided-category-select')?.addEventListener('change',e=>{
    const category=(e.currentTarget as HTMLSelectElement).value;
    if(!category)return;
    localStorage.setItem('skill-aur-dhandha-selected-category',category);
    document.dispatchEvent(new CustomEvent('skill-category-selected',{detail:category}));
  });
}

document.addEventListener('click',event=>{
  const target=event.target as HTMLElement|null;
  const b=target?.closest<HTMLButtonElement>('[data-p="2"]');
  if(!b)return;
  queueMicrotask(renderCategories);
});
document.addEventListener('open-start-business',renderCategories);
