import http from "node:http";
import fs from "node:fs";
import path from "node:path";
const payloadFiles=fs.readdirSync(".").filter(f=>/^payload\d+\.txt$/.test(f)).sort();
const files=JSON.parse(payloadFiles.map(f=>fs.readFileSync(f,"utf8")).join(""));
const mime={".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",".js":"text/javascript; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".json":"application/json; charset=utf-8"};
const port=Number(process.env.PORT||8080);
const server=http.createServer((req,res)=>{
  let u=new URL(req.url,"http://x").pathname; if(u==="/")u="/index.html";
  const b64=files[u];
  if(!b64){res.writeHead(404,{"content-type":"text/plain; charset=utf-8","cache-control":"no-store"});res.end("Not found");return;}
  const ext=path.extname(u); const body=Buffer.from(b64,"base64");
  res.writeHead(200,{"content-type":mime[ext]||"application/octet-stream","content-length":body.length,"cache-control":"no-store"});
  res.end(body);
});
server.listen(port,"0.0.0.0",()=>console.log(`Color Dominion FX-07 smoke server listening on ${port}; ${Object.keys(files).length} resources`));