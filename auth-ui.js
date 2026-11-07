(() => {
 const modals=[...document.querySelectorAll('.auth-modal')];
 let previousFocus=null;
 for(const modal of modals){
  new MutationObserver(()=>{if(modal.style.display==='block'){previousFocus=document.activeElement;modal.querySelector('input')?.focus();}}).observe(modal,{attributes:true,attributeFilter:['style']});
  modal.querySelector('.close')?.addEventListener('click',()=>previousFocus?.focus());
  modal.addEventListener('keydown',e=>{
   if(e.key==='Escape'){modal.querySelector('.close').click();return;}
   if(e.key!=='Tab')return;
   const items=[...modal.querySelectorAll('button,input,a[href]')].filter(el=>!el.disabled&&el.getClientRects().length);
   const first=items[0],last=items[items.length-1];
   if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
   else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  });
 }
 document.querySelectorAll('.password-toggle').forEach(button=>button.addEventListener('click',()=>setTimeout(()=>{
  const visible=document.getElementById(button.dataset.target).type==='text';
  button.textContent=visible?'Sakrij':'Prikaži';button.setAttribute('aria-pressed',String(visible));button.setAttribute('aria-label',visible?'Sakrij lozinku':'Prikaži lozinku');
 },0)));
})();
