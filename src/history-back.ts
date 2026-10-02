const SENTINEL_KEY='skill-aur-dhandha-history-sentinel';

const isHome=()=>!!document.querySelector('.home-header');
const visible=(el:Element)=>!(el as HTMLElement).hidden && getComputedStyle(el).display!=='none' && !el.closest('[hidden]');

function findBackButton():HTMLButtonElement|null{
  const selectors=[
    '[data-flow-back]',
    '#utility-back',
    '#path-back',
    'button[id$="-back"]'
  ];
  for(const selector of selectors){
    for(const el of document.querySelectorAll<HTMLButtonElement>(selector)){
      if(visible(el) && !el.disabled)return el;
    }
  }
  return null;
}

function ensureSentinel(){
  const state=history.state||{};
  if(state?.[SENTINEL_KEY])return;
  history.replaceState({...state,[SENTINEL_KEY]:'base'},'');
  history.pushState({[SENTINEL_KEY]:'guard'},'');
}

ensureSentinel();

window.addEventListener('pageshow',ensureSentinel);

window.addEventListener('popstate',()=>{
  if(isHome())return;
  const back=findBackButton();
  if(!back)return;
  back.click();
  history.pushState({[SENTINEL_KEY]:'guard'},'');
});

export {};
