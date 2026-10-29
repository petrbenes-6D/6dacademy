const $=s=>document.querySelector(s), esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const QS=new URLSearchParams(location.search);
const ADMIN=(()=>{const k=QS.get('key');try{if(k)localStorage.setItem('bx_key',k);return k||localStorage.getItem('bx_key')||''}catch{return k||''}})();
const RUN=(QS.get('run')||'').toUpperCase();
const COL={RED:'#e0475a',BLUE:'#4a8bf0',GREY:'#9aa3b5'},TEAMS=['RED','BLUE','GREY'];
function qr(text){if(typeof qrcode==='undefined')return '';const q=qrcode(0,'M');q.addData(text);q.make();return q.createSvgTag({cellSize:4,margin:2,scalable:true})}
const mmss=ms=>{ms=Math.max(0,ms);const s=Math.floor(ms/1000);return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')};
let _clk;function clock(){clearInterval(_clk);const f=()=>document.querySelectorAll('[data-end]').forEach(e=>{const v=+e.dataset.end-Date.now();e.textContent=v>0?mmss(v):'00:00';e.classList.toggle('late',v<=0)});f();_clk=setInterval(f,500)}

/* ---- komunikace s jádrem hry ----
   Jedna adresa API. Na notebooku je to /api (server.js), na hostingu adresa Apps Scriptu z config.js.
   Adresu lze nastavit i jednorázově v odkazu: ?api=https://script.google.com/macros/s/.../exec */
const API_URL=(()=>{try{const q=QS.get('api');if(q)localStorage.setItem('bx_api',q)}catch{}return (window.BX_CONFIG&&window.BX_CONFIG.api)||(()=>{try{return localStorage.getItem('bx_api')}catch{return ''}})()||'/api'})();
async function bx(path,data){
  let r,j;try{r=await fetch(API_URL,{method:'POST',headers:{'content-type':'text/plain;charset=utf-8'},body:JSON.stringify(Object.assign({path},data||{}))});j=await r.json()}catch(e){return {error:'Spojení se serverem se nepodařilo.',__code:0}}
  j.__code=j.__code||r.status;return j}
const tok=()=>{try{return localStorage.getItem('bx_tok')||''}catch{return ''}};
const tapi=(p,d)=>bx(p,Object.assign({t:tok()},d||{}));
const aapi=(p,d)=>bx(p,Object.assign({k:ADMIN,run:RUN},d||{}));
/* opakované dotazy: jedna běžící funkce, přeskočí se, pokud předchozí ještě nedoběhla */
function poll(fn,ms){let busy=false;const t=async()=>{if(busy)return;busy=true;try{await fn()}catch(e){}busy=false};t();return setInterval(t,ms)}
/* brána moderátora: bez klíče se zobrazí přihlášení */
function gate(){if(ADMIN)return false;if(document.getElementById('gk'))return true;document.body.innerHTML='<div class="wrap" style="max-width:520px;margin-top:12vh"><div class="card"><h2>Přístup moderátora</h2><p class="muted">Zadej klíč moderátora. Ve verzi z notebooku ho najdeš v okně terminálu, na hostingu je v nastavení Apps Scriptu (ADMIN_KEY).</p><input id="gk" type="password" placeholder="klíč moderátora" autocomplete="off"><p><button class="btn" onclick="try{localStorage.setItem(\'bx_key\',document.getElementById(\'gk\').value.trim())}catch(e){}location.reload()">Přihlásit</button></p></div></div>';return true}
function badKey(){try{localStorage.removeItem('bx_key')}catch{}document.body.innerHTML='<div class="wrap" style="max-width:520px;margin-top:12vh"><div class="card"><h2>Chybný klíč moderátora</h2><p><button class="btn" onclick="location.href=location.pathname">Zadat znovu</button></p></div></div>'}
/* adresa pro týmy (QR a text): na notebooku adresa v místní síti, na hostingu adresa stránky */
async function joinBase(){const base=location.origin+location.pathname.replace(/[^/]*$/,'');if(/^(localhost|127\.|\[::1\])/.test(location.hostname)){const i=await bx('/info');if(i.host)return `http://${i.host}:${i.port}/`}return base}
const shortUrl=u=>u.replace(/^https?:\/\//,'').replace(/\/$/,'');

/* ---- globální klávesy: F celá obrazovka, B burza (přehled) ---- */
const RUNC=RUN||(()=>{try{return(localStorage.getItem('bx_tok')||'').split(':')[0]}catch{return ''}})();
function toggleFS(){if(document.fullscreenElement)document.exitFullscreen();else document.documentElement.requestFullscreen&&document.documentElement.requestFullscreen().catch(()=>{})}
function toggleBoardOverlay(force){let o=document.getElementById('bxov');const want=force==null?!o:force;if(!want){if(o)o.remove();return}if(o||!RUNC)return;o=document.createElement('div');o.id='bxov';o.innerHTML=`<iframe src="board.html?run=${RUNC}&embed=1"></iframe><div class="bxx">B · zavřít</div>`;o.onclick=()=>toggleBoardOverlay(false);document.body.appendChild(o)}
document.addEventListener('keydown',e=>{if(e.ctrlKey||e.metaKey||e.altKey)return;const t=e.target&&e.target.tagName;if(['INPUT','TEXTAREA','SELECT'].includes(t))return;const k=e.key.toLowerCase();
 if(k==='f'){e.preventDefault();toggleFS()}
 else if(k==='b'&&!window.BX_OWN_B&&!window.BX_IS_BOARD){e.preventDefault();toggleBoardOverlay()}
 else if(k==='escape'){toggleBoardOverlay(false)}});
(function(){const st=document.createElement('style');st.textContent='#bxov{position:fixed;inset:0;z-index:99;background:#0e0a2b}#bxov iframe{width:100%;height:100%;border:0}.bxx{position:fixed;right:14px;bottom:12px;background:#000a;color:#fff;font:700 12px Jost,sans-serif;letter-spacing:.14em;text-transform:uppercase;padding:6px 12px;border-radius:99px}.kb{position:fixed;left:12px;bottom:10px;z-index:5;background:#000a;color:#cfc9f0;font:600 11px Jost,sans-serif;letter-spacing:.1em;text-transform:uppercase;padding:5px 12px;border-radius:99px;pointer-events:none}';document.head.appendChild(st)})();
function legend(txt){const d=document.createElement('div');d.className='kb';d.textContent=txt;document.body.appendChild(d)}
function timerBtns(){return ''}
