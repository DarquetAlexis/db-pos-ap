(()=>{
 // Netlify's plan badge is platform UI. Keep our own actions above it on small screens.
 function move(){if(!matchMedia('(max-width: 760px)').matches)return;document.querySelectorAll('body > div.fixed').forEach(x=>{if(x.className.includes('bottom-0')){x.style.bottom='7.75rem';x.style.maxHeight='calc(100vh - 8rem)';}});document.body.style.paddingBottom='13rem';}
 addEventListener('load',move);addEventListener('resize',move);
})();
