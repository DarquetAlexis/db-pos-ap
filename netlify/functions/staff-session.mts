import { createHash } from 'node:crypto';
import { sameOrigin,secureEqual,staffSession,sessionCookie,json } from './_shared/staff-session.mts';
import {store} from './_shared/store.mts';
export default async(req,context)=>{
 if(req.method==='GET')return json({authenticated:staffSession(req)});
 if(!['POST','DELETE'].includes(req.method))return json({error:'Método no permitido'},405);
 if(!sameOrigin(req))return json({error:'Origen no permitido'},403);
 if(req.method==='DELETE')return json({ok:true},200,{'Set-Cookie':'__Host-db_staff=; Secure; HttpOnly; SameSite=Strict; Path=/; Max-Age=0'});
 try{
 const pin=Netlify.env.get('STAFF_PIN');if(!pin)return json({error:'El acceso por NIP aún no está configurado.'},503);
 const attempts=store('staff-pin-attempts',context),key=createHash('sha256').update(context.ip||'unknown').digest('hex');
 const previous=await attempts.getWithMetadata(key,{type:'json'});const now=Date.now();const state=previous?.data?.until>now?previous.data:{count:0,until:now+900000};
 if(state.count>=5)return json({error:'Demasiados intentos. Intenta de nuevo en 15 minutos.'},429);
 const saved=await attempts.setJSON(key,{count:state.count+1,until:state.until},previous?{onlyIfMatch:previous.etag}:{onlyIfNew:true});
 if(!saved.modified)return json({error:'Intenta de nuevo en unos segundos.'},429);
 const body=await req.json();if(!/^\d{4}$/.test(body.pin||'')||!secureEqual(body.pin,pin))return json({error:'NIP incorrecto.'},401);
 const cookie=sessionCookie();await attempts.delete(key);return json({authenticated:true},200,{'Set-Cookie':cookie});
 }catch{return json({error:'No se pudo abrir la sesión. Intenta nuevamente.'},503);}
};
export const config={rateLimit:{windowLimit:20,windowSize:60,aggregateBy:['ip','domain']}};
