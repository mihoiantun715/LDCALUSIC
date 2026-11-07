import {checkAuthState,checkIfAdmin,logoutUser} from './firebase-auth.js?v=loading-1';
let revision=0;
checkAuthState(async user=>{
 const version=++revision;
 document.getElementById('adminDashboardShortcut')?.remove();
 const authDropdown=document.querySelector('.auth-dropdown');
 if(!user)return;
 const admin=await checkIfAdmin();if(version!==revision)return;
 if(admin){
  const host=document.querySelector('.nav-actions')||document.querySelector('header');
  if(host){const link=document.createElement('a');link.id='adminDashboardShortcut';link.href='admin.html';link.textContent='Admin dashboard';link.setAttribute('aria-label','Admin dashboard — upravljanje rezervacijama i rutama');link.style.cssText='display:inline-flex;align-items:center;justify-content:center;padding:10px 14px;background:#175ec8;color:#fff;border-radius:9px;text-decoration:none;font:600 13px Arial,sans-serif;white-space:nowrap;';host.prepend(link);}
 }
 if(authDropdown){
 authDropdown.innerHTML=`<button class="auth-btn"><span>${admin?'Administrator':'Račun'}</span><span aria-hidden="true">⌄</span></button><div class="dropdown-menu"><a href="${admin?'admin.html':'dashboard.html'}" class="dropdown-item">${admin?'Admin dashboard':'Moje rezervacije'}</a><a href="#" class="dropdown-item" id="logoutBtnHome">Odjava</a></div>`;
 document.getElementById('logoutBtnHome').addEventListener('click',async e=>{e.preventDefault();const result=await logoutUser();if(result.success)location.reload();});
 }
});
