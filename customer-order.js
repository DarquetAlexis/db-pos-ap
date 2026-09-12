let submitting=false;
function saved(key){try{return JSON.parse(sessionStorage.getItem(key)||'null')}catch{return null}}
function remember(key,value){sessionStorage.setItem(key,JSON.stringify(value));}
function clearCustomer(){cart=[];customerName.value='';$('order-note').value='';$('cash-option').value='';$('cash-other').value='';$('cash-detail').value='';document.querySelector('input[name=payment]').checked=true;updateCart();closeCart();}
function showConfirmed(order){
 const section=$('order-confirmation');section.classList.remove('hidden');section.innerHTML=`<h2 class="font-black text-2xl">¡Pedido recibido! #${esc(order.folio)}</h2><p class="mt-2">${esc(order.cliente)}, tu pedido de $${order.total} ya está registrado. Tiempo estimado: 20–40 minutos.</p><p class="text-sm mt-2">Tu carrito quedó vacío para evitar enviarlo dos veces. No necesitas WhatsApp.</p><div class="grid gap-2 mt-4"><button id="download-receipt" class="bg-purple-600 text-white p-3 rounded-xl font-bold">Descargar mi comprobante</button>${order.paymentUrl?'<a id="open-payment" class="bg-blue-600 text-white p-3 rounded-xl font-bold text-center" target="_blank" rel="noopener">Pagar con Mercado Pago</a><p class="text-sm">El pedido está registrado; el pago está pendiente de confirmación.</p>':''}<a id="share-whatsapp" class="pill p-3 rounded-xl text-center" target="_blank" rel="noopener">Compartir por WhatsApp (opcional)</a><button id="new-customer" class="underline p-3">Comenzar otro pedido</button></div>`;
 if(order.paymentUrl)$('open-payment').href=order.paymentUrl;
 const msg=`🥞 Pedido #${order.folio}\nCliente: ${order.cliente}\n${order.items.map(i=>`${i.name} — $${i.price}\n${i.details.join('; ')}`).join('\n')}\nTotal: $${order.total}\nPago: ${order.pago}${order.efectivo!==null?`\nEfectivo: $${order.efectivo} · Cambio: $${order.cambio} ${order.denominacion}`:''}${order.nota?'\nNota: '+order.nota:''}`;
 $('share-whatsapp').href='https://wa.me/522461645366?text='+encodeURIComponent(msg);
 $('download-receipt').onclick=async()=>{const button=$('download-receipt');button.disabled=true;try{await makeReceipt(order)}catch{alert('No se pudo descargar la imagen. Tu pedido sigue confirmado; intenta nuevamente.')}finally{button.disabled=false}};
 $('new-customer').onclick=()=>{sessionStorage.removeItem('db-last-order');section.classList.add('hidden');customerName.focus()};section.scrollIntoView({behavior:'smooth',block:'start'});
 franSummary.textContent=`¡Listo! Pedido #${order.folio} recibido. Conserva tu comprobante. Tu carrito ya quedó limpio.`;
}
async function placeOrder(){
 if(submitting)return;
 let pending=saved('db-pending-order');
 if(!pending){
 const name=customerName.value.trim();if(!name)return alert('Escribe tu nombre para identificar el pedido.');if(!cart.length)return alert('Agrega al menos un producto.');
 const payment=document.querySelector('input[name=payment]:checked').value,cash=readCash();if(payment==='Efectivo contra entrega'&&(!Number.isFinite(cash)||cash<total()))return alert('Indica con cuánto pagarás. Debe cubrir el total del pedido.');
 pending={id:crypto.randomUUID(),cliente:name,items:structuredClone(cart),pago:payment,nota:$('order-note').value.trim(),efectivo:payment==='Efectivo contra entrega'?cash:null,denominacion:payment==='Efectivo contra entrega'?$('cash-detail').value.trim():''};
 try{remember('db-pending-order',pending)}catch{return alert('Permite el almacenamiento del navegador para confirmar tu pedido sin duplicarlo.');}
 }
 submitting=true;placeOrderButton.disabled=true;placeOrderButton.textContent='Confirmando pedido…';
 try{
 const response=await fetch('/.netlify/functions/customer-order',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(pending)});
 const data=await response.json();if(!response.ok){if(response.status===400)sessionStorage.removeItem('db-pending-order');throw Error(data.error||'No se pudo confirmar el pedido.');}
 // Clear only after a server acknowledgement; downloading or sharing cannot resubmit the order.
 try{remember('db-last-order',data.order)}catch{}
 sessionStorage.removeItem('db-pending-order');clearCustomer();showConfirmed(data.order);
 }catch(e){alert(e.message||'No recibimos confirmación. Reintenta; conservaremos el mismo folio para evitar duplicados.');}
 finally{submitting=false;placeOrderButton.disabled=false;placeOrderButton.textContent=saved('db-pending-order')?'Reintentar el mismo pedido':'Confirmar pedido';}
}
const previousOrder=saved('db-last-order');if(previousOrder)showConfirmed(previousOrder);
const pendingOrder=saved('db-pending-order');if(pendingOrder){cart=pendingOrder.items;customerName.value=pendingOrder.cliente;updateCart();placeOrderButton.textContent='Reintentar el mismo pedido';franSummary.textContent='Hay un pedido por confirmar. Pulsa Continuar y reintenta: conservaremos el mismo folio.';}
