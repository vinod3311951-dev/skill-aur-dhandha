import './style.css';

type Screen = 'home' | 'path' | 'filters' | 'categories' | 'possibilities';

const appRoot = document.querySelector<HTMLDivElement>('#app');
if (!appRoot) throw new Error('App root not found');
const app: HTMLDivElement = appRoot;

const homeButtons = ['Find My Path', 'Find My Market', 'Paisa Check', 'Learn & Grow', 'Government Help'];
const pathButtons = ['Find a Skill', 'Find Work', 'Start a Business', 'Side Income', 'Freelance', 'Not Sure - Show Me Options'];
const businessCategories = ['Food', 'Retail', 'Service / Skill', 'Manufacturing', 'Agriculture / Farm Business', 'Digital / Online', 'Home-based'];
let screen: Screen = 'home';

function go(next: Screen) { screen = next; render(); }
function mic() { return `<button class="mic" type="button" aria-label="Voice input"><span aria-hidden="true">●</span> Any Indian language</button>`; }
function nav(back: Screen, showNext = false) { return `<nav class="nav" aria-label="Navigation"><button id="back" type="button">← Back</button><button id="home" type="button">Home</button>${showNext ? '<button id="next" type="button">Next →</button>' : ''}</nav>`; }
function wireNav(back: Screen, next?: Screen) {
  app.querySelector<HTMLButtonElement>('#back')?.addEventListener('click', () => go(back));
  app.querySelector<HTMLButtonElement>('#home')?.addEventListener('click', () => go('home'));
  if (next) app.querySelector<HTMLButtonElement>('#next')?.addEventListener('click', () => go(next));
}

function render() {
  if (screen === 'home') {
    app.innerHTML = `<main class="shell"><header><p class="eyebrow">India Opportunity Navigator</p><h1>Skill Aur Dhandha</h1><p>Discover realistic paths. Understand the numbers. Choose your next step.</p></header><section class="actions" aria-label="Main choices">${homeButtons.map((label, i) => `<button class="choice" data-index="${i}">${label}<span aria-hidden="true">›</span></button>`).join('')}</section>${mic()}</main>`;
    app.querySelector<HTMLButtonElement>('.choice[data-index="0"]')?.addEventListener('click', () => go('path'));
    return;
  }
  if (screen === 'path') {
    app.innerHTML = `<main class="shell"><header><p class="eyebrow">Find My Path</p><h1>What are you looking for?</h1></header><section class="actions" aria-label="Path choices">${pathButtons.map((label, i) => `<button class="choice" data-path-index="${i}">${label}<span aria-hidden="true">›</span></button>`).join('')}</section>${mic()}${nav('home')}</main>`;
    app.querySelector<HTMLButtonElement>('.choice[data-path-index="2"]')?.addEventListener('click', () => go('filters'));
    wireNav('home'); return;
  }
  if (screen === 'filters') {
    const saved = JSON.parse(localStorage.getItem('skill-aur-dhandha-filters') || '{}') as Record<string, string>;
    app.innerHTML = `<main class="shell"><header><p class="eyebrow">Start a Business</p><h1>Optional reality filters</h1><p>These are optional. You can continue without selecting anything.</p></header><form class="card" id="filters"><label>Investment band<input name="investment" value="${saved.investment || ''}" placeholder="Optional" /></label><label>Time availability<input name="time" value="${saved.time || ''}" placeholder="Optional" /></label><label>Operating location<input name="location" value="${saved.location || ''}" placeholder="Optional" /></label><label>Broad geography<input name="geography" value="${saved.geography || ''}" placeholder="Optional" /></label></form>${mic()}${nav('path', true)}</main>`;
    const saveFilters = () => { const form = app.querySelector<HTMLFormElement>('#filters'); if (form) localStorage.setItem('skill-aur-dhandha-filters', JSON.stringify(Object.fromEntries(new FormData(form)))); };
    app.querySelector<HTMLButtonElement>('#back')?.addEventListener('click', () => { saveFilters(); go('path'); });
    app.querySelector<HTMLButtonElement>('#home')?.addEventListener('click', () => { saveFilters(); go('home'); });
    app.querySelector<HTMLButtonElement>('#next')?.addEventListener('click', () => { saveFilters(); go('categories'); }); return;
  }
  if (screen === 'categories') {
    app.innerHTML = `<main class="shell"><header><p class="eyebrow">Start a Business</p><h1>Choose a category</h1></header><section class="actions" aria-label="Business categories">${businessCategories.map((label) => `<button class="choice category" type="button" data-category="${label}">${label}<span aria-hidden="true">›</span></button>`).join('')}</section>${mic()}${nav('filters')}</main>`;
    app.querySelectorAll<HTMLButtonElement>('.category').forEach((button) => button.addEventListener('click', () => { localStorage.setItem('skill-aur-dhandha-selected-category', button.dataset.category || ''); go('possibilities'); }));
    wireNav('filters'); return;
  }

  const selectedCategory = localStorage.getItem('skill-aur-dhandha-selected-category') || 'Selected category';
  const foodCard = selectedCategory === 'Food' ? `<article class="card"><p class="eyebrow">Food</p><h2>Home Tiffin</h2><p>A home-based meal-service possibility. Review evidence before judging demand, costs or income potential.</p><div class="actions"><button class="choice" id="view-evidence" type="button">View Evidence<span aria-hidden="true">›</span></button><button class="choice" id="test-business" type="button">Test Business<span aria-hidden="true">›</span></button></div><p id="s13-status" aria-live="polite"></p></article>` : `<article class="card"><h2>${selectedCategory}</h2><p>Possibility content for this category has not yet passed the evidence gate.</p></article>`;
  app.innerHTML = `<main class="shell"><header><p class="eyebrow">${selectedCategory}</p><h1>Business possibilities</h1></header>${foodCard}${mic()}${nav('categories')}</main>`;
  app.querySelector<HTMLButtonElement>('#view-evidence')?.addEventListener('click', () => { localStorage.setItem('skill-aur-dhandha-selected-business', 'food_home_tiffin'); const status = app.querySelector<HTMLParagraphElement>('#s13-status'); if (status) status.textContent = 'Home Tiffin selected. Evidence Snapshot is the next build stage.'; });
  app.querySelector<HTMLButtonElement>('#test-business')?.addEventListener('click', () => { localStorage.setItem('skill-aur-dhandha-selected-business', 'food_home_tiffin'); const status = app.querySelector<HTMLParagraphElement>('#s13-status'); if (status) status.textContent = 'Home Tiffin selected. Business Simulator is the next build stage.'; });
  wireNav('categories');
}

render();
