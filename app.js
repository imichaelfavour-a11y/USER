const META=[
{id:'cre224',n:'CRE 224: Multimedia',c:'#B4237A',d:'Multimedia development and application, from your lecture notes.',kb:10,t:['What is multimedia?','Where multimedia is used','Systems and architecture','File formats','Hardware and software','Authoring tools','Text and typography']},
{id:'ift212',n:'IFT 212: Computer Organization',c:'#2447D6',d:'Instruction formats, the stack, interrupts and memory.',kb:9,t:['Instruction formats','Subroutines and the stack','Interrupts and I/O','Memory hierarchy','Von Neumann and the instruction cycle','Compilers and interpreters']},
{id:'cos264',n:'COS 264: Programming II',c:'#0F8A6A',d:'Structured programming in C++: sequence and selection.',kb:8,t:['Structured programming','Sequence structure','If and if...else','Nested if']},
{id:'cre226',n:'CRE 226: Animation',c:'#C27A00',d:'Animation basics. General content: swap in your CRE 226 notes.',kb:8,t:['What is animation?','Types of animation','Principles of animation','Animation workflow']},
{id:'sql',n:'SQL Basics',c:'#7A3FD0',d:'CREATE TABLE, constraints and common mistakes.',kb:7,t:['CREATE TABLE and data types','Constraints','Common mistakes']}];
const $=s=>document.querySelector(s),main=$('#main');
const dflt=()=>({dl:{},prog:{},queue:[],sim:false});
let S=dflt(),view=null,Q={},dlp={},PK={};
try{S=Object.assign(dflt(),JSON.parse(localStorage.getItem('satchel')))}catch(e){}
const save=()=>{try{localStorage.setItem('satchel',JSON.stringify(S))}catch(e){}};
const online=()=>navigator.onLine&&!S.sim;
const tot=META.reduce((a,p)=>a+p.kb,0),used=()=>META.reduce((a,p)=>a+(S.dl[p.id]?p.kb:0),0);
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('on'),3400)}
function flush(){if(S.queue.length&&online()){const n=S.queue.length;S.queue=[];save();toast(n+(n>1?' results':' result')+' synced')}}
async function load(id){
 if(PK[id])return PK[id];
 if(S.dl[id]){try{const r=localStorage.getItem('sp-'+id);if(r)return PK[id]=JSON.parse(r)}catch(e){}}
 if(!online())throw 0;
 const x=await fetch('data/'+id+'.json');if(!x.ok)throw 0;return PK[id]=await x.json()}
function cur(){const p=META.find(p=>view.startsWith(p.id)),i=+view.slice(p.id.length);return[p,p.t[i],PK[p.id].lessons[i]]}
function book(p){
 const has=S.dl[p.id],on=online(),d=dlp[p.id];
 const act=has?'<span class="tag">Saved on this device</span>':d?'<span class="tag">Downloading…</span>':'<button class="btn" data-a="dl" data-p="'+p.id+'"'+(on?'':' disabled')+'>'+(on?'Download pack':'Needs signal to download')+'</button>';
 return '<article class="book" style="--c:'+p.c+'"><div class="cover"><h2>'+p.n+'</h2><p>'+p.d+'</p>'+act+'</div><ul class="lessons">'+p.t.map((t,i)=>{const k=p.id+i,ok=has||on,s=S.prog[k];return '<li><button class="row" data-a="open" data-k="'+k+'"'+(ok?'':' disabled')+'><span>'+t+'</span><em>'+(!ok?'Download first':s!=null?s+' of 2 right':'Start')+'</em></button></li>'}).join('')+'</ul></article>'}
function home(){
 const done=Object.keys(S.prog).length,all=META.reduce((a,p)=>a+p.t.length,0);
 return '<section class="hero"><h1>Download once.<br>Learn anywhere.</h1><p>Save a pack while you have signal. Then read, listen and take quizzes with none. Your scores stay on your phone and sync when you reconnect.</p><p>'+done+' of '+all+' lessons finished. '+(S.queue.length?'<span class="q">'+S.queue.length+' result'+(S.queue.length>1?'s':'')+' waiting for signal.</span>':'')+'</p></section><div class="shelf">'+META.map(book).join('')+'</div><div class="foot"><button data-a="reset">Clear saved packs and scores</button></div>'}
