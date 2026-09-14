import {createHash} from 'node:crypto';
import {store} from './_shared/store.mts';
import {json,sameOrigin} from './_shared/staff-session.mts';
import {validateOrder} from './_shared/orders.mts';
import {notifyOrder} from './_shared/push.mts';
export default async(req,context)=>{
 if(req.method!=='POST')return json({error:'Método no permitido'},405);
 if(!sameOrigin(req))return json({error:'Origen no permitido'},403);
 let input;try{const body=await req.text();if(body.length>50000)throw Error();input=JSON.parse(body);}catch{return json({error:'Pedido no válido.'},400);}
 let order;try{order=validateOrder(input);}catch(e){return json({error:e.message},400);}
 // The public menu is only a convenience. The server is the final gate when a stand is closed
 // or an ingredient has sold out, so an old browser tab cannot bypass the owner's controls.
 try{
  const settings=await store('business-settings',context).get('current',{type:'json'});
  if(settings){
   const now=new Date(new Date().toLocaleString('en-US',{timeZone:'America/Mexico_City'}));
   const minutes=now.getHours()*60+now.getMinutes(),[sh,sm]=settings.schedule?.start?.split(':').map(Number)||[17,0],[eh,em]=settings.schedule?.end?.split(':').map(Number)||[24,0],start=sh*60+sm,end=eh*60+em;
   if(!settings.isOpen||minutes<start||(end<1440&&minutes>=end))return json({error:'Dulce Bocado está cerrado por ahora. Consulta la próxima ubicación y horario.'},423);
   const unavailable=order.items.find((i:any)=>settings.products?.[i.selection?.product]===false||i.selection?.ingredients?.some((x:string)=>settings.ingredients?.[x]===false));
   if(unavailable)return json({error:'Uno de los productos o ingredientes ya no está disponible. Actualiza tu pedido.'},409);
  }
 }catch(e){console.warn('Business settings check unavailable',e);}
 if(!Netlify.env.get('STAFF_PIN_HASH')||!Netlify.env.get('STAFF_SESSION_SECRET'))return json({error:'Estamos activando los pedidos en línea. Tu carrito se conserva; por favor contacta al negocio.'},503);
 const hash=createHash('sha256').update(JSON.stringify(input)).digest('hex'),orders=store('customer-orders',context),key=order.id;
 try{
 const existing=await orders.getWithMetadata(key,{type:'json'});
 if(existing&&existing.data.hash!==hash)return json({error:'Este pedido ya fue enviado con otros datos. Revisa tu comprobante.'},409);
 if(existing?.data.status==='done')return json({order:existing.data.receipt||existing.data.order,duplicate:true});
 if(existing?.data.status==='processing'&&existing.data.started>Date.now()-90000)return json({error:'Tu pedido se está confirmando. Espera unos segundos y reintenta.'},409);
 const state=existing?.data||{hash,order};state.status='processing';state.started=Date.now();
 const claim=await orders.setJSON(key,state,existing?{onlyIfMatch:existing.etag}:{onlyIfNew:true});if(!claim.modified)return json({error:'Tu pedido ya se está procesando. Reintenta en unos segundos.'},409);
 try{
 order=state.order;
 if(order.pago==='Pago en la app'&&!order.paymentUrl){
 const token=Netlify.env.get('MP_ACCESS_TOKEN');if(!token)throw Error('Pago en línea no disponible.');
 const r=await fetch('https://api.mercadopago.com/checkout/preferences',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`,'X-Idempotency-Key':order.id},body:JSON.stringify({external_reference:order.id,items:[{title:`Pedido ${order.folio} · Dulce Bocado`,unit_price:order.total,quantity:1,currency_id:'MXN'}],back_urls:{success:new URL('/cliente.html',req.url).href,pending:new URL('/cliente.html',req.url).href,failure:new URL('/cliente.html',req.url).href}}),signal:AbortSignal.timeout(10000)});
 const data=await r.json();if(!r.ok||!data.init_point)throw Error('No pudimos preparar el enlace de pago. Reintenta.');order.paymentUrl=data.init_point;
 await orders.setJSON(key,{...state,order});
 }

 // Persist success before sending alerts: retries can never create a second order or reset its kitchen status.
 await orders.setJSON(key,{hash,status:'done',order,receipt:structuredClone(order)});
 try{await notifyOrder(order,context);}catch{console.warn('Push unavailable for saved order');}
 return json({order});
 }catch(e){await orders.setJSON(key,{hash,status:'retry',order});return json({error:e.message||'No pudimos confirmar el pedido.'},503);}
 }catch{return json({error:'No pudimos confirmar el pedido. Tu carrito está intacto; reintenta.'},503);}
};
export const config={rateLimit:{windowLimit:10,windowSize:60,aggregateBy:['ip','domain']}};
