type SpeechRecognitionCtor=new()=>SpeechRecognitionLike;
type SpeechRecognitionLike={lang:string;interimResults:boolean;continuous:boolean;start:()=>void;stop:()=>void;onresult:((event:any)=>void)|null;onerror:((event:any)=>void)|null;onend:(()=>void)|null};
type VoiceWindow=Window&typeof globalThis&{SpeechRecognition?:SpeechRecognitionCtor;webkitSpeechRecognition?:SpeechRecognitionCtor};

const LANG_KEY='skill-aur-dhandha-language';
const VOICE_LOCALE_KEY='skill-aur-dhandha-voice-locale';
const localeByPreference:Record<string,string>={English:'en-IN',Hindi:'hi-IN','Roman Hindi':'hi-IN'};
const supportedLocales=['hi-IN','en-IN','bn-IN','te-IN','mr-IN','ta-IN','gu-IN','kn-IN','ml-IN','pa-IN','ur-IN','or-IN','as-IN'];
const labels:Record<string,{listen:string;heard:string;unsupported:string;error:string}>={
  'hi-IN':{listen:'सुन रहा हूँ…',heard:'आपने कहा',unsupported:'इस ब्राउज़र में वॉइस इनपुट उपलब्ध नहीं है।',error:'आवाज़ समझ नहीं आई। फिर कोशिश करें।'},
  'en-IN':{listen:'Listening…',heard:'You said',unsupported:'Voice input is not available in this browser.',error:'I could not understand that. Please try again.'}
};
let active:SpeechRecognitionLike|null=null;
const preference=()=>localStorage.getItem(LANG_KEY)||'English';
const locale=()=>localStorage.getItem(VOICE_LOCALE_KEY)||localeByPreference[preference()]||'en-IN';
const copy=()=>labels[locale()]||labels['en-IN'];

function statusNode(button:HTMLButtonElement){let node=button.parentElement?.querySelector<HTMLElement>('[data-voice-status]');if(node)return node;node=document.createElement('p');node.dataset.voiceStatus='true';node.setAttribute('role','status');node.setAttribute('aria-live','polite');button.insertAdjacentElement('afterend',node);return node;}
function usableField(el:Element|null):el is HTMLInputElement|HTMLTextAreaElement{if(!(el instanceof HTMLInputElement||el instanceof HTMLTextAreaElement))return false;if(el instanceof HTMLInputElement&&['radio','checkbox','hidden','button','submit'].includes(el.type))return false;return !el.disabled&&!el.readOnly&&!el.closest('[hidden],[aria-hidden="true"]');}
function targetField(){const el=document.activeElement;if(usableField(el))return el;return [...document.querySelectorAll<HTMLInputElement|HTMLTextAreaElement>('input, textarea')].find(usableField)||null;}
function matchSelect(transcript:string){const selects=[...document.querySelectorAll<HTMLSelectElement>('select')];for(const select of selects){const hit=[...select.options].find(o=>o.value&&o.textContent?.toLocaleLowerCase().includes(transcript.toLocaleLowerCase()));if(hit){select.value=hit.value;select.dispatchEvent(new Event('change',{bubbles:true}));return true;}}return false;}
function speak(text:string){if(!('speechSynthesis'in window)||!text.trim())return;window.speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(text);utterance.lang=locale();window.speechSynthesis.speak(utterance);}
function start(button:HTMLButtonElement){const w=window as VoiceWindow;const Ctor=w.SpeechRecognition||w.webkitSpeechRecognition;const status=statusNode(button);if(!Ctor){status.textContent=copy().unsupported;return;}if(active){active.stop();active=null;}const recognition=new Ctor();active=recognition;recognition.lang=locale();recognition.interimResults=false;recognition.continuous=false;button.setAttribute('aria-pressed','true');status.textContent=copy().listen;recognition.onresult=(event:any)=>{const transcript=String(event.results?.[0]?.[0]?.transcript||'').trim();if(!transcript)return;const field=targetField();if(field){field.value=transcript;field.dispatchEvent(new Event('input',{bubbles:true}));field.dispatchEvent(new Event('change',{bubbles:true}));}else matchSelect(transcript);status.textContent=`${copy().heard}: ${transcript}`;document.dispatchEvent(new CustomEvent('skill-voice-input',{detail:{transcript,locale:locale()}}));};recognition.onerror=()=>{status.textContent=copy().error;};recognition.onend=()=>{button.setAttribute('aria-pressed','false');active=null;};try{recognition.start();}catch{status.textContent=copy().error;button.setAttribute('aria-pressed','false');active=null;}}

document.addEventListener('click',event=>{const target=event.target as HTMLElement|null;const mic=target?.closest<HTMLButtonElement>('.mic');if(mic){start(mic);return;}const speakButton=target?.closest<HTMLButtonElement>('[data-speak-response]');if(speakButton){const selector=speakButton.dataset.speakResponse;const source=selector?document.querySelector<HTMLElement>(selector):null;if(source)speak(source.innerText);}});

document.addEventListener('skill-voice-locale',event=>{const requested=(event as CustomEvent<string>).detail;if(supportedLocales.includes(requested))localStorage.setItem(VOICE_LOCALE_KEY,requested);});

export {speak,supportedLocales};
