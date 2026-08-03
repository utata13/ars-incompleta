// Ars Incompleta — 遅延読み込み無限スクロール + 改変演出(外部依存なし)
const box=document.getElementById('text'), end=document.getElementById('end');
let idx=1, max=0, loading=false, done=false;
const KANA='アイウエオカキクケコサシスセソタチツテトナニヌネノ零壱弐参肆';
const CSSCLS={2:'glitch',3:'wave',4:'tiny',9:'echo'};   // 常時CSSの効果
const ANIM={5:'redact',6:'vanish',7:'bloom',8:'type'};  // スクロールで一度だけ動く効果
const obs=new IntersectionObserver(es=>es.forEach(e=>{
  if(e.isIntersecting){
    if(e.target.dataset.fx==='blackout'){flashBlack();}
    else if(e.target.dataset.anim){animShot(e.target);}
    else{doRewrite(e.target);}
    obs.unobserve(e.target);
  }}),{threshold:0.7});
function animShot(el){const k=el.dataset.anim;
  if(k==='vanish'){el.style.transition='opacity 4s ease, filter 4s ease';
    requestAnimationFrame(()=>{el.style.opacity='0';el.style.filter='blur(4px)';});}
  else if(k==='bloom'){el.style.filter='blur(6px)';el.style.transition='opacity 4s ease, filter 4s ease';
    requestAnimationFrame(()=>{el.style.opacity='1';el.style.filter='none';});}
  else if(k==='type'){const full=el.dataset.full||'';let i=0;
    const iv=setInterval(()=>{el.textContent=full.slice(0,++i);if(i>=full.length)clearInterval(iv);},150);}
  else if(k==='redact'){const full=el.textContent,L=full.length;let f=0;
    const iv=setInterval(()=>{f++;if(f>L){clearInterval(iv);el.textContent='█'.repeat(L);return;}
      el.textContent='█'.repeat(f)+full.slice(f);},260);}
}
function flashBlack(){const o=document.getElementById('blackout');
  o.style.transition='none'; o.style.opacity='1';
  setTimeout(()=>{o.style.transition='opacity 2s ease'; o.style.opacity='0';},480);
}
function doRewrite(el){
  const to=el.dataset.to||''; const L=to.length; let f=0;
  const scr=28, step=9, total=scr+L*step;   // たっぷりゆっくり: 乱れ→左から1字ずつ確定
  const iv=setInterval(()=>{ f++;
    if(f>=total){clearInterval(iv); el.textContent=to; el.classList.add('rewritten'); return;}
    const rev = f<=scr ? 0 : Math.floor((f-scr)/step);
    let s=to.slice(0,rev);
    for(let i=rev;i<L;i++) s+=KANA[Math.floor(Math.random()*KANA.length)];
    el.textContent=s;
  },125);
}
// 交互に入れ替わる字: 元の字 ⇄ 書き換えられた字。周期は字ごとにずらす。
function flick(el,a,b){let on=false;
  const per=4200+Math.random()*3600, off=Math.random()*per;
  setTimeout(()=>{setInterval(()=>{on=!on;
    el.textContent=on?b:a; el.classList.toggle('alt',on);},per);},off);}
function sep(t){const p=document.createElement('p');p.className='sep';p.textContent=t;box.appendChild(p);}
function para(runs){const p=document.createElement('p');
  for(const r of runs){
    if(Array.isArray(r)){const t=r[0],ty=r[1];
      if(ty===1){const s=document.createElement('strong');s.textContent=t;p.appendChild(s);}
      else if(CSSCLS[ty]){const s=document.createElement('span');s.className=CSSCLS[ty];s.textContent=t;p.appendChild(s);}
      else if(ANIM[ty]){const s=document.createElement('span');s.className='anim';s.dataset.anim=ANIM[ty];s.textContent=t;
        if(ANIM[ty]==='bloom')s.style.opacity='0';
        if(ANIM[ty]==='type'){s.dataset.full=t;s.textContent='';}
        p.appendChild(s);obs.observe(s);}
      else{p.appendChild(document.createTextNode(t));}}
    else if(r&&r.fl){const s=document.createElement('span');s.className='flick';
      s.textContent=r.fl[0];flick(s,r.fl[0],r.fl[1]);p.appendChild(s);}
    else if(r&&r.rw){const s=document.createElement('span');s.className='rewrite';
      s.textContent=r.rw[0];s.dataset.to=r.rw[1];p.appendChild(s);obs.observe(s);}
    else if(r&&r.fx){const s=document.createElement('span');s.className='fxmark';
      s.dataset.fx=r.fx;p.appendChild(s);obs.observe(s);}
  }
  box.appendChild(p);}
