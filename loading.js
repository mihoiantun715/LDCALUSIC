(() => {
  if (window.appLoading) return;
  const tasks = new Map(); let serial = 0, showTimer, hideTimer;
  const panel = document.createElement('div'); panel.id = 'app-loading'; panel.className = 'app-loading boot';
  panel.setAttribute('role','status'); panel.setAttribute('aria-live','polite'); panel.setAttribute('aria-atomic','true');
  const card = document.createElement('div'); card.className='app-loading-card';
  const ring = document.createElement('span'); ring.className='app-loading-ring'; ring.setAttribute('aria-hidden','true');
  const label = document.createElement('span'); label.textContent='Učitavanje…'; card.append(ring,label); panel.append(card); document.documentElement.append(panel);
  let boot = true;
  function render(){clearTimeout(hideTimer);if(tasks.size){label.textContent=[...tasks.values()].at(-1).label;clearTimeout(showTimer);showTimer=setTimeout(()=>{panel.hidden=false;},boot?0:180);}else{clearTimeout(showTimer);hideTimer=setTimeout(()=>{panel.hidden=true;panel.classList.remove('boot');boot=false;},120);}}
  function begin(text='Učitavanje…'){const id=++serial;const timer=setTimeout(()=>{tasks.delete(id);render();},60000);tasks.set(id,{label:text,timer});render();let ended=false;return ()=>{if(ended)return;ended=true;clearTimeout(timer);tasks.delete(id);render();};}
  async function track(task,text){const end=begin(text);try{return await task();}finally{end();}}
  window.appLoading={begin,track};
  const ready=begin('Učitavanje stranice…');
  function finishBoot(){boot=false;panel.classList.remove('boot');ready();}
  document.addEventListener('DOMContentLoaded',finishBoot,{once:true});
  // A failed external module must never leave the site behind a loading screen.
  setTimeout(finishBoot,12000);
  window.addEventListener('pageshow',e=>{if(e.persisted){tasks.forEach(t=>clearTimeout(t.timer));tasks.clear();finishBoot();}});
})();
