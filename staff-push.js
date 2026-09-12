function pushStatus(text){const el=document.getElementById('push-status');if(el)el.textContent=text;}
window.enableStaffPush=async()=>{try{
 if(!('serviceWorker'in navigator)||!('PushManager'in window)||!('Notification'in window))throw Error('Este navegador no admite avisos. En iPhone, agrega el POS a Inicio y ábrelo desde allí.');
 const permission=await Notification.requestPermission();if(permission!=='granted')throw Error('Permite las notificaciones en la configuración del navegador.');
 const registration=await navigator.serviceWorker.register('/staff-sw.js');await navigator.serviceWorker.ready;
 const response=await fetch('/.netlify/functions/push-subscription',{cache:'no-store'}),data=await response.json();if(!response.ok)throw Error(data.error);
 const key=Uint8Array.from(atob(data.publicKey.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
 const sub=await registration.pushManager.getSubscription()||await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:key});
 const saved=await fetch('/.netlify/functions/push-subscription',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(sub)});if(!saved.ok)throw Error('No se pudo registrar este teléfono.');pushStatus('Avisos activados en este dispositivo.');
 }catch(e){pushStatus(e.message);}};
window.stopStaffPush=async()=>{try{const registration=await navigator.serviceWorker.getRegistration('/'),sub=await registration?.pushManager.getSubscription();if(sub){await fetch('/.netlify/functions/push-subscription',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify(sub)});await sub.unsubscribe();}}catch{}};