function lesson(){
 const[p,t,l]=cur(),n=l.q.length,ans=Object.keys(Q).length===n,sc=l.q.filter((q,j)=>Q[j]===q.a).length;
 return '<button class="back" data-a="back">Back to library</button><h1 class="lt">'+t+'</h1><div class="tools"><span class="tag">'+p.n+'</span>'+('speechSynthesis' in window?'<button class="btn ghost" data-a="say">Read aloud</button>':'')+'</div><div class="sheet">'+l.b.map(x=>'<p>'+x+'</p>').join('')+'</div><h2 class="qh">Check yourself</h2>'+
 l.q.map((q,qi)=>{const a=Q[qi];return '<fieldset class="qq"><legend>'+q.q+'</legend>'+q.o.map((o,oi)=>'<button class="opt '+(a!=null?(oi===q.a?'good':oi===a?'bad':''):'')+'" data-a="ans" data-q="'+qi+'" data-o="'+oi+'"'+(a!=null?' disabled':'')+'>'+o+'</button>').join('')+(a!=null?'<p class="exp">'+(a===q.a?'Correct. ':'Not quite. ')+q.e+'</p>':'')+'</fieldset>'}).join('')+
 (ans?'<div class="done">You got '+sc+' of '+n+'. '+(S.queue.length?'Saved on this phone. It syncs when you have signal.':'Result synced.')+'</div>':'')}
function render(){
 const on=online();
 $('#pill').className='pill '+(on?'on':'off');$('#pt').textContent=on?'Online':'Offline';
 $('#st').textContent=used()+' of '+tot+' KB saved';$('#fill').style.width=used()/tot*100+'%';$('#sim').checked=S.sim;
 main.innerHTML=view?lesson():home()}
document.addEventListener('click',async e=>{
 const b=e.target.closest('[data-a]');if(!b)return;const a=b.dataset.a;
 if(a==='dl'){const id=b.dataset.p;dlp[id]=1;render();
  try{const j=await load(id);localStorage.setItem('sp-'+id,JSON.stringify(j));S.dl[id]=1;save();toast(META.find(p=>p.id===id).n+' saved. It works offline now.')}
  catch(err){toast('Download failed. Run the site with Live Server and check your connection.')}
  delete dlp[id];render()}
 else if(a==='open'){try{const k=b.dataset.k;await load(META.find(p=>k.startsWith(p.id)).id);view=k;Q={};render();scrollTo(0,0)}catch(err){toast('Needs signal. Download this pack first.')}}
 else if(a==='back'){if('speechSynthesis' in window)speechSynthesis.cancel();view=null;Q={};render();scrollTo(0,0)}
 else if(a==='say'){const[,t,l]=cur();if(speechSynthesis.speaking){speechSynthesis.cancel();return}speechSynthesis.speak(new SpeechSynthesisUtterance(t+'. '+l.b.join(' ')))}
 else if(a==='ans'){
  Q[+b.dataset.q]=+b.dataset.o;const l=cur()[2];
  if(Object.keys(Q).length===l.q.length){const sc=l.q.filter((q,j)=>Q[j]===q.a).length;S.prog[view]=sc;S.queue.push({k:view,s:sc});save();
   if(online())flush();else toast('Saved on this phone. It syncs when you have signal.')}
  render()}
 else if(a==='reset'){S=dflt();PK={};try{META.forEach(p=>localStorage.removeItem('sp-'+p.id))}catch(err){}save();view=null;render();toast('Cleared.')}
});
$('#sim').addEventListener('change',e=>{S.sim=e.target.checked;save();flush();render()});
addEventListener('online',()=>{flush();render()});
addEventListener('offline',render);
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
render();flush();
