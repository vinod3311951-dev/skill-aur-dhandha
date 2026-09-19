const BHASHINI_URL='https://dhruva-api.bhashini.gov.in/services/inference/pipeline';

export default async function handler(req:any,res:any){
  if(req.method!=='POST'){
    res.setHeader('Allow','POST');
    return res.status(405).json({ok:false,error:'POST only'});
  }
  const apiKey=process.env.BHASHINI_API_KEY;
  const serviceId=process.env.BHASHINI_TRANSLATION_SERVICE_ID;
  if(!apiKey||!serviceId){
    return res.status(503).json({ok:false,error:'BHASHINI_NOT_CONFIGURED'});
  }
  const {text,sourceLanguage='en',targetLanguage}=req.body||{};
  if(typeof text!=='string'||!text.trim()||text.length>2000||typeof targetLanguage!=='string'||!targetLanguage){
    return res.status(400).json({ok:false,error:'INVALID_REQUEST'});
  }
  try{
    const upstream=await fetch(BHASHINI_URL,{
      method:'POST',
      headers:{
        'Authorization':apiKey,
        'Content-Type':'application/json',
        'Accept':'*/*'
      },
      body:JSON.stringify({
        pipelineTasks:[{
          taskType:'translation',
          config:{language:{sourceLanguage,targetLanguage},serviceId}
        }],
        inputData:{input:[{source:text.trim()}]}
      })
    });
    const data=await upstream.json().catch(()=>({}));
    if(!upstream.ok){
      return res.status(upstream.status).json({ok:false,error:'BHASHINI_REQUEST_FAILED'});
    }
    const translated=data?.pipelineResponse?.[0]?.output?.[0]?.target;
    if(typeof translated!=='string'){
      return res.status(502).json({ok:false,error:'BHASHINI_BAD_RESPONSE'});
    }
    res.setHeader('Cache-Control','no-store');
    return res.status(200).json({ok:true,translated});
  }catch{
    return res.status(502).json({ok:false,error:'BHASHINI_UNAVAILABLE'});
  }
}
