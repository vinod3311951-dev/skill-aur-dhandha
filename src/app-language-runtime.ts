type AppLang={
  code:string;
  locale:string;
  label:string;
};

const LANGUAGE_CODE_KEY='skill-aur-dhandha-language-code';
const LEGACY_LANGUAGE_KEY='skill-aur-dhandha-language';

export const appLanguages:AppLang[]=[
  {code:'en',locale:'en-IN',label:'English'},
  {code:'hi',locale:'hi-IN',label:'हिन्दी'},
  {code:'bn',locale:'bn-IN',label:'বাংলা'},
  {code:'gu',locale:'gu-IN',label:'ગુજરાતી'},
  {code:'kn',locale:'kn-IN',label:'ಕನ್ನಡ'},
  {code:'ml',locale:'ml-IN',label:'മലയാളം'},
  {code:'mr',locale:'mr-IN',label:'मराठी'},
  {code:'ta',locale:'ta-IN',label:'தமிழ்'},
  {code:'te',locale:'te-IN',label:'తెలుగు'},
  {code:'pa',locale:'pa-IN',label:'ਪੰਜਾਬੀ'},
  {code:'or',locale:'or-IN',label:'ଓଡ଼ିଆ'},
  {code:'as',locale:'as-IN',label:'অসমীয়া'},
  {code:'ur',locale:'ur-IN',label:'اردو'}
];

