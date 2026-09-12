async function receiptImage(path){if(typeof path!=='string'||path.includes('..')||path.includes(':'))return null;return new Promise(resolve=>{const i=new Image();const timer=setTimeout(()=>resolve(null),6000);i.onload=()=>{clearTimeout(timer);resolve(i)};i.onerror=()=>{clearTimeout(timer);resolve(null)};i.src=path;});}
function fitImage(ctx,img,x,y,w,h){if(!img)return;const scale=Math.min(w/img.width,h/img.height);ctx.drawImage(img,x+(w-img.width*scale)/2,y+(h-img.height*scale)/2,img.width*scale,img.height*scale);}
async function makeReceipt(order){
 const paths=[...new Set(['logo.png','fran.png',...order.items.map(i=>i.img)])];const loaded=await Promise.all(paths.map(receiptImage)),images=Object.fromEntries(paths.map((p,n)=>[p,loaded[n]]));
 const c=receiptCanvas,x=c.getContext('2d');c.width=1080;x.font='30px sans-serif';
 function wrap(value,width){const lines=[];let line='';for(const word of String(value).split(/\s+/)){const candidate=line?line+' '+word:word;if(x.measureText(candidate).width<=width){line=candidate;continue;}if(line){lines.push(line);line='';}if(x.measureText(word).width<=width){line=word;continue;}for(const char of word){if(x.measureText(line+char).width>width){lines.push(line);line='';}line+=char;}}if(line)lines.push(line);return lines;}
 const blocks=order.items.map(i=>{x.font='bold 30px sans-serif';const title=wrap(i.name,660);x.font='28px sans-serif';const details=wrap(i.details.join(' · '),660);return {item:i,title,details,height:Math.max(140,(title.length+details.length)*42+38)};});
 x.font='30px sans-serif';
 const footer=[`TOTAL: $${order.total}`,`Pago: ${order.pago}`,order.efectivo!==null?`Efectivo: $${order.efectivo} · Cambio: $${order.cambio} ${order.denominacion}`:'',order.nota?'Instrucciones: '+order.nota:'','Tiempo estimado: 20–40 minutos','Comprobante de pedido; no acredita el pago.'].filter(Boolean).flatMap(v=>wrap(v,900));
 const pages=[[]];let height=700;for(const block of blocks){if(height+block.height>8500){pages.push([]);height=700;}pages.at(-1).push(block);height+=block.height;}
 if(height+footer.length*44+200>10000)pages.push([]);
 for(let page=0;page<pages.length;page++){
 const last=page===pages.length-1,rows=pages[page];c.height=650+rows.reduce((s,b)=>s+b.height,0)+(last?footer.length*44+160:120);
 const gradient=x.createLinearGradient(0,0,1080,c.height);gradient.addColorStop(0,'#fff1f8');gradient.addColorStop(1,'#e9faff');x.fillStyle=gradient;x.fillRect(0,0,c.width,c.height);x.strokeStyle='#bc8ce4';x.lineWidth=5;x.strokeRect(25,25,1030,c.height-50);
 fitImage(x,images['logo.png'],60,45,220,210);fitImage(x,images['fran.png'],885,45,120,215);
 x.fillStyle='#482451';x.textAlign='left';x.font='bold 46px sans-serif';x.fillText('DULCE BOCADO',300,135);x.font='bold 28px sans-serif';x.fillText('HECHO A TU ANTOJO',300,180);
 x.font='bold 36px sans-serif';x.fillText('COMPROBANTE DE PEDIDO',70,320);x.font='30px sans-serif';x.fillText(`Folio: ${order.folio} · ${order.fecha} ${order.tiempo}`,70,370);const names=wrap('Cliente: '+order.cliente,900);names.forEach((l,n)=>x.fillText(l,70,414+n*36));x.font='24px sans-serif';x.fillText(`Página ${page+1} de ${pages.length}`,70,490);
 let y=530;for(const block of rows){x.fillStyle='#ffffff';x.fillRect(55,y-15,970,block.height-10);fitImage(x,images[block.item.img],70,y,125,125);x.fillStyle='#482451';x.font='bold 30px sans-serif';block.title.forEach((line,n)=>x.fillText(line,215,y+30+n*42));x.font='28px sans-serif';block.details.forEach((line,n)=>x.fillText(line,215,y+30+(n+block.title.length)*42));x.fillStyle='#a43785';x.textAlign='right';x.font='bold 30px sans-serif';x.fillText('$'+block.item.price,995,y+30);x.textAlign='left';y+=block.height;}
 if(last){y+=30;x.fillStyle='#482451';x.font='30px sans-serif';footer.forEach((line,n)=>x.fillText(line,70,y+n*44));}
 x.fillStyle='#8b4db0';x.font='26px sans-serif';x.fillText('@dulcebocadotlax · ¡Gracias por tu pedido!',70,c.height-55);
 const a=document.createElement('a');a.href=c.toDataURL('image/png');a.download=`Dulce-Bocado-${order.folio}${pages.length>1?'-'+(page+1):''}.png`;a.click();
 }
}
