import './style.css';

type Screen='home'|'path';
const root=document.querySelector<HTMLDivElement>('#app');if(!root)throw new Error('App root not found');const app:HTMLDivElement=root;
const homeButtons=['Find My Path','Find My Market','Paisa Check','Learn & Grow','Government Help'];
const pathButtons=['Find a Skill','Find Work','Start a Business','Side Income','Freelance','Not Sure - Show Me Options'];
let screen:Screen='home';
const mic=()=>`<button class="mic" type="button" aria-label="Voice input"><span aria-hidden="true">●</span> Any Indian language</button>`;
function render(){if(screen==='home'){app.innerHTML=`<main class="shell"><header><p class="eyebrow">India Opportunity Navigator</p><h1>Skill Aur Dhandha</h1><p>Discover realistic paths. Understand the numbers. Choose your next step.</p></header><section class="actions">${homeButtons.map((x,i)=>`<button class="choice" data-i="${i}" type="button">${x}<span>›</span></button>`).join('')}</section>${mic()}</main>`;app.querySelector<HTMLButtonElement>('[data-i="0"]')?.addEventListener('click',()=>{screen='path';render();});return;}app.innerHTML=`<main class="shell"><header><p class="eyebrow">Find My Path</p><h1>What are you looking for?</h1></header><section class="actions">${pathButtons.map((x,i)=>`<button class="choice" data-p="${i}" type="button">${x}<span>›</span></button>`).join('')}</section>${mic()}<nav class="nav" aria-label="Navigation"><button id="path-back" type="button">← Back</button><button id="path-home" type="button">Home</button></nav></main>`;const home=()=>{screen='home';render();};app.querySelector('#path-back')?.addEventListener('click',home);app.querySelector('#path-home')?.addEventListener('click',home);}
document.addEventListener('skill-return-to-path',()=>{screen='path';render();});
render();