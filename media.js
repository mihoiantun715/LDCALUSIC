(() => {
 const video = document.getElementById('workVideo');
 const button = document.getElementById('videoToggle');
 if (!video || !button) return;
 video.muted = true; video.defaultMuted = true; video.volume = 0;
 video.addEventListener('volumechange', () => { if (!video.muted) video.muted = true; if(video.volume !== 0) video.volume = 0; });
 const update = () => { const en = document.querySelector('.lang-btn.active')?.dataset.lang === 'en'; button.textContent = video.paused ? (en ? 'Play video · no sound' : 'Pokreni video · bez zvuka') : (en ? 'Pause video · no sound' : 'Pauziraj video · bez zvuka'); };
 button.addEventListener('click', async () => { if(video.paused) { try { await video.play(); } catch { button.textContent='Video nije moguće pokrenuti.'; } } else video.pause(); });
 video.addEventListener('play',update); video.addEventListener('pause',update);
 document.querySelectorAll('.lang-btn').forEach(b=>b.addEventListener('click',()=>setTimeout(update,0)));
})();
