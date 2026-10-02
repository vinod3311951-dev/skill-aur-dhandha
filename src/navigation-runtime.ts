const app=document.querySelector<HTMLDivElement>('#app');

function ensureForward(){
  if(!app)return;
  for(const nav of app.querySelectorAll<HTMLElement>('nav.nav')){
    if(nav.querySelector('[data-simple-forward]'))continue;
    const button=document.createElement('button');
    button.type='button';
    button.dataset.simpleForward='true';
    button.textContent='Forward →';
    button.setAttribute('aria-label','Go forward');
    nav.append(button);
  }
}

if(app){
  ensureForward();

  document.addEventListener('click',event=>{
    const target=event.target as HTMLElement|null;
    if(!target)return;
    const forward=target.closest<HTMLButtonElement>('[data-simple-forward]');
    if(forward){
      event.preventDefault();
      document.dispatchEvent(new Event('skill-flow-forward'));
      return;
    }
    queueMicrotask(ensureForward);
  });

  document.addEventListener('change',()=>queueMicrotask(ensureForward));
  document.addEventListener('skill-screen-rendered',()=>queueMicrotask(ensureForward));
  window.addEventListener('pageshow',()=>queueMicrotask(ensureForward));
}

export {};
