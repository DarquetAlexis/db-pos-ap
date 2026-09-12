import {createHash} from 'node:crypto';
import {sameOrigin,staffSession,json} from './_shared/staff-session.mts';
import {store} from './_shared/store.mts';
import {validSubscription} from './_shared/push.mts';
export default async(req,context)=>{
 if(!staffSession(req))return json({error:'Inicia sesión con tu NIP.'},401);
 if(req.method==='GET'){const publicKey=Netlify.env.get('VAPID_PUBLIC_KEY');return publicKey?json({publicKey}):json({error:'Las notificaciones aún no están configuradas.'},503);}
 if(!['POST','DELETE'].includes(req.method))return json({error:'Método no permitido'},405);
 if(!sameOrigin(req))return json({error:'Origen no permitido'},403);
 try{const sub=await req.json();if(!validSubscription(sub))return json({error:'Suscripción no válida.'},400);const key=createHash('sha256').update(sub.endpoint).digest('hex'),s=store('staff-push',context);if(req.method==='DELETE')await s.delete(key);else await s.setJSON(key,sub);return json({ok:true});}catch{return json({error:'No se pudo guardar la notificación.'},503);}
};
export const config={rateLimit:{windowLimit:20,windowSize:60,aggregateBy:['ip','domain']}};
