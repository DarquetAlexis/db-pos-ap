import webpush from 'web-push';
import {store} from './store.mts';
export async function notifyOrder(order,context){
 const subscriptions=store('staff-push',context),all=await subscriptions.list();let delivered=0;
 const publicKey=Netlify.env.get('VAPID_PUBLIC_KEY'),privateKey=Netlify.env.get('VAPID_PRIVATE_KEY');if(!publicKey||!privateKey)return {delivered:0};
 const payload=JSON.stringify({title:`Pedido #${order.folio} · ${order.cliente}`,body:`${order.items.length} productos · $${order.total} · ${order.pago}${order.cambio!=null?' · Cambio $'+order.cambio:''}`,tag:'order-'+order.id,url:'/mesero.html',icon:'/logo.png'});
 await Promise.all(all.blobs.map(async({key})=>{const sub=await subscriptions.get(key,{type:'json'});if(!sub)return;try{await webpush.sendNotification(sub,payload,{TTL:3600,timeout:8000,vapidDetails:{subject:'mailto:Alexx.malo.sss@gmail.com',publicKey,privateKey}});delivered++;}catch(e){if([404,410].includes(e.statusCode))await subscriptions.delete(key);}}));return {delivered};
}
export function validSubscription(sub){try{const u=new URL(sub.endpoint);const h=u.hostname;return u.protocol==='https:'&&!u.username&&!u.password&&(!u.port||u.port==='443')&&(h==='fcm.googleapis.com'||h==='updates.push.services.mozilla.com'||h.endsWith('.push.apple.com')||h.endsWith('.notify.windows.com'))&&typeof sub.keys?.p256dh==='string'&&typeof sub.keys?.auth==='string'&&sub.keys.p256dh.length<200&&sub.keys.auth.length<100;}catch{return false;}}
