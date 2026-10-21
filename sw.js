const CACHE='english-reader-shell-v05';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('english-reader-shell-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{const req=event.request;if(req.method!=='GET')return;const u=new URL(req.url);if(u.hostname==='api.mymemory.translated.net')return;event.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(res=>{if(res.ok&&(u.origin===self.location.origin||u.hostname==='cdn.jsdelivr.net')){let copy=res.clone();caches.open(CACHE).then(cache=>cache.put(req,copy)).catch(()=>{})}return res}).catch(()=>hit||Response.error()))) });
