import {store} from './_shared/store.mts';
import {json, sameOrigin, staffSession} from './_shared/staff-session.mts';

const key='current';
const initial={
  isOpen:true,
  schedule:{start:'17:00',end:'24:00'},
  locations:[
    {date:'2026-09-14',label:'Hoy · Parque Juárez',place:'Santa Ana Chiautempan, Tlaxcala'},
    {date:'2026-09-15',label:'Mañana · Los Portales',place:'Santa Ana Chiautempan, Tlaxcala'},
    {date:'2026-09-20',label:'Sábado · Ocotlán',place:'Frente a la Presidencia Municipal, Ocotlán, Tlaxcala'}
  ],
  products:{},ingredients:{},updatedAt:null
};
const cleaned=(x:any)=>({
 isOpen:!!x?.isOpen,
 schedule:{start:/^\d{2}:\d{2}$/.test(x?.schedule?.start)?x.schedule.start:'17:00',end:/^(?:\d{2}|24):\d{2}$/.test(x?.schedule?.end)?x.schedule.end:'24:00'},
 locations:Array.isArray(x?.locations)?x.locations.slice(0,12).map((l:any)=>({date:String(l.date||'').slice(0,10),label:String(l.label||'Ubicación').slice(0,80),place:String(l.place||'').slice(0,160),mapUrl:String(l.mapUrl||'').slice(0,500)})).filter((l:any)=>/^\d{4}-\d{2}-\d{2}$/.test(l.date)):initial.locations,
 products:Object.fromEntries(Object.entries(x?.products||{}).slice(0,120).map(([k,v])=>[String(k).slice(0,80),!!v])),
 ingredients:Object.fromEntries(Object.entries(x?.ingredients||{}).slice(0,80).map(([k,v])=>[String(k).slice(0,80),!!v])),updatedAt:new Date().toISOString()
});
export default async(req:any,context:any)=>{
 const s=store('business-settings',context);
 if(req.method==='GET'){const current=await s.get(key,{type:'json'});if(!current)await s.setJSON(key,cleaned(initial),{onlyIfNew:true});return json(cleaned(current||initial));}
 if(req.method!=='PUT')return json({error:'Método no permitido'},405);
 if(!staffSession(req))return json({error:'Inicia sesión con tu NIP.'},401);
 if(!sameOrigin(req))return json({error:'Origen no permitido'},403);
 try{return json(await s.setJSON(key,cleaned(await req.json())).then(()=>({ok:true})));}catch{return json({error:'No se pudo guardar la configuración.'},503);}
};
