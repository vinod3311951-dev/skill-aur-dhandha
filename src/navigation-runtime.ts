const app=document.querySelector<HTMLDivElement>('#app');

const backSelector='nav.nav button[id$="-back"], nav.nav #utility-back';
const navSelector='nav.nav';
let suppress=false;
let lastSignature='';

function signature(){
  const main=app?.querySelector('main');
  if(!main)return '';
  const eyebrow=main.querySelector('.eyebrow')?.textContent?.trim()||'';
  const h1=main.querySelector('h1')?.textContent?.trim()||'';
  const step=[...main.querySelectorAll('select')].map(s=>s.id).join(',');
  return [eyebrow,h1,step].join('|');
}

function stateDepth(){
  const n=Number(history.state?.skillDepth);
  return Number.isFinite(n)?n:0;
}

if(app){
  if(!history.state?.skillNav){
    history.replaceState({...history.state,skillNav:true,skillDepth:0},'');
  }
  queueMicrotask(()=>{lastSignature=signature();});

  function ensureForward(){
    for(const nav of app.querySelectorAll<HTMLElement>(navSelector)){
      if(nav.querySelector('[data-history-forward]'))continue;
      const button=document.createElement('button');
      button.type='button';
      button.dataset.historyForward='true';
      button.textContent='Forward →';
      button.setAttribute('aria-label','Go forward');
      nav.append(button);
    }
  }

  ensureForward();

  const observer=new MutationObserver(()=>{
    queueMicrotask(()=>{
      ensureForward();
      const next=signature();
      if(!next||next===lastSignature)return;
      if(suppress){lastSignature=next;return;}
      const depth=stateDepth()+1;
      history.pushState({...history.state,skillNav:true,skillDepth:depth,skillSignature:next},'');
      lastSignature=next;
    });
  });
  observer.observe(app,{subtree:true,childList:true});

  document.addEventListener('click',event=>{
    if(suppress)return;
    const target=event.target as HTMLElement|null;
    const forward=target?.closest<HTMLButtonElement>('[data-history-forward]');
    if(forward){
      event.preventDefault();
      event.stopImmediatePropagation();
      history.forward();
      return;
    }
    const back=target?.closest<HTMLButtonElement>(backSelector);
    if(!back)return;
    if(stateDepth()<=0)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    history.back();
  },true);

  window.addEventListener('popstate',()=>{
    const back=app.querySelector<HTMLButtonElement>(backSelector);
    if(!back){lastSignature=signature();return;}
    suppress=true;
    back.click();
    queueMicrotask(()=>{
      lastSignature=signature();
      suppress=false;
    });
  });
}

export {};
