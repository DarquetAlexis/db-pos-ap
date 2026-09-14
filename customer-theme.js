(()=>{
 const style=document.createElement('style');
 style.textContent=`
  :root{--pink:#f52f92;--purple:#4a126f;--ink:#351143;--neon:#d946ef}
  body{background:radial-gradient(circle at 8% 0,#9d2ab1 0,transparent 29rem),radial-gradient(circle at 100% 14%,#f24ba3 0,transparent 26rem),#25052f;color:var(--ink)}
  body>main{background:linear-gradient(180deg,#fffaff,#fff1fb 40%,#fbf7ff);border-radius:0 0 2rem 2rem;box-shadow:0 0 35px rgba(240,63,167,.45)}
  header{background:linear-gradient(105deg,#310640,#73115e 55%,#c32983)!important;color:#fff;border-bottom:2px solid #ff9bdb!important;box-shadow:0 5px 20px rgba(51,4,72,.35)}
  header h1,header p{color:#fff!important;text-shadow:0 2px 0 rgba(0,0,0,.18)}
  .neon{box-shadow:0 0 0 2px rgba(206,85,219,.3),0 10px 24px rgba(96,23,115,.14),0 0 18px rgba(247,61,182,.15)!important}
  .pill{border:1.5px solid #e6b2f4!important;background:#fff!important;box-shadow:0 5px 15px rgba(104,33,122,.09)}
  .product{transition:transform .18s ease,box-shadow .18s ease;border:1.5px solid #efc2fa!important;background:linear-gradient(155deg,#fff,#fff5fc)!important}
  .product:active{transform:scale(.96)} .product:hover{transform:translateY(-3px);box-shadow:0 13px 26px rgba(184,33,145,.25)!important}
  #fran-card,#business-status{background:linear-gradient(110deg,#fff,#fff0fb)!important;border:2px solid #edb6f3!important}
  #cart-modal>div,#option-modal>div{border:2px solid #eab6f7;box-shadow:0 0 0 5px rgba(219,70,239,.16),0 22px 55px rgba(32,4,48,.5)}
  #place-order{background:linear-gradient(100deg,#22b961,#22d46e)!important;box-shadow:0 7px 0 #118346,0 13px 20px rgba(22,178,84,.26);transition:transform .15s ease,filter .15s ease}
  #place-order:active{transform:translateY(4px);box-shadow:0 3px 0 #118346,0 7px 13px rgba(22,178,84,.25)}
  #place-order:disabled{filter:grayscale(.45);box-shadow:none}
  body>div.fixed.bottom-0{background:linear-gradient(100deg,#351143,#7c1b72)!important;border-top:2px solid #f691d7!important;box-shadow:0 -7px 24px rgba(34,4,54,.35)!important}
  body>div.fixed.bottom-0,body>div.fixed.bottom-0 *{color:#fff!important}
 `;
 document.head.append(style);
})();
