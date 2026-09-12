import {store} from './_shared/store.mts';
import {json,staffSession,sameOrigin} from './_shared/staff-session.mts';
export default async(req,context)=>{
 if(!staffSession(req))return json({error:'Inicia sesión con tu NIP.'},401);
 const s=store('customer-orders',context),id=new URL(req.url).searchParams.get('id');
 if(id&&!/^(?:[a-f0-9-]{36}|[0-9]{1,20})$/.test(id))return json({error:'Pedido no válido.'},400);
 try{
 if(req.method==='GET'){
 if(id){const item=await s.getWithMetadata(id,{type:'json'});return item?.data.status==='done'&&!item.data.deleted?json({order:item.data.order,version:item.etag}):json({error:'Pedido no encontrado'},404);}
 const {blobs}=await s.list();const rows=await Promise.all(blobs.map(async({key})=>{const value=await s.getWithMetadata(key,{type:'json'});return value?.data.status==='done'&&!value.data.deleted?{...value.data.order,_version:value.etag}:null;}));return json({orders:rows.filter(Boolean).sort((a,b)=>String(a.createdAt||'').localeCompare(String(b.createdAt||'')))});
 }
 if(!['PUT','DELETE'].includes(req.method)||!id)return json({error:'Método no permitido'},405);
 if(!sameOrigin(req))return json({error:'Origen no permitido'},403);
 const current=await s.getWithMetadata(id,{type:'json'});if((!current&&req.method==='DELETE')||(current&&current.data.status!=='done'))return json({error:'Pedido no encontrado'},404);
 if(!current&&req.headers.get('if-none-match')!=='*')return json({error:'Confirma que es un pedido nuevo.'},409);
 if(current&&req.headers.get('if-match')!==current.etag)return json({error:'El pedido cambió en otro dispositivo. Actualiza antes de guardarlo.'},409);
 let next=current?{...current.data}:{status:'done',order:{id,folio:id.slice(-6).toUpperCase(),createdAt:new Date().toISOString(),fecha:new Date().toLocaleDateString('es-MX'),tiempo:new Date().toLocaleTimeString('es-MX'),source:'mesero'}};if(req.method==='DELETE')next.deleted=true;
 else{
 const order=await req.json();if(!['pendiente','en_preparacion','listo','cobrado'].includes(order.estado)||!Array.isArray(order.items)||order.items.length>80)return json({error:'Datos del pedido no válidos'},400);
 if(order.items.some(i=>typeof i.name!=='string'||i.name.length>1000||!Number.isFinite(i.precio)||i.precio<0||i.precio>10000))return json({error:'Producto inválido'},400);
 next.order={...next.order,updatedAt:new Date().toISOString(),cliente:String(order.cliente||'Cliente').slice(0,40),items:order.items.map(i=>({name:i.name,precio:i.precio,price:i.precio,details:Array.isArray(i.details)?i.details.map(d=>String(d).slice(0,1000)).slice(0,8):[],nuevo:!!i.nuevo,...(typeof i.img==='string'&&!i.img.includes(':')&&!i.img.includes('..')?{img:i.img}:{} )})),estado:order.estado,...(['pendiente','en_preparacion','listo'].includes(order.kitchenEstado)?{kitchenEstado:order.kitchenEstado}:{}),...(typeof order.pagoMetodo==='string'?{pagoMetodo:order.pagoMetodo.slice(0,60)}:{})};
 next.order.total=next.order.items.reduce((sum,i)=>sum+i.precio,0);
 }
 const write=await s.setJSON(id,next,current?{onlyIfMatch:current.etag}:{onlyIfNew:true});if(!write.modified)return json({error:'El pedido cambió. Actualiza para continuar.'},409);return json({ok:true,version:write.etag});
 }catch{return json({error:'No se pudieron sincronizar los pedidos.'},503);}
};
