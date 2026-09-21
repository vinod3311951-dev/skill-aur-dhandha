import{verifyPreviewPassword}from"./factoryx-auth-core.js";

function send(res,status,payload){
  res.setHeader("cache-control","no-store, max-age=0");
  res.setHeader("content-type","application/json; charset=utf-8");
  return res.status(status).json(payload);
}

export default async function handler(req,res){
  if(req.method!=="POST"){
    res.setHeader("allow","POST");
    return send(res,405,{ok:false,error:"method_not_allowed"});
  }

  const expected=process.env.FACTORYX_PREVIEW_PASSWORD;
  if(typeof expected!=="string"||expected.length===0){
    return send(res,503,{ok:false,error:"not_configured"});
  }

  let body=req.body;
  if(typeof body==="string"){
    try{body=JSON.parse(body)}catch{return send(res,400,{ok:false,error:"bad_request"})}
  }
  const password=body&&typeof body.password==="string"?body.password:"";
  if(password.length===0||password.length>256){
    return send(res,401,{ok:false,error:"invalid_password"});
  }

  const ok=verifyPreviewPassword(password,expected);
  if(!ok){
    await new Promise(resolve=>setTimeout(resolve,250));
    return send(res,401,{ok:false,error:"invalid_password"});
  }
  return send(res,200,{ok:true});
}
