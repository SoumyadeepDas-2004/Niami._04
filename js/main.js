// Edit these three values once; they update the header, footer and every data-site link.
const SITE={name:'Nia',instagram:'https://www.instagram.com/niami._04/',email:'nianami04@gmail.com'};
// Commission status — change these values when needed.
const COMMISSION = {
  status: 'open',
  message: 'Commissions Open'
};
const PAGES=[['index','Home'],['gallery','Gallery'],['commissions','Commissions'],['payment','Payment'],['about','About']];
const here=location.pathname.split('/').pop().replace(/\.html$/,'')||'index';
document.getElementById('site-header').innerHTML=`<div class="wrap"><a class="logo" href="index.html">${SITE.name}</a>
<button class="menu-btn" aria-expanded="false" aria-controls="menu">Menu</button>
<nav aria-label="Main"><ul id="menu">${PAGES.map(([p,t])=>`<li><a href="${p}.html"${p===here?' aria-current="page"':''}>${t}</a></li>`).join('')}</ul></nav></div>`;
document.getElementById('site-footer').innerHTML=`<div class="wrap"><span>© ${new Date().getFullYear()} ${SITE.name}</span><span><a data-site="instagram" href="#">Instagram</a> · <a href="https://mail.google.com/mail/?view=cm&to=${SITE.email}" target="_blank" rel="noopener noreferrer">${SITE.email}</a></span></div>`;
document.querySelectorAll('[data-site]').forEach(el=>{const k=el.dataset.site;
  if(k==='name')el.textContent=SITE.name;
  else if(k==='instagram')el.href=SITE.instagram;
  else{el.href='mailto:'+SITE.email;if(k==='email')el.textContent=SITE.email;}});
const btn=document.querySelector('.menu-btn'),menu=document.getElementById('menu');
const setMenu=o=>{menu.classList.toggle('open',o);btn.setAttribute('aria-expanded',o);};
btn.addEventListener('click',()=>setMenu(!menu.classList.contains('open')));
document.addEventListener('keydown',e=>{if(e.key==='Escape')setMenu(false);});
menu.addEventListener('click',e=>{if(e.target.closest('a'))setMenu(false);});
// Update commission status automatically
const statusElement = document.getElementById('commission-status');

if (statusElement) {
  const status = COMMISSION.status;

  statusElement.textContent = '✦ ' + COMMISSION.message;
  statusElement.dataset.status = status;
}