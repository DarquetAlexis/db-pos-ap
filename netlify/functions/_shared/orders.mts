import catalog from './order-catalog.json' with {type:'json'};
export function validateOrder(input){
 if(!/^[a-f0-9-]{36}$/.test(input.id||''))throw Error('Identificador de pedido inválido.');
 const text=(v,n)=>typeof v==='string'?v.trim().slice(0,n):'';
 const name=text(input.cliente,40);if(!name)throw Error('Escribe tu nombre.');
 if(!Array.isArray(input.items)||input.items.length<1||input.items.length>40)throw Error('El pedido debe contener entre 1 y 40 artículos.');
 const items=input.items.map(item=>{
 const s=item.selection,p=catalog.products.find(p=>p.name===s?.product);if(!p)throw Error('Producto no válido.');
 let price=p.price,name=p.name,details=[];
 if(p.sizes){const size=p.sizes.find(v=>v[0]===s.size);if(!size)throw Error('Tamaño no válido.');price=size[1];name+=` (${size[0]})`;}
 if(p.type==='crepe'){
 if(!Array.isArray(s.ingredients)||s.ingredients.some(v=>!catalog.ingredients.includes(v)))throw Error('Ingrediente no válido.');
 const ingredients=[...new Set(s.ingredients)];price+=ingredients.filter(v=>!p.included.includes(v)).reduce((sum,v)=>sum+(catalog.premiumExtras.includes(v)?15:10),0);
 details.push('Ingredientes: '+(ingredients.join(', ')||'sencilla'));const removed=p.included.filter(v=>!ingredients.includes(v));if(removed.length)details.push('Sin: '+removed.join(', '));
 }
 if(p.type==='combo'){const allowed=['Fresa','Plátano','Durazno','Nuez','Almendra','Chispas de chocolate'];if(!Array.isArray(s.combo)||s.combo.some(v=>!allowed.includes(v)))throw Error('Selección no válida.');details.push('Selección: '+([...new Set(s.combo)].join(', ')||'sin frutas ni toppings'));}
 if(p.type==='frappe'){
 if(!Array.isArray(s.drinks)||s.drinks.length!==(p.quantity||1))throw Error('Completa las opciones de cada vaso.');
 s.drinks.forEach((d,n)=>{if(!['Con crema batida','Sin crema batida'].includes(d.cream)||!['Normal','Menos azúcar','Más azúcar'].includes(d.sugar)||!['Entera','Deslactosada'].includes(d.milk))throw Error('Opción del frappé inválida.');details.push(`${p.quantity===2?'Vaso '+(n+1)+': ':''}${d.cream}; azúcar: ${d.sugar}; leche: ${d.milk}`);});
 }
 const note=text(s.note,240);if(note)details.push('Nota: '+note);return {name,price,precio:price,img:p.img,details,quantity:p.quantity||1,nuevo:true};
 });
 const total=items.reduce((s,i)=>s+i.price,0);if(!['Efectivo contra entrega','Tarjeta contra entrega','Pago en la app'].includes(input.pago))throw Error('Forma de pago inválida.');
 const efectivo=input.pago==='Efectivo contra entrega'?Number(input.efectivo):null;if(efectivo!==null&&(!Number.isFinite(efectivo)||efectivo<total||efectivo>10000))throw Error('Indica un monto de efectivo que cubra el pedido.');
 const now=new Date();return {id:input.id,folio:input.id.slice(0,8).toUpperCase(),cliente:name,items,total,pago:input.pago,efectivo,cambio:efectivo===null?null:Number((efectivo-total).toFixed(2)),denominacion:efectivo===null?'':text(input.denominacion,100),nota:text(input.nota,300),estado:'pendiente',origen:'Cliente web',estimado:'20–40 minutos',fecha:now.toLocaleDateString('es-MX',{timeZone:'America/Mexico_City'}),tiempo:now.toLocaleTimeString('es-MX',{timeZone:'America/Mexico_City'}),createdAt:now.toISOString(),paymentUrl:''};
}