const localCore:Record<string,Record<string,string>>={
  hi:{'← Back':'← वापस','Back':'वापस','Home':'होम','Forward →':'आगे →','Settings':'सेटिंग्स','Language':'भाषा','Share app':'ऐप साझा करें','Voice':'आवाज़','Find My Path':'मेरा रास्ता खोजें','Find My Market':'मेरा बाज़ार खोजें','Paisa Check':'पैसा जाँच','Learn & Grow':'सीखें और बढ़ें','Government Help':'सरकारी मदद','Business Analysis':'व्यवसाय विश्लेषण','What are you looking for?':'आप क्या ढूँढ रहे हैं?','Find a Skill':'कौशल खोजें','Start a Business':'व्यवसाय शुरू करें','Side Income':'अतिरिक्त आय','Freelance':'फ्रीलांस','Not Sure - Show Me Options':'पक्का नहीं — विकल्प दिखाएँ'},
  bn:{'← Back':'← ফিরে যান','Back':'ফিরে যান','Home':'হোম','Forward →':'আগে →','Settings':'সেটিংস','Language':'ভাষা','Share app':'অ্যাপ শেয়ার করুন','Voice':'ভয়েস','Find My Path':'আমার পথ খুঁজুন','Find My Market':'আমার বাজার খুঁজুন','Paisa Check':'টাকার হিসাব','Learn & Grow':'শিখুন ও এগিয়ে যান','Government Help':'সরকারি সহায়তা','Business Analysis':'ব্যবসা বিশ্লেষণ','What are you looking for?':'আপনি কী খুঁজছেন?','Find a Skill':'দক্ষতা খুঁজুন','Start a Business':'ব্যবসা শুরু করুন','Side Income':'অতিরিক্ত আয়','Freelance':'ফ্রিল্যান্স','Not Sure - Show Me Options':'নিশ্চিত নই — বিকল্প দেখান'},
  gu:{'← Back':'← પાછા','Back':'પાછા','Home':'હોમ','Forward →':'આગળ →','Settings':'સેટિંગ્સ','Language':'ભાષા','Share app':'એપ શેર કરો','Voice':'આવાજ','Find My Path':'મારો માર્ગ શોધો','Find My Market':'મારું બજાર શોધો','Paisa Check':'પૈસા ચેક','Learn & Grow':'શીખો અને આગળ વધો','Government Help':'સરકારી મદદ','Business Analysis':'વ્યવસાય વિશ્લેષણ','What are you looking for?':'તમે શું શોધી રહ્યા છો?','Find a Skill':'કૌશલ્ય શોધો','Start a Business':'વ્યવસાય શરૂ કરો','Side Income':'વધારાની આવક','Freelance':'ફ્રીલાન્સ','Not Sure - Show Me Options':'ખાતરી નથી — વિકલ્પો બતાવો'},
  kn:{'← Back':'← ಹಿಂದೆ','Back':'ಹಿಂದೆ','Home':'ಮುಖಪುಟ','Forward →':'ಮುಂದೆ →','Settings':'ಸೆಟ್ಟಿಂಗ್‌ಗಳು','Language':'ಭಾಷೆ','Share app':'ಆಪ್ ಹಂಚಿಕೊಳ್ಳಿ','Voice':'ಧ್ವನಿ','Find My Path':'ನನ್ನ ದಾರಿ ಹುಡುಕಿ','Find My Market':'ನನ್ನ ಮಾರುಕಟ್ಟೆ ಹುಡುಕಿ','Paisa Check':'ಹಣ ಪರಿಶೀಲನೆ','Learn & Grow':'ಕಲಿ ಮತ್ತು ಬೆಳೆ','Government Help':'ಸರ್ಕಾರಿ ಸಹಾಯ','Business Analysis':'ವ್ಯವಹಾರ ವಿಶ್ಲೇಷಣೆ','What are you looking for?':'ನೀವು ಏನು ಹುಡುಕುತ್ತಿದ್ದೀರಿ?','Find a Skill':'ಕೌಶಲ್ಯ ಹುಡುಕಿ','Start a Business':'ವ್ಯವಹಾರ ಆರಂಭಿಸಿ','Side Income':'ಹೆಚ್ಚುವರಿ ಆದಾಯ','Freelance':'ಫ್ರೀಲಾನ್ಸ್','Not Sure - Show Me Options':'ಖಚಿತವಿಲ್ಲ — ಆಯ್ಕೆಗಳು ತೋರಿಸಿ'},
  ml:{'← Back':'← പിന്നോട്ട്','Back':'പിന്നോട്ട്','Home':'ഹോം','Forward →':'മുന്നോട്ട് →','Settings':'ക്രമീകരണങ്ങൾ','Language':'ഭാഷ','Share app':'ആപ്പ് പങ്കിടുക','Voice':'ശബ്ദം','Find My Path':'എന്റെ വഴി കണ്ടെത്തുക','Find My Market':'എന്റെ വിപണി കണ്ടെത്തുക','Paisa Check':'പണം പരിശോധിക്കുക','Learn & Grow':'പഠിച്ച് വളരുക','Government Help':'സർക്കാർ സഹായം','Business Analysis':'ബിസിനസ് വിശകലനം','What are you looking for?':'നിങ്ങൾ എന്താണ് അന്വേഷിക്കുന്നത്?','Find a Skill':'കഴിവ് കണ്ടെത്തുക','Start a Business':'ബിസിനസ് തുടങ്ങുക','Side Income':'അധിക വരുമാനം','Freelance':'ഫ്രീലാൻസ്','Not Sure - Show Me Options':'ഉറപ്പില്ല — ഓപ്ഷനുകൾ കാണിക്കുക'},
  mr:{'← Back':'← मागे','Back':'मागे','Home':'होम','Forward →':'पुढे →','Settings':'सेटिंग्ज','Language':'भाषा','Share app':'अॅप शेअर करा','Voice':'आवाज','Find My Path':'माझा मार्ग शोधा','Find My Market':'माझी बाजारपेठ शोधा','Paisa Check':'पैशांची तपासणी','Learn & Grow':'शिका आणि वाढा','Government Help':'सरकारी मदत','Business Analysis':'व्यवसाय विश्लेषण','What are you looking for?':'तुम्ही काय शोधत आहात?','Find a Skill':'कौशल्य शोधा','Start a Business':'व्यवसाय सुरू करा','Side Income':'अतिरिक्त उत्पन्न','Freelance':'फ्रीलान्स','Not Sure - Show Me Options':'निश्चित नाही — पर्याय दाखवा'},
  ta:{'← Back':'← பின்','Back':'பின்','Home':'முகப்பு','Forward →':'அடுத்து →','Settings':'அமைப்புகள்','Language':'மொழி','Share app':'செயலியை பகிரவும்','Voice':'குரல்','Find My Path':'என் பாதையை கண்டுபிடி','Find My Market':'என் சந்தையை கண்டுபிடி','Paisa Check':'பண கணக்கு','Learn & Grow':'கற்று வளருங்கள்','Government Help':'அரசு உதவி','Business Analysis':'வணிக பகுப்பாய்வு','What are you looking for?':'நீங்கள் என்ன தேடுகிறீர்கள்?','Find a Skill':'திறனை கண்டுபிடி','Start a Business':'வணிகம் தொடங்கு','Side Income':'கூடுதல் வருமானம்','Freelance':'ஃப்ரீலான்ஸ்','Not Sure - Show Me Options':'உறுதியாக இல்லை — விருப்பங்களை காட்டு'},
  te:{'← Back':'← వెనక్కి','Back':'వెనక్కి','Home':'హోమ్','Forward →':'ముందుకు →','Settings':'సెట్టింగులు','Language':'భాష','Share app':'యాప్ పంచుకోండి','Voice':'వాయిస్','Find My Path':'నా మార్గం కనుగొను','Find My Market':'నా మార్కెట్ కనుగొను','Paisa Check':'డబ్బు తనిఖీ','Learn & Grow':'నేర్చుకుని ఎదగండి','Government Help':'ప్రభుత్వ సహాయం','Business Analysis':'వ్యాపార విశ్లేషణ','What are you looking for?':'మీరు ఏమి వెతుకుతున్నారు?','Find a Skill':'నైపుణ్యం కనుగొను','Start a Business':'వ్యాపారం ప్రారంభించు','Side Income':'అదనపు ఆదాయం','Freelance':'ఫ్రీలాన్స్','Not Sure - Show Me Options':'ఖచ్చితంగా తెలియదు — ఎంపికలు చూపండి'},
  pa:{'← Back':'← ਪਿੱਛੇ','Back':'ਪਿੱਛੇ','Home':'ਹੋਮ','Forward →':'ਅੱਗੇ →','Settings':'ਸੈਟਿੰਗਾਂ','Language':'ਭਾਸ਼ਾ','Share app':'ਐਪ ਸਾਂਝੀ ਕਰੋ','Voice':'ਆਵਾਜ਼','Find My Path':'ਮੇਰਾ ਰਾਹ ਲੱਭੋ','Find My Market':'ਮੇਰਾ ਬਾਜ਼ਾਰ ਲੱਭੋ','Paisa Check':'ਪੈਸਾ ਚੈਕ','Learn & Grow':'ਸਿੱਖੋ ਤੇ ਵਧੋ','Government Help':'ਸਰਕਾਰੀ ਮਦਦ','Business Analysis':'ਕਾਰੋਬਾਰ ਵਿਸ਼ਲੇਸ਼ਣ','What are you looking for?':'ਤੁਸੀਂ ਕੀ ਲੱਭ ਰਹੇ ਹੋ?','Find a Skill':'ਹੁਨਰ ਲੱਭੋ','Start a Business':'ਕਾਰੋਬਾਰ ਸ਼ੁਰੂ ਕਰੋ','Side Income':'ਵਾਧੂ ਆਮਦਨ','Freelance':'ਫ੍ਰੀਲਾਂਸ','Not Sure - Show Me Options':'ਪੱਕਾ ਨਹੀਂ — ਵਿਕਲਪ ਦਿਖਾਓ'},
  or:{'← Back':'← ପଛକୁ','Back':'ପଛକୁ','Home':'ହୋମ','Forward →':'ଆଗକୁ →','Settings':'ସେଟିଂସ','Language':'ଭାଷା','Share app':'ଆପ୍ ଶେୟାର କରନ୍ତୁ','Voice':'ସ୍ୱର','Find My Path':'ମୋ ପଥ ଖୋଜନ୍ତୁ','Find My Market':'ମୋ ବଜାର ଖୋଜନ୍ତୁ','Paisa Check':'ପଇସା ଯାଞ୍ଚ','Learn & Grow':'ଶିଖନ୍ତୁ ଓ ବଢ଼ନ୍ତୁ','Government Help':'ସରକାରୀ ସହାୟତା','Business Analysis':'ବ୍ୟବସାୟ ବିଶ୍ଳେଷଣ','What are you looking for?':'ଆପଣ କଣ ଖୋଜୁଛନ୍ତି?','Find a Skill':'ଦକ୍ଷତା ଖୋଜନ୍ତୁ','Start a Business':'ବ୍ୟବସାୟ ଆରମ୍ଭ କରନ୍ତୁ','Side Income':'ଅତିରିକ୍ତ ଆୟ','Freelance':'ଫ୍ରିଲାନ୍ସ','Not Sure - Show Me Options':'ନିଶ୍ଚିତ ନୁହେଁ — ବିକଳ୍ପ ଦେଖାନ୍ତୁ'},
  as:{'← Back':'← পিছলৈ','Back':'পিছলৈ','Home':'হোম','Forward →':'আগলৈ →','Settings':'ছেটিংছ','Language':'ভাষা','Share app':'এপ শ্বেয়াৰ কৰক','Voice':'কণ্ঠ','Find My Path':'মোৰ পথ বিচাৰক','Find My Market':'মোৰ বজাৰ বিচাৰক','Paisa Check':'টকাৰ পৰীক্ষা','Learn & Grow':'শিকক আৰু আগবাঢ়ক','Government Help':'চৰকাৰী সহায়','Business Analysis':'ব্যৱসায় বিশ্লেষণ','What are you looking for?':'আপুনি কি বিচাৰিছে?','Find a Skill':'দক্ষতা বিচাৰক','Start a Business':'ব্যৱসায় আৰম্ভ কৰক','Side Income':'অতিৰিক্ত আয়','Freelance':'ফ্ৰিলান্স','Not Sure - Show Me Options':'নিশ্চিত নহয় — বিকল্প দেখুৱাওক'},
  ur:{'← Back':'← واپس','Back':'واپس','Home':'ہوم','Forward →':'آگے →','Settings':'سیٹنگز','Language':'زبان','Share app':'ایپ شیئر کریں','Voice':'آواز','Find My Path':'میرا راستہ تلاش کریں','Find My Market':'میری مارکیٹ تلاش کریں','Paisa Check':'پیسہ چیک','Learn & Grow':'سیکھیں اور بڑھیں','Government Help':'سرکاری مدد','Business Analysis':'کاروباری تجزیہ','What are you looking for?':'آپ کیا تلاش کر رہے ہیں؟','Find a Skill':'ہنر تلاش کریں','Start a Business':'کاروبار شروع کریں','Side Income':'اضافی آمدنی','Freelance':'فری لانس','Not Sure - Show Me Options':'یقین نہیں — اختیارات دکھائیں'}
};

