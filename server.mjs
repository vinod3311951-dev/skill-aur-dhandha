import http from"node:http";import fs from"node:fs";import path from"node:path";import{fileURLToPath}from"node:url";import{verifyPreviewPassword}from"./api/factoryx-auth-core.js";
const root=path.dirname(fileURLToPath(import.meta.url)),mime={".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".wav":"audio/wav",".json":"application/json; charset=utf-8",".webmanifest":"application/manifest+json; charset=utf-8",".txt":"text/plain; charset=utf-8",".md":"text/markdown; charset=utf-8"},port=Number(process.env.PORT||8080);

function json(res,status,payload){const body=Buffer.from(JSON.stringify(payload));res.writeHead(status,{"content-type":"application/json; charset=utf-8","content-length":body.length,"cache-control":"no-store"});res.end(body)}
function auth(req,res){
  const expected=process.env.FACTORYX_PREVIEW_PASSWORD;
  if(!expected)return json(res,503,{ok:false,error:"not_configured"});
  let raw="";req.on("data",chunk=>{raw+=chunk;if(raw.length>4096)req.destroy()});req.on("end",()=>{
    let body;try{body=JSON.parse(raw||"{}")}catch{return json(res,400,{ok:false,error:"bad_request"})}
    const supplied=typeof body.password==="string"?body.password:"";
    if(!verifyPreviewPassword(supplied,expected))return setTimeout(()=>json(res,401,{ok:false,error:"invalid_password"}),250);
    return json(res,200,{ok:true});
  });
}

http.createServer((req,res)=>{
  const parsed=new URL(req.url,"http://x");
  if(parsed.pathname==="/api/factoryx-auth"){
    if(req.method!=="POST"){res.setHeader("allow","POST");return json(res,405,{ok:false,error:"method_not_allowed"})}
    return auth(req,res);
  }
  let u=decodeURIComponent(parsed.pathname);if(u==="/")u="/index.html";const file=path.resolve(root,u.replace(/^\/+/, ""));
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404,{"content-type":"text/plain"});return res.end("Not found")}
  const body=fs.readFileSync(file);res.writeHead(200,{"content-type":mime[path.extname(file)]||"application/octet-stream","content-length":body.length,"cache-control":"no-store"});res.end(body)
}).listen(port,"0.0.0.0",()=>console.log("Color Dominion staging server listening on "+port));
