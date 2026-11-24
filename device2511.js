/* English Pocket 25.1.1 — one personal workspace per browser/device.
 * Keeps the last active 25.1 storage namespace when upgrading, without changing
 * or deleting any saved data. 25.0 installations stay on their original keys.
 * The old profile selector is intentionally removed from the interface.
 */
(function(){
 'use strict';
 const ROOT='ep26:registry-v1';
 const raw=window.localStorage;
 let namespace='',dbSuffix='',warning='';
 try{
  const previous=JSON.parse(raw.getItem(ROOT)||'null');
  if(previous&&['p1','p2'].includes(previous.active)){
   const active=previous.active;
   // In 25.1.0 every write uses this namespace. Preserve the CURRENT workspace
   // rather than copying stale legacy records over newer results.
   namespace='ep26:'+active+':';
   dbSuffix=active==='p2'?'-p2':'';
   if(active==='p1'){
    let hasScoped=false;
    for(let i=0;i<raw.length;i++){
     const k=raw.key(i);
     if(k&&k.startsWith(namespace+'elp-')){hasScoped=true;break}
    }
    // If a previous profile upgrade failed before copying any learning data,
    // use the original 25.0 workspace, not an empty profile.
    if(!hasScoped&&raw.getItem('ep26:legacy-copied-p1-v1')!=='1')namespace='';
   }
  }
 }catch(e){warning='Не вдалося перевірити попереднє сховище: '+e.message}
 // Do not attempt to fake the localStorage object: the facade only exposes
 // methods used by English Pocket's existing modules.
 const storage={
  getItem(key){return raw.getItem(namespace+String(key))},
  setItem(key,value){raw.setItem(namespace+String(key),String(value))},
  removeItem(key){raw.removeItem(namespace+String(key))},
  key(i){return this.keys()[i]??null},
  keys(){const res=[];for(let i=0;i<raw.length;i++){
   const key=raw.key(i);if(key&&key.startsWith(namespace+'elp-'))res.push(key.slice(namespace.length));
  }return res.sort()},
  get length(){return this.keys().length}
 };
 window.EPStore=storage;
 // Compatibility with 25.1 database-name callers. No profile management UI.
 window.EPProfiles={id:'device',name:()=> 'Цей пристрій',dbName:base=>base+dbSuffix,keys:()=>storage.keys(),get warning(){return warning}};
 window.EPDevice2511={namespace:namespace||'legacy',dbSuffix:dbSuffix||'none',source:namespace?'25.1 workspace':'25.0 workspace',warning};
})();
