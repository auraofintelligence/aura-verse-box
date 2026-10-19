import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.txt':'text/plain; charset=utf-8','.xml':'application/xml','.pdf':'application/pdf','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png','.ico':'image/x-icon','.docx':'application/vnd.openxmlformats-officedocument.wordprocessingml.document'};
const server=createServer(async(req,res)=>{try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const relative=pathname==='/'?'index.html':pathname.slice(1);if(relative.startsWith('.')||relative.split('/').some(p=>p==='..')||!(/^(assets|documents)\//.test(relative)||/^[\w-]+\.(html|txt|xml|ico|png)$/.test(relative))){res.writeHead(403);res.end('Not public');return;}const target=resolve(root,relative);if(!target.startsWith(root+sep))throw Error('Outside root');const file=await readFile(target);res.writeHead(200,{'Content-Type':types[extname(target)]||'application/octet-stream','Cache-Control':'no-store'});res.end(file);}catch{res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});res.end(await readFile(resolve(root,'404.html')));}});
server.listen(4192,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4192/'));
