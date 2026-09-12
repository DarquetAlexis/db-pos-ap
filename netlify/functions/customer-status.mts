import {store} from './_shared/store.mts';
import {json} from './_shared/staff-session.mts';
// An unguessable UUID is the capability for this minimal, non-personal status response.
export default async(req,context)=>{
 if(req.method!=='GET')return json({error:'Método no permitido'},405);
 const id=new URL(req.url).searchParams.get('id');
 if(!id||!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(id))return json({error:'Pedido no válido'},400);
 try{const item=await store('customer-orders',context).get(id,{type:'json'});
 if(!item||item.status!=='done')return json({error:'Pedido no encontrado'},404);
 const o=item.order;return json({estado:item.deleted?'archivado':(o.kitchenEstado||o.estado),paid:o.estado==='cobrado',total:o.total,updatedAt:o.updatedAt||o.createdAt});
 }catch{return json({error:'No se pudo consultar el estado'},503);}
};
export const config={rateLimit:{windowSize:60,aggregateBy:['ip','domain'],windowLimit:120}};
