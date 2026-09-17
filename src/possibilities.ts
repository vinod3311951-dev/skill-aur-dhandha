const app = document.querySelector<HTMLDivElement>('#app');

function renderPossibilities(category: string) {
  if (!app) return;
  const isFood = category === 'Food';
  app.innerHTML = `<main class="shell">
    <header><p class="eyebrow">Start a Business · ${category}</p><h1>Possibilities</h1><p>GUIDANCE — explore a realistic path, inspect evidence, then test the numbers. You decide what fits.</p></header>
    ${isFood ? `<article class="card"><p class="eyebrow">FIT SUMMARY</p><h2>Home Tiffin</h2><p>A home-based food-service path to explore if your cooking, available time, kitchen capacity and reachable local customers fit.</p><div class="actions"><button class="choice" id="s13-evidence" type="button">View Evidence<span>›</span></button><button class="choice" id="s13-test" type="button">Test Business<span>›</span></button></div></article>` : `<article class="card"><h2>${category}</h2><p>Category-specific possibilities are not yet loaded in this build. No business recommendation is invented without its supporting path and evidence.</p></article>`}
    <button class="mic" type="button" aria-label="Voice input"><span aria-hidden="true">●</span> Any Indian language</button>
    <nav class="nav" aria-label="Navigation"><button id="s13-back" type="button">← Back</button><button id="s13-home" type="button">Home</button></nav>
  </main>`;
  document.querySelector('#s13-back')?.addEventListener('click', () => history.back());
  document.querySelector('#s13-home')?.addEventListener('click', () => { location.href = '/'; });
  document.querySelector('#s13-evidence')?.addEventListener('click', () => document.dispatchEvent(new CustomEvent('skill-route', { detail: 'evidence' })));
  document.querySelector('#s13-test')?.addEventListener('click', () => document.dispatchEvent(new CustomEvent('skill-route', { detail: 'simulator' })));
}

document.addEventListener('skill-category-selected',(event)=>{const category=(event as CustomEvent<string>).detail;if(category)renderPossibilities(category);});
document.addEventListener('click', (event) => {
  const target = event.target as HTMLElement | null;
  const button = target?.closest<HTMLButtonElement>('.category');
  if (!button) return;
  const category = button.dataset.category || '';
  queueMicrotask(() => renderPossibilities(category));
});