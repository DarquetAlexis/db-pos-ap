window.posOrdersCollection=function(legacy){
 const endpoint='/.netlify/functions/staff-orders',versions=new Map(),writes=new Map();let refresh=async()=>{},busy=false;
 async function api(id,options={}){const r=await fetch(endpoint+(id?'?id='+encodeURIComponent(id):''),{cache:'no-store',...options});const data=await r.json();if(!r.ok){const e=Error(data.error||'No se pudo sincronizar el pedido.');e.status=r.status;throw e;}return data;}
 const docObject=o=>({id:o.id,exists:true,data:()=>structuredClone(o)});
 function report(error){let el=document.getElementById('order-sync-status');if(!el){el=document.createElement('p');el.id='order-sync-status';el.className='fixed top-0 inset-x-0 z-[110] bg-red-700 text-white p-3 text-sm';document.body.appendChild(el);}el.textContent=error.message+' Revisa la conexión antes de continuar.';}
 return {
 onSnapshot(callback){let previous=[],stopped=false;
 const unsubscribe=legacy?.onSnapshot(s=>{previous=[];s.forEach(d=>previous.push({id:d.id,...d.data()}));},()=>{});
 refresh=async()=>{if(busy||writes.size||stopped||!await window.staffReady)return;busy=true;try{const data=await api();if(stopped||writes.size)return;data.orders.forEach(o=>versions.set(o.id,o._version));const rows=[...previous.filter(o=>!data.orders.some(w=>w.id===o.id)),...data.orders];callback({forEach:fn=>rows.forEach(o=>fn(docObject(o)))});document.getElementById('order-sync-status')?.remove();}catch(e){report(e);}finally{busy=false;}};
 refresh();const interval=setInterval(refresh,2000);const resume=()=>refresh();window.addEventListener('online',resume);window.addEventListener('focus',resume);return()=>{stopped=true;clearInterval(interval);unsubscribe?.();window.removeEventListener('online',resume);window.removeEventListener('focus',resume);};
 },
 doc(id){id=String(id);return {
 async get(){if(writes.has(id))await writes.get(id);const data=await api(id);versions.set(id,data.version);return docObject({...data.order,_version:data.version});},
 set(order){const snapshot=structuredClone(order),prior=writes.get(id),expected=versions.get(id)||snapshot._version;
 const action=(prior||Promise.resolve()).then(async()=>{let version=prior?versions.get(id):expected;if(!version){try{const d=await api(id);version=d.version;/* An existing unseen order must be reviewed before replacing it. */throw Object.assign(Error('El pedido ya existe. Actualiza antes de editarlo.'),{status:409});}catch(e){if(e.status!==404)throw e;}}
 const data=await api(id,{method:'PUT',headers:{'Content-Type':'application/json',...(version?{'X-Order-Version':version}:{'X-Order-Create':'*'})},body:JSON.stringify(snapshot)});versions.set(id,data.version);});writes.set(id,action);
 action.then(()=>{if(writes.get(id)===action){writes.delete(id);refresh();}},e=>{if(writes.get(id)===action){writes.delete(id);refresh().then(()=>report(e));}report(e);});return action;},
 async delete(){try{if(writes.has(id))await writes.get(id);if(!versions.has(id)){const d=await api(id);versions.set(id,d.version);}await api(id,{method:'DELETE',headers:{'X-Order-Version':versions.get(id)}});await refresh();}catch(e){report(e);throw e;}}
 };}
 };
};