export function selectedAppLanguage():AppLang{
  const code=localStorage.getItem(LANGUAGE_CODE_KEY);
  const direct=appLanguages.find(x=>x.code===code);
  if(direct)return direct;
  const legacy=localStorage.getItem(LEGACY_LANGUAGE_KEY)||'English';
  const mapped=legacy==='Hindi'||legacy==='Roman Hindi'?'hi':'en';
  localStorage.setItem(LANGUAGE_CODE_KEY,mapped);
  return appLanguages.find(x=>x.code===mapped)||appLanguages[0];
}

export function setAppLanguage(code:string){
  const found=appLanguages.find(x=>x.code===code)||appLanguages[0];
  localStorage.setItem(LANGUAGE_CODE_KEY,found.code);
  localStorage.setItem(LEGACY_LANGUAGE_KEY,found.code==='hi'?'Hindi':found.code==='en'?'English':found.label);
  localStorage.setItem('skill-aur-dhandha-voice-locale',found.locale);
  document.documentElement.lang=found.locale;
  document.documentElement.dir=found.code==='ur'?'rtl':'ltr';
  document.dispatchEvent(new CustomEvent('skill-language-changed',{detail:found}));
  scheduleTranslate(true);
}

async function translateBatch(texts:string[],targetLanguage:string){
  if(!texts.length||targetLanguage==='en')return texts;
  const keys=texts.map(t=>targetLanguage+'\u0000'+t);
  const out:Array<string|undefined>=keys.map(k=>cache.get(k));
  const missing=texts.filter((_,i)=>!out[i]);
  if(missing.length){
    try{
      const response=await fetch('/api/bhashini',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({texts:missing,sourceLanguage:'en',targetLanguage})});
      const data=await response.json();
      if(response.ok&&Array.isArray(data.translated)&&data.translated.length===missing.length){
        missing.forEach((t,i)=>cache.set(targetLanguage+'\u0000'+t,String(data.translated[i]||t)));
      }
    }catch{}
  }
  return texts.map(t=>cache.get(targetLanguage+'\u0000'+t)||localCore[targetLanguage]?.[t]||t);
}

