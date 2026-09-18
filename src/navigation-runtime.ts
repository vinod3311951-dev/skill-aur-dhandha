const app=document.querySelector<HTMLDivElement>('#app');

const backSelector='nav.nav button[id$="-back"], nav.nav #utility-back';
const forwardActionSelector='button.choice, a.choice, button[id$="-go"], button[id$="-open"], button[id$="-next"], button[id$="-start"], button[id$="-analyse"]';
let restoring=false;

function depth(){
  const n=Number(history.state?.skillDepth);
  return Number.isFinite(n)?n:0;
}

function ensureForward(){
  if(!app)return;
  for(const nav of app.querySelectorAll<HTMLElement>('nav.nav')){
    if(nav.querySelector('[data-history-forward]'))continue;
    const button=document.createElement('button');
    button.type='button';
    button.dataset.historyForward='true';
    button.textContent='Forward →';
    button.setAttribute('aria-label','Go forward');
    nav.append(button);
  }
}

function pushStep(){
  if(restoring)return;
  history.pushState({...history.state,skillNav:true,skillDepth:depth()+1},'');
}

if(app){
  if(!history.state?.skillNav)history.replaceState({...history.state,skillNav:true,skillDepth:0},'');
  ensureForward();

  document.addEventListener('click',event=>{
    const target=event.target as HTMLElement|null;
    if(!target)return;

    const forward=target.closest<HTMLButtonElement>('[data-history-forward]');
    if(forward){
      event.preventDefault();
      event.stopImmediatePropagation();
      history.forward();
      return;
    }

    const back=target.closest<HTMLButtonElement>(backSelector);
    if(back){
      if(restoring||depth()<=0)return;
      event.preventDefault();
      event.stopImmediatePropagation();
      history.back();
      return;
    }

    const home=target.closest<HTMLButtonElement>('nav.nav button[id$="-home"], nav.nav #utility-home');
    if(home)return;

    if(target.closest(forwardActionSelector))pushStep();
    queueMicrotask(ensureForward);
  },true);

  document.addEventListener('change',event=>{
    const target=event.target as HTMLElement|null;
    if(target?.matches('select'))pushStep();
    queueMicrotask(ensureForward);
  },true);

  window.addEventListener('popstate',()=>{
    const back=app.querySelector<HTMLButtonElement>(backSelector);
    if(!back)return;
    restoring=true;
    back.click();
    queueMicrotask(()=>{
      restoring=false;
      ensureForward();
    });
  });

  window.addEventListener('pageshow',()=>queueMicrotask(ensureForward));
}

export {};
