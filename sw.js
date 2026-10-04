// Service worker: permite jogar offline depois da primeira visita.
const VERSAO='coordenadas-v2.1.2';
const LOCAIS=['./','index.html','navios.js','som.js','manifest.webmanifest','images/rosa-dos-ventos.png','icons/icon-192.png','icons/icon-512.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(VERSAO).then(c=>Promise.all(LOCAIS.map(u=>c.add(u).catch(()=>{})))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSAO).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
// rede primeiro para arquivos do jogo, cache primeiro para bibliotecas, fontes e mapa
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const local=new URL(req.url).origin===location.origin;
  if(local){
    e.respondWith(fetch(req).then(r=>{const cp=r.clone();caches.open(VERSAO).then(c=>c.put(req,cp));return r}).catch(()=>caches.match(req).then(r=>r||caches.match('index.html'))));
  } else {
    e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(r=>{const cp=r.clone();caches.open(VERSAO).then(c=>c.put(req,cp));return r})));
  }
});