function collectText(root:HTMLElement){
  const nodes:Text[]=[];
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  while(walker.nextNode()){
    const node=walker.currentNode as Text;
    const parent=node.parentElement;
    if(!parent||parent.closest('script,style,select,option,[data-no-translate]'))continue;
    const value=node.textContent?.trim()||'';
    if(value.length<2||/^[-–—›←→₹0-9/.:·,%+()]+$/.test(value))continue;
    if(!originalText.has(node))originalText.set(node,value);
    nodes.push(node);
  }
  return nodes;
}

async function translateNow(force=false){
  const myGeneration=++generation;
  const lang=selectedAppLanguage();
  document.documentElement.lang=lang.locale;
  document.documentElement.dir=lang.code==='ur'?'rtl':'ltr';
  if(lang.code==='en'){
    const root=document.querySelector<HTMLElement>('#app');
    if(!root)return;
    for(const node of collectText(root)){
      const original=originalText.get(node);
      if(original&&appliedLang.get(node))node.textContent=(node.textContent||'').replace((node.textContent||'').trim(),original);
      appliedLang.delete(node);
    }
    return;
  }
  const root=document.querySelector<HTMLElement>('#app');
  if(!root)return;
  const nodes=collectText(root);
  const originals=nodes.map(n=>originalText.get(n)||n.textContent?.trim()||'');
  const unique=[...new Set(originals)];
  const direct=unique.map(t=>localCore[lang.code]?.[t]||'');
  const need=unique.filter((_,i)=>!direct[i]);
  const bhashini=await translateBatch(need,lang.code);
  if(myGeneration!==generation&&!force)return;
  const map=new Map<string,string>();
  let j=0;
  unique.forEach((t,i)=>map.set(t,direct[i]||bhashini[j++]||t));
  for(const node of nodes){
    const original=originalText.get(node)||'';
    const translated=map.get(original)||original;
    if(node.textContent?.trim()!==translated)node.textContent=(node.textContent||'').replace((node.textContent||'').trim(),translated);
    appliedLang.set(node,lang.code);
  }
}

export function scheduleTranslate(force=false){
  window.clearTimeout(timer);
  timer=window.setTimeout(()=>void translateNow(force),force?0:40);
}

const app=document.querySelector('#app');
if(app){
  const observer=new MutationObserver(()=>scheduleTranslate());
  observer.observe(app,{childList:true,subtree:true,characterData:true});
  scheduleTranslate(true);
}

document.addEventListener('skill-screen-rendered',()=>scheduleTranslate(true));
window.addEventListener('pageshow',()=>scheduleTranslate(true));