async function load(){
  if(loading||done)return; loading=true;
  try{
    if(!max){const m=await fetch('chunks/manifest.json');max=(await m.json()).count;}
    if(idx>max){done=true; if(end){end.style.display='block';} return;}
    const r=await fetch('chunks/'+String(idx).padStart(4,'0')+'.json');
    if(!r.ok){done=true;return;}
    const paras=await r.json();
    if(idx>1)sep('＊　＊　＊');
    for(const p of paras){ if(p.s){sep('＊');}else{para(p.r);} }
    idx++;
  }catch(e){done=true;}
  finally{loading=false; check();}
}
function check(){const d=document.documentElement;
  if(d.scrollHeight-window.scrollY-window.innerHeight<1400)load();}
window.addEventListener('scroll',check,{passive:true});
window.addEventListener('resize',check);
// 読書位置の記録(端末内localStorage)と「続きから読む」
const PKEY='ars_progress';
let _saveT=0;
function saveProgress(){const now=Date.now(); if(now-_saveT<800)return; _saveT=now;
  try{localStorage.setItem(PKEY,JSON.stringify({y:Math.round(window.scrollY),loaded:idx-1,ts:now}));}catch(e){}}
window.addEventListener('scroll',saveProgress,{passive:true});
async function loadUntil(t){while(idx-1<t&&!done){await load();}}
async function resumeReading(p){const r=document.getElementById('resume'); if(r)r.hidden=true;
  await loadUntil(p.loaded); window.scrollTo(0,p.y);}
function initResume(){try{const p=JSON.parse(localStorage.getItem(PKEY)||'null');
  if(p&&p.y>200&&p.loaded>0){const r=document.getElementById('resume'),b=document.getElementById('resumebtn');
    if(b){b.textContent='つづきから ▼';
      b.addEventListener('click',()=>resumeReading(p));}
    if(r)r.hidden=false;}}catch(e){}}
// 製作中HUD: 文字数・ペース表示 / 最新章へ一気に飛ぶ
async function initHud(){
  try{const m=await (await fetch('chunks/manifest.json')).json(); max=m.count;
    // タイトル画面の状態表示
    const st=document.getElementById('status');
    if(st){
      const cap=document.createElement('div'); cap.className='cap'; cap.textContent='現在 / written so far'; st.appendChild(cap);
      const cnt=document.createElement('div'); cnt.className='count';
      const num=document.createElement('span'); const unit=document.createElement('small'); unit.textContent='字 characters';
      cnt.appendChild(num); cnt.appendChild(unit); st.appendChild(cnt);
      const target=m.chars||0, t0=performance.now(), dur=1500;
      (function step(t){const p=Math.min(1,(t-t0)/dur);
        const v=Math.floor(target*(1-Math.pow(1-p,3)));
        num.textContent=v.toLocaleString();
        if(p<1)requestAnimationFrame(step); else num.textContent=target.toLocaleString();})(t0);
      const writing = m.updated && (Date.now()/1000 - m.updated < 900);  // 15分以内に更新=執筆中
      if(writing){const w=document.createElement('div'); w.className='writing';
        const d=document.createElement('span'); d.className='dot'; w.appendChild(d);
        w.appendChild(document.createTextNode('執筆中 / writing now')); st.appendChild(w);}
      // タイトルと同格: 消さずに常時表示(スクロールするまで見える)
    }
  }catch(e){}
}
initHud();
initResume();
load();
