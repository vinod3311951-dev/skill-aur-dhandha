type LanguageCode='en-IN'|'as-IN'|'bn-IN'|'brx-IN'|'doi-IN'|'gu-IN'|'hi-IN'|'kn-IN'|'ks-IN'|'kok-IN'|'mai-IN'|'ml-IN'|'mni-IN'|'mr-IN'|'ne-IN'|'or-IN'|'pa-IN'|'sa-IN'|'sat-IN'|'sd-IN'|'ta-IN'|'te-IN'|'ur-IN';
type TranslationRequest={text:string;from?:LanguageCode;to:LanguageCode};
type TranslationResult={text:string;provider:'browser-fallback'|'provider';verified:boolean};
type LanguageProvider={name:string;translate:(request:TranslationRequest)=>Promise<TranslationResult>};

const LANGUAGE_PREF='skill-aur-dhandha-language';
const VOICE_LOCALE='skill-aur-dhandha-voice-locale';
export const supportedIndianLocales:LanguageCode[]=['en-IN','as-IN','bn-IN','brx-IN','doi-IN','gu-IN','hi-IN','kn-IN','ks-IN','kok-IN','mai-IN','ml-IN','mni-IN','mr-IN','ne-IN','or-IN','pa-IN','sa-IN','sat-IN','sd-IN','ta-IN','te-IN','ur-IN'];

const preferenceMap:Record<string,LanguageCode>={English:'en-IN',Hindi:'hi-IN','Roman Hindi':'hi-IN'};

let provider:LanguageProvider|null=null;

export function registerLanguageProvider(next:LanguageProvider|null){
  provider=next;
}

export function selectedLocale():LanguageCode{
  const voice=localStorage.getItem(VOICE_LOCALE) as LanguageCode|null;
  if(voice&&supportedIndianLocales.includes(voice))return voice;
  const pref=localStorage.getItem(LANGUAGE_PREF)||'English';
  return preferenceMap[pref]||'en-IN';
}

export async function translateForSelectedLanguage(text:string,from:LanguageCode='en-IN'):Promise<TranslationResult>{
  const to=selectedLocale();
  if(!text.trim()||to===from)return{text,provider:'browser-fallback',verified:true};
  if(provider){
    try{return await provider.translate({text,from,to});}catch{}
  }
  return{text,provider:'browser-fallback',verified:false};
}

export function languageServiceStatus(){
  return{
    locale:selectedLocale(),
    provider:provider?.name||null,
    fallback:'text remains unchanged when no verified translation provider is configured',
    privacy:'no provider secrets are stored in the client'
  };
}

document.addEventListener('skill-voice-input',async event=>{
  const detail=(event as CustomEvent<{transcript?:string;locale?:LanguageCode}>).detail;
  if(!detail?.transcript)return;
  document.dispatchEvent(new CustomEvent('skill-language-input',{detail:{text:detail.transcript,locale:detail.locale||selectedLocale()}}));
});

/*
Production boundary:
- This client module is an abstraction only.
- Do not embed BHASHINI, AI4Bharat or any translation-provider secret/API key in the PWA.
- A production provider must be called through an approved server-side proxy or equivalent secret-safe integration.
- Until a provider is configured and verified, untranslated English/Hindi UI must never be falsely labelled as translated output.
*/
