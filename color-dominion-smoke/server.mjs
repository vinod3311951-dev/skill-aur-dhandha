import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root=path.dirname(fileURLToPath(import.meta.url));
const mime={".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",".js":"text/javascript; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".json":"application/json; charset=utf-8"};
const iconFallback=Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=","base64");
const port=Number(process.env.PORT||8080);

http.createServer((req,res)=>{
  let u=decodeURIComponent(new URL(req.url,"http://x").pathname);
  if(u==="/") u="/index.html";
  if(u==="/assets/pwa/icon-192.png"){
    const real=path.join(root,"assets/pwa/icon-192.png");
    const body=fs.existsSync(real)?fs.readFileSync(real):iconFallback;
    res.writeHead(200,{"content-type":"image/png","content-length":body.length,"cache-control":"no-store"});
    return res.end(body);
  }
  const rel=u.replace(/^\/+/, "");
  const file=path.resolve(root,rel);
  if(!file.startsWith(root+path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()){
    res.writeHead(404,{"content-type":"text/plain; charset=utf-8","cache-control":"no-store"});
    return res.end("Not found");
  }
  const body=fs.readFileSync(file);
  res.writeHead(200,{"content-type":mime[path.extname(file)]||"application/octet-stream","content-length":body.length,"cache-control":"no-store"});
  res.end(body);
}).listen(port,"0.0.0.0",()=>console.log(`Color Dominion FX-07 smoke server listening on ${port}`));