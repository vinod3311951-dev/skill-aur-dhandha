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

  const body=req.body||{};
  const sourceLanguage=typeof body.sourceLanguage==='string'?body.sourceLanguage:'en';
  const targetLanguage=typeof body.targetLanguage==='string'?body.targetLanguage:'';
  const texts=Array.isArray(body.texts)?body.texts:(typeof body.text==='string'?[body.text]:[]);

  if(!targetLanguage||!texts.length||texts.length>40||texts.some((x:any)=>typeof x!=='string'||!x.trim()||x.length>2000)){
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
        inputData:{input:texts.map((source:string)=>({source:source.trim()}))}
      })
    });

    const data=await upstream.json().catch(()=>({}));
    if(!upstream.ok){
      return res.status(upstream.status).json({ok:false,error:'BHASHINI_REQUEST_FAILED'});
    }

    const output=data?.pipelineResponse?.[0]?.output;
    if(!Array.isArray(output)||output.length!==texts.length){
      return res.status(502).json({ok:false,error:'BHASHINI_BAD_RESPONSE'});
    }

    const translated=output.map((item:any)=>item?.target);
    if(translated.some((item:any)=>typeof item!=='string')){
      return res.status(502).json({ok:false,error:'BHASHINI_BAD_RESPONSE'});
    }

    res.setHeader('Cache-Control','no-store');
    return res.status(200).json({ok:true,translated});
  }catch{
    return res.status(502).json({ok:false,error:'BHASHINI_UNAVAILABLE'});
  }
}
