const app=document.querySelector<HTMLDivElement>('#app');

type NavAction =
  | {kind:'click'; selector:string}
  | {kind:'select'; selector:string; value:string};

const backSelector='nav.nav button[id$="-back"], nav.nav #utility-back';
const homeSelector='nav.nav button[id$="-home"], nav.nav #utility-home';
const meaningfulSelects=[
  '#path-route-choice','#opportunity-select','#media-role','#guided-category-select',
  '#market-type-select','#market-route-select','#learn-mode-select','#learn-topic-select',
  '#gov-mode-select','#future-career','#machine-choice','#export-product',
  '#path-alt-select','#market-compare-a','#market-compare-b'
].join(',');

let currentDepth=Number(history.state?.skillDepth)||0;
const actions=new Map<number,NavAction>();
let replaying=false;

function cssEscape(value:string){
  return value.replace(/(["\\])/g,'\\$1');
}

function clickSelector(el:HTMLElement){
  if(el.id)return '#'+cssEscape(el.id);
  const action=el.getAttribute('data-choice-action');
  if(action)return '[data-choice-action="'+cssEscape(action)+'"]';
  if(el.hasAttribute('data-choice-compare-open'))return '[data-choice-compare-open]';
  if(el.hasAttribute('data-choice-save'))return '[data-choice-save]';
  return '';
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

function record(action:NavAction){
  if(replaying)return;
  const next=currentDepth+1;
  actions.set(next,action);
  currentDepth=next;
  history.pushState({...history.state,skillNav:true,skillDepth:currentDepth},'');
}

function replay(action:NavAction|undefined){
  if(!action)return;
  replaying=true;
  if(action.kind==='click'){
    app?.querySelector<HTMLElement>(action.selector)?.click();
  }else{
    const select=app?.querySelector<HTMLSelectElement>(action.selector);
    if(select){
      select.value=action.value;
      select.dispatchEvent(new Event('change',{bubbles:true}));
    }
  }
  queueMicrotask(()=>{
    replaying=false;
    ensureForward();
  });
}

if(app){
  if(!history.state?.skillNav){
    currentDepth=0;
    history.replaceState({...history.state,skillNav:true,skillDepth:0},'');
  }
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
      if(replaying||currentDepth<=0)return;
      event.preventDefault();
      event.stopImmediatePropagation();
      history.back();
      return;
    }

    if(target.closest(homeSelector))return;

    const interactive=target.closest<HTMLElement>('button.choice, a.choice, button[id$="-go"], button[id$="-open"], button[id$="-next"], button[id$="-start"], button[id$="-analyse"], button[id$="-readiness"], button[id$="-roadmap"]');
    if(interactive){
      const selector=clickSelector(interactive);
      if(selector)record({kind:'click',selector});
    }
    queueMicrotask(ensureForward);
  },true);

  document.addEventListener('change',event=>{
    const select=(event.target as HTMLElement|null)?.closest<HTMLSelectElement>('select');
    if(!select||!select.matches(meaningfulSelects))return;
    if(select.id)record({kind:'select',selector:'#'+cssEscape(select.id),value:select.value});
    queueMicrotask(ensureForward);
  },true);

  window.addEventListener('popstate',event=>{
    const nextDepth=Number(event.state?.skillDepth)||0;
    if(nextDepth<currentDepth){
      const back=app.querySelector<HTMLButtonElement>(backSelector);
      currentDepth=nextDepth;
      if(!back)return;
      replaying=true;
      back.click();
      queueMicrotask(()=>{
        replaying=false;
        ensureForward();
      });
      return;
    }
    if(nextDepth>currentDepth){
      currentDepth=nextDepth;
      replay(actions.get(nextDepth));
    }
  });

  window.addEventListener('pageshow',()=>queueMicrotask(ensureForward));
}

export {};
