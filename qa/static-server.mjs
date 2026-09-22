import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(fileURLToPath(new URL('../public/', import.meta.url)));
const port=Number(process.env.PORT || 4173);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.webmanifest':'application/manifest+json','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml'};

http.createServer(async(req,res)=>{
  try{
    const u=new URL(req.url||'/', 'http://localhost');
    let rel=decodeURIComponent(u.pathname);
    if(rel==='/'||!path.extname(rel)) rel='/index.html';
    const file=path.join(root,rel.replace(/^\/+/, ''));
    const s=await stat(file);
    if(!s.isFile()) throw new Error('not file');
    const body=await readFile(file);
    res.writeHead(200,{'content-type':mime[path.extname(file)]||'application/octet-stream','cache-control':'no-store'});
    res.end(body);
  }catch{
    res.writeHead(404,{'content-type':'text/plain'});res.end('Not found');
  }
}).listen(port,'127.0.0.1',()=>console.log('Sarhad QA server '+port));
