window.posOrdersCollection=function(legacy){
 const endpoint='/.netlify/functions/staff-orders',versions=new Map(),writes=new Map();let refresh=()=>{};
 const isWeb=id=>/^[a-f0-9-]{36}$/.test(id);
 async function api(id,options={}){const r=await fetch(endpoint+(id?'?id='+encodeURIComponent(id):''),{cache:'no-store',...options});const data=await r.json();if(!r.ok)throw Error(data.error||'No se pudo sincronizar el pedido.');return data;}
 const docObject=o=>({id:o.id,exists:true,data:()=>o});
 function report(error){let el=document.getElementById('order-sync-status');if(!el){el=document.createElement('p');el.id='order-sync-status';el.className='fixed top-0 inset-x-0 z-[110] bg-red-700 text-white p-3 text-sm';document.body.appendChild(el);}el.textContent=error.message;}
 return {
 onSnapshot(callback,onError){let previous=[],web=[],stopped=false;const emit=()=>{if(!stopped)callback({forEach:fn=>[...previous.filter(o=>!web.some(w=>w.id===o.id)),...web].forEach(o=>fn(docObject(o)))})};
 const unsubscribe=legacy.onSnapshot(s=>{previous=[];s.forEach(d=>previous.push({id:d.id,...d.data()}));emit()},()=>{/* Preserve new orders even when the legacy database is unavailable. */});
 refresh=async()=>{try{if(!await window.staffReady||stopped)return;const data=await api();web=data.orders;web.forEach(o=>versions.set(o.id,o._version));document.getElementById('order-sync-status')?.remove();emit();}catch(e){report(e);}};refresh();const interval=setInterval(refresh,5000);return()=>{stopped=true;clearInterval(interval);unsubscribe?.();};
 },
 doc(id){id=String(id);if(!isWeb(id))return legacy.doc(id);return {
 async get(){const data=await api(id);versions.set(id,data.version);return docObject(data.order)},
 set(order){const snapshot=structuredClone(order);const action=(writes.get(id)||Promise.resolve()).catch(()=>{}).then(async()=>{try{if(!versions.has(id)){const d=await api(id);versions.set(id,d.version);}const data=await api(id,{method:'PUT',headers:{'Content-Type':'application/json','If-Match':versions.get(id)},body:JSON.stringify(snapshot)});versions.set(id,data.version);await refresh();}catch(e){report(e);await refresh();throw e;}});writes.set(id,action);return action;},
 async delete(){try{if(!versions.has(id)){const d=await api(id);versions.set(id,d.version);}await api(id,{method:'DELETE',headers:{'If-Match':versions.get(id)}});await refresh();}catch(e){report(e);throw e;}}
 };}
 };
};
