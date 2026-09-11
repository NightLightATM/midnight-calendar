const CACHE="midnight-cal-v2";
const SHELL=["./","./index.html","./manifest.json","./icon-192.png","./icon-512.png","./icon-maskable.png","./apple-touch-icon.png"];

self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});

self.addEventListener("fetch",e=>{
  const req=e.request;const url=new URL(req.url);
  if(req.method!=="GET"||url.origin!==location.origin)return;
  const isDoc=req.mode==="navigate"||url.pathname.endsWith("/")||url.pathname.endsWith(".html");
  if(isDoc){
    e.respondWith(fetch(req).then(res=>{const c=res.clone();caches.open(CACHE).then(ch=>ch.put(req,c)).catch(()=>{});return res;}).catch(()=>caches.match(req).then(r=>r||caches.match("./index.html"))));
  }else{
    e.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(res=>{const c=res.clone();caches.open(CACHE).then(ch=>ch.put(req,c)).catch(()=>{});return res;}).catch(()=>cached)));
  }
});

async function readSnapshot(){try{const c=await caches.open(CACHE);const res=await c.match("__mc_data__");if(!res)return[];const data=await res.json();return Array.isArray(data.reminders)?data.reminders:[];}catch(_){return[];}}
function pad(n){return String(n).padStart(2,"0");}
function dayKey(d){return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());}
function daysInMonth(y,m){return new Date(y,m+1,0).getDate();}
function occursOn(r,date){
  if(r.deleted)return false;
  if(r.type==="once")return r.date===dayKey(date);
  if(r.type==="weekly")return date.getDay()===r.weekday;
  if(r.type==="monthly"){const dim=daysInMonth(date.getFullYear(),date.getMonth());return date.getDate()===Math.min(r.day,dim);}
  if(r.type==="yearly"){if(date.getMonth()!==r.month)return false;const dim=daysInMonth(date.getFullYear(),r.month);return date.getDate()===Math.min(r.day,dim);}
  return false;
}
function fmtTime(hhmm){const[h,m]=(hhmm||"09:00").split(":").map(Number);const ap=h>=12?"PM":"AM";const h12=((h+11)%12)+1;return h12+":"+pad(m)+" "+ap;}

async function checkAndNotify(){
  if(Notification.permission!=="granted")return;
  const rems=await readSnapshot();
  const now=new Date();const key=dayKey(now);
  const due=rems.filter(r=>occursOn(r,now)&&!(r.completed&&r.completed[key]));
  for(const r of due){
    const[h,m]=(r.time||"09:00").split(":").map(Number);
    const when=new Date(now);when.setHours(h,m,0,0);
    if(when>now)continue;
    await self.registration.showNotification("🌙 "+r.title,{body:"Due "+fmtTime(r.time)+" - open Midnight and tick it off to clear this",tag:r.id+"|"+key,renotify:true,requireInteraction:true,icon:"./icon-192.png",badge:"./icon-192.png",data:{url:"./index.html"}});
  }
}

self.addEventListener("periodicsync",e=>{if(e.tag==="mc-check")e.waitUntil(checkAndNotify());});
self.addEventListener("message",e=>{if(e.data==="check")e.waitUntil(checkAndNotify());});
self.addEventListener("push",e=>{
  let payload={};try{payload=e.data?e.data.json():{};}catch(_){}
  e.waitUntil(self.registration.showNotification(payload.title||"🌙 Midnight Calendar",{body:payload.body||"You have a reminder due.",tag:payload.tag||"mc-push",renotify:true,requireInteraction:true,icon:"./icon-192.png",badge:"./icon-192.png",data:{url:"./index.html"}}));
});
self.addEventListener("notificationclick",e=>{
  e.notification.close();
  const target=(e.notification.data&&e.notification.data.url)||"./index.html";
  e.waitUntil(self.clients.matchAll({type:"window",includeUncontrolled:true}).then(list=>{for(const c of list){if("focus"in c){c.postMessage("focus-today");return c.focus();}}if(self.clients.openWindow)return self.clients.openWindow(target);}));
});
