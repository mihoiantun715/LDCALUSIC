(() => {
 const menu = document.getElementById('exploreMenu');
 const burger = document.querySelector('.hamburger');
 const nav = document.querySelector('.nav-menu');
 document.addEventListener('click', event => { if(menu && !menu.contains(event.target)) menu.open=false; });
 document.addEventListener('keydown', event => { if(event.key==='Escape' && menu?.open){ menu.open=false; menu.querySelector('summary').focus(); } });
 menu?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{menu.open=false;nav?.classList.remove('active');burger?.classList.remove('active');burger?.setAttribute('aria-expanded','false');}));
 if(nav && burger) new MutationObserver(()=>burger.setAttribute('aria-expanded',String(nav.classList.contains('active')))).observe(nav,{attributes:true,attributeFilter:['class']});
 const sections=[...document.querySelectorAll('.service-detail')];
 sections.forEach(item=>item.addEventListener('toggle',()=>{if(item.open) sections.forEach(other=>{if(other!==item)other.open=false;});}));
 document.querySelectorAll('[data-service-choice]').forEach(link=>link.addEventListener('click',()=>{const select=document.getElementById('service');if(select && [...select.options].some(o=>o.value===link.dataset.serviceChoice)){select.value=link.dataset.serviceChoice;select.dispatchEvent(new Event('change',{bubbles:true}));}}));
 const dialog=document.getElementById('photoDialog');const image=document.getElementById('largePhoto');const caption=document.getElementById('photoCaption');
 document.querySelectorAll('.gallery-open').forEach(button=>button.addEventListener('click',()=>{const source=button.querySelector('img');image.src=source.src;image.alt=source.alt;caption.textContent=source.alt;dialog.showModal();}));
 dialog.querySelector('.photo-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
 const translate=()=>{const en=document.querySelector('.lang-btn.active')?.dataset.lang==='en';document.querySelectorAll('[data-ui-hr]').forEach(el=>el.textContent=en?el.dataset.uiEn:el.dataset.uiHr);document.documentElement.lang=en?'en':'hr';};
 document.querySelectorAll('.lang-btn').forEach(b=>b.addEventListener('click',()=>setTimeout(translate,0)));
 if(!matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('reveal-in');observer.unobserve(entry.target);}}),{threshold:.12});document.querySelectorAll('.service-detail,.work-grid figure,.partners-intro,.partner-list,.process-grid article,.about-content').forEach(el=>observer.observe(el));}
})();
