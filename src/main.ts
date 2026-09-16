import './style.css';

type Screen = 'home' | 'path';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('App root not found');

const homeButtons = ['Find My Path', 'Find My Market', 'Paisa Check', 'Learn & Grow', 'Government Help'];
let screen: Screen = 'home';

function render() {
  if (screen === 'home') {
    app.innerHTML = `
      <main class="shell">
        <header><p class="eyebrow">India Opportunity Navigator</p><h1>Skill Aur Dhandha</h1><p>Discover realistic paths. Understand the numbers. Choose your next step.</p></header>
        <section class="actions" aria-label="Main choices">
          ${homeButtons.map((label, i) => `<button class="choice" data-index="${i}">${label}<span aria-hidden="true">›</span></button>`).join('')}
        </section>
        <button class="mic" type="button" aria-label="Voice input"><span aria-hidden="true">●</span> Any Indian language</button>
      </main>`;
    app.querySelectorAll<HTMLButtonElement>('.choice').forEach((button) => {
      button.addEventListener('click', () => {
        if (button.dataset.index === '0') { screen = 'path'; render(); }
      });
    });
    return;
  }

  app.innerHTML = `
    <main class="shell">
      <header><p class="eyebrow">Find My Path</p><h1>Tell us about you</h1><p>Only broad preferences are needed. No name or exact date of birth.</p></header>
      <form class="card" id="profile">
        <label>Age band<select name="age"><option value="">Choose</option><option>17 or under</option><option>18–24</option><option>25–34</option><option>35–49</option><option>50–59</option><option>60+</option></select></label>
        <label>Education / background<input name="education" placeholder="e.g. school, graduate, skilled trade" /></label>
        <label>Interests / skills<input name="interests" placeholder="e.g. cooking, repair, sales, computers" /></label>
      </form>
      <button class="mic" type="button"><span aria-hidden="true">●</span> Any Indian language</button>
      <nav class="nav" aria-label="Navigation"><button id="back" type="button">← Back</button><button id="home" type="button">Home</button><button id="next" type="button">Next →</button></nav>
    </main>`;
  app.querySelector<HTMLButtonElement>('#back')?.addEventListener('click', () => { screen = 'home'; render(); });
  app.querySelector<HTMLButtonElement>('#home')?.addEventListener('click', () => { screen = 'home'; render(); });
  app.querySelector<HTMLButtonElement>('#next')?.addEventListener('click', () => {
    const form = app.querySelector<HTMLFormElement>('#profile');
    if (!form) return;
    const data = Object.fromEntries(new FormData(form));
    localStorage.setItem('skill-aur-dhandha-profile', JSON.stringify(data));
  });
}

render();
