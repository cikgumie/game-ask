/**
 * Misi Nusa Logika 3D — Logik Utama & Pengawal Permainan
 */
'use strict';
const $=id=>document.getElementById(id), KEY='nusa-logika-v1';
function fresh(){return {version:1,name:'',completed:[false,false,false,false],steps:[0,0,0,0],bossStep:0,bossDone:false,xp:0,attempts:0,firstCorrect:0,solved:0,assisted:0,hero:{x:550,y:545},startedAt:null};}
let state=fresh(),storageOK=true;
try{
 const raw=JSON.parse(localStorage.getItem(KEY));
 if(raw&&raw.version===1&&Array.isArray(raw.steps)&&raw.steps.length===4&&raw.steps.every(n=>Number.isInteger(n)&&n>=0&&n<=3)&&typeof raw.name==='string'&&raw.name.length<=24&&Number.isFinite(raw.xp)&&Number.isInteger(raw.bossStep)&&raw.bossStep>=0&&raw.bossStep<=4){
  state={...fresh(),...raw};state.completed=state.steps.map(n=>n===3);state.bossDone=state.bossStep===4;
  state.hero={x:550,y:545};
 }
}catch(e){storageOK=false;}

let menuOpen=false,modalOpen=false,session=null,selected=[],order=[],checked=false,tries=0,hinted=false,lastFocus=null,target=null,keys=new Set(),particles=[],phase=0;
let world3D=null,use3D=false;
let currentIsland=5,travel=null,heroLift=0;
let cachedBridgePolylines=[];

function unlocked(i){return i===0||state.completed[i-1];}
function bridgeUnlocked(bridgeIndex){
 if(bridgeIndex===4)return true; // Pulau Permulaan -> Kampung Leraian sentiasa terbuka
 if(bridgeIndex===3)return state.completed.every(Boolean); // Ke Istana perlu 4 kristal
 return state.completed[bridgeIndex]; // Jambatan ke kawasan seterusnya dibuka selepas selesai
}

// Logik Jarak & Pergerakan Melintasi Jambatan dan Pulau
function distToBridge(p,bridgeIndex){
 const poly=cachedBridgePolylines[bridgeIndex];
 if(!poly||poly.length<2)return {d:Infinity,t:0};
 let minDist=Infinity,bestT=0;
 for(let j=0;j<poly.length-1;j++){
  const p1=poly[j],p2=poly[j+1],dx=p2.x-p1.x,dy=p2.y-p1.y,lenSq=dx*dx+dy*dy;
  let u=0;if(lenSq>0)u=Math.max(0,Math.min(1,((p.x-p1.x)*dx+(p.y-p1.y)*dy)/lenSq));
  const nx=p1.x+u*dx,ny=p1.y+u*dy,d=Math.hypot(p.x-nx,p.y-ny);
  if(d<minDist){minDist=d;bestT=(j+u)/(poly.length-1);}
 }
 return {d:minDist,t:bestT};
}

let lastBlockWarn=0;
function warnLockedBridge(bridgeIndex){
 const now=performance.now();
 if(now-lastBlockWarn>2400){
  lastBlockWarn=now;
  const b=bridgeLinks[bridgeIndex];
  const targetName=b.name;
  const reqName=regions[b.from]?.name||'sebelumnya';
  toast('Jambatan ke '+targetName+' dikunci kuasa kabut! Selesaikan misi '+reqName+' dahulu.');
  sfx('wrong');
 }
}

function isPointWalkable(p){
 // 1. Periksa sama ada berada di atas mana-mana pulau
 for(let i=0;i<islandAreas.length;i++){
  const a=islandAreas[i],d=Math.hypot(p.x-a.x,p.y-a.y);
  if(d<=a.r*20-4)return {ok:true,islandIndex:i};
 }
 // 2. Periksa sama ada berada di atas mana-mana jambatan
 for(let b=0;b<bridgeLinks.length;b++){
  const info=distToBridge(p,b);
  if(info.d<=24){ // lebar boleh dilalui 24 piksel di kiri/kanan garisan tengah
   const open=bridgeUnlocked(b);
   if(open||info.t<=.42){
    return {ok:true,bridgeIndex:b,t:info.t};
   }else{
    return {ok:false,blockedBridge:b,t:info.t};
   }
  }
 }
 return {ok:false};
}

function updateZone(check){
 if(check.islandIndex!==undefined&&check.islandIndex!==currentIsland){
  const prev=currentIsland;
  currentIsland=check.islandIndex;
  sfx('select');
  if(currentIsland<4){
   if(!state.completed[currentIsland]){
    toast('Tiba di '+regions[currentIsland].name+'. Tekan [E] untuk menemui '+regions[currentIsland].npc+'.');
   }else{
    toast('Tiba di '+regions[currentIsland].name+'.');
   }
  }else if(currentIsland===4){
   toast('Tiba di Istana Raja Kabut. Bersedia untuk pertarungan akhir!');
  }else if(currentIsland===5){
   toast('Pulau Permulaan.');
  }
  update();
 }
}

function moveHero(pCur,dx,dy){
 const pTarget={x:pCur.x+dx,y:pCur.y+dy};
 // 1. Cuba laluan penuh
 const checkFull=isPointWalkable(pTarget);
 if(checkFull.ok){updateZone(checkFull);return pTarget;}
 if(checkFull.blockedBridge!==undefined)warnLockedBridge(checkFull.blockedBridge);

 // 2. Cuba gelongsor pada paksi X
 const pX={x:pTarget.x,y:pCur.y};
 const checkX=isPointWalkable(pX);
 if(checkX.ok){updateZone(checkX);return pX;}

 // 3. Cuba gelongsor pada paksi Y
 const pY={x:pCur.x,y:pTarget.y};
 const checkY=isPointWalkable(pY);
 if(checkY.ok){updateZone(checkY);return pY;}

 // 4. Jika kedua-duanya terhalang, kekal di posisi semasa
 return pCur;
}

function islandAt(p){
 return islandAreas.findIndex(a=>Math.hypot(p.x-a.x,p.y-a.y)<=a.r*20);
}

function journeyUI(){const active=!!travel;$('journeyStatus').hidden=!active;$('interactBtn').disabled=active;document.querySelectorAll('[data-dir]').forEach(b=>b.disabled=active);}
function cancelTravel(){if(!travel)return;state.hero={x:islandAreas[travel.fromIndex||5].x,y:islandAreas[travel.fromIndex||5].y};travel=null;heroLift=0;target=null;keys.clear();if(world3D)world3D.focusInteraction(null);journeyUI();}
function resetNavigation(){cancelTravel();currentIsland=5;state.hero={x:islandAreas[5].x,y:islandAreas[5].y};heroLift=0;target=null;keys.clear();if(world3D){world3D.reset();world3D.focusInteraction(null);}journeyUI();}

function walkTo(p){
 if(travel||modalOpen||menuOpen)return;
 if(!state.name){intro();return;}
 const i=islandAt(p);
 if(i<0){target=p;return;}
 if(i!==currentIsland){visit(i);return;}
 target=p;sfx('select');
}

function startTravel(i){
 if(menuOpen)setDrawer(false,false);keys.clear();target=null;
 const a=islandAreas[i],to={x:a.x,y:a.y+(i===5?0:i===4?38:44)},from={...state.hero},distance=Math.hypot(to.x-from.x,to.y-from.y),cross=i!==currentIsland;
 if(distance<2){state.hero=to;currentIsland=i;if(i<5)showVisit(i);return;}
 travel={from,to,fromIndex:currentIsland,index:i,elapsed:0,duration:Math.max(cross?1.35:.45,Math.min(3.2,distance/(cross?240:175))),lift:cross?Math.min(5,2.8+distance/250):0};target=to;
 $('journeyText').textContent='Menuju '+(i===5?'Pulau Permulaan':i===4?'Istana Raja Kabut':regions[i].name);$('journeyFill').style.width='0%';journeyUI();sfx('travel');
}

function advanceTravel(dt){
 const trip=travel;trip.elapsed=Math.min(trip.duration,trip.elapsed+dt);const t=trip.elapsed/trip.duration,u=t*t*(3-2*t);
 state.hero={x:trip.from.x+(trip.to.x-trip.from.x)*u,y:trip.from.y+(trip.to.y-trip.from.y)*u};heroLift=reduced?0:Math.sin(Math.PI*t)*trip.lift;$('journeyFill').style.width=(t*100)+'%';
 if(t>=1){currentIsland=trip.index;state.hero=trip.to;travel=null;heroLift=0;target=null;keys.clear();journeyUI();save();sfx('select');if(trip.index<5)showVisit(trip.index);}
}

const canvas=$('scene3d'),reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){storageOK=false;}$('saveStatus').textContent=storageOK?'Kemajuan disimpan pada pelayar ini':'Simpanan pelayar tidak tersedia; kekalkan tab ini';}

function open(html,wide=false){cancelTravel();lastFocus=menuOpen?$('menuToggle'):document.activeElement;if(menuOpen)setDrawer(false,false);modalOpen=true;keys.clear();target=null;$('dialog').className='dialog'+(wide?' wide':'');$('dialog').innerHTML='<button class="close" id="closeModal" aria-label="Tutup">×</button>'+html;$('overlay').hidden=false;$('closeModal').onclick=close;setTimeout(()=>{const f=$('dialog').querySelector('input,button.primary,button.option,button');if(f)f.focus();},0);}
function close(){modalOpen=false;session=null;$('overlay').hidden=true;if(world3D)world3D.focusInteraction(null);if(lastFocus&&lastFocus.isConnected)lastFocus.focus();}
function toast(message){$('toast').textContent=message;$('toast').hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('toast').hidden=true,3200);}


// Jejak langkah bunyi
// lastStep dan stepSide diuruskan oleh audio.js

function update(){
 let c=state.completed.filter(Boolean).length;
 $('playerName').textContent=state.name||'Pengembara baharu';$('avatarBadge').textContent=(state.name||'P')[0].toUpperCase();
 $('playerStats').textContent='Tahap '+(1+Math.floor(state.xp/150))+' · '+state.xp+' XP';
 $('xpFill').style.width=(state.xp%150)/150*100+'%';$('crystalCount').textContent=c+' / 4';$('hudCrystal').textContent='◇ '+c+' / 4';$('questCount').textContent=c+(state.bossDone?1:0)+' / 5';
 $('quests').innerHTML=regions.map((r,i)=>`<button class="quest-card ${unlocked(i)&&!state.completed[i]?'active':''}" data-quest="${i}" style="--qbg:${r.bg};--qcolor:${r.color}" aria-label="${r.name}, ${state.completed[i]?'selesai':unlocked(i)?'tersedia':'belum dibuka'}"><div class="quest-icon">${state.completed[i]?'✓':i+1}</div><div><h3>${r.name}</h3><p>${r.tech}</p><small>${state.completed[i]?'Kristal diperoleh · Ulang kaji':unlocked(i)?state.steps[i]+' / 3 cabaran · Teroka kawasan':'Selesaikan kawasan sebelumnya'}</small></div></button>`).join('')+`<button class="quest-card boss-card" data-quest="4" style="--qbg:#2b4f64;--qcolor:#ffd266"><div class="quest-icon">♜</div><div><h3>Istana Raja Kabut</h3><p>Gabungkan empat teknik</p><small>${state.bossDone?'Dunia berjaya dipulihkan':c===4?'Pertarungan akhir tersedia':'Perlu empat kristal ilmu'}</small></div></button>`;
 $('quests').querySelectorAll('[data-quest]').forEach(b=>b.onclick=()=>visit(Number(b.dataset.quest)));
 const next=regions.find((r,i)=>!state.completed[i]);
 $('mentorText').textContent=next?next.intro:state.bossDone?'Tahniah! Gunakan empat teknik ini untuk menyelesaikan masalah harian.':'Empat kristal sudah bersatu. Pergi ke istana dan gunakan semua teknik untuk menghapuskan kabut.';
 $('missionLabel').textContent=state.bossDone?'Nusa Logika kembali bercahaya':next?'Misi seterusnya: '+next.name:'Hadapi Raja Kabut';
 $('missionDesc').textContent=state.bossDone?'Buka rumusan untuk melihat pencapaian dan sijil pengembara.':next?next.tech+' · Tiga cabaran menanti anda.':'Empat perisai. Empat teknik. Satu penyelesaian.';
 save();
}

function intro(){
 if(world3D)world3D.focusInteraction(null);
 open(`<span class="eyebrow">SELAMAT DATANG, PENGEMBARA</span><h2 id="modalTitle">Cahaya dunia semakin pudar.</h2><p>Raja Kabut mengaburkan Nusa Logika. Bantu empat penjaga ilmu, kumpulkan kristal dan pulihkan dunia menggunakan pemikiran komputasional.</p><div class="intro-art"><i class="crystal" style="--c:#f7b556"></i><i class="crystal" style="--c:#45c999"></i><i class="crystal" style="--c:#54b8f4"></i><i class="crystal" style="--c:#b08ceb"></i></div><label class="name-label" for="nameInput">Nama pengembara</label><input id="nameInput" maxlength="24" placeholder="Masukkan nama atau nama samaran" value="${esc(state.name)}" autocomplete="off"><p style="font-size:11px">Gunakan <b>WASD</b> atau kekunci anak panah untuk bergerak di pulau dan <b>menyeberangi jambatan</b>. Setiap pulau kini lebih luas untuk diteroka! Anda juga boleh klik pulau atau kad misi untuk berpindah pantas. Anggaran masa: 20–30 minit.</p><div class="actions"><button class="primary" id="startBtn">Mulakan pengembaraan →</button></div>`);
 $('startBtn').onclick=()=>{state.name=$('nameInput').value.trim()||'Pengembara';state.startedAt=state.startedAt||Date.now();close();update();sfx('start');toast('Lalui jambatan hadapan menuju Kampung Leraian dan temui Tok Bina.');};
 $('nameInput').onkeydown=e=>{if(e.key==='Enter')$('startBtn').click();};
}

function visit(i){
 if(!Number.isInteger(i)||i<0||i>5)return;if(travel)return;if(!state.name){intro();return;}
 if(i<4&&!unlocked(i)){toast('Selesaikan '+regions[i-1].name+' dahulu.');return;}
 if(i===4&&!state.completed.every(Boolean)){toast('Kumpulkan empat kristal sebelum memasuki istana.');return;}
 startTravel(i);
}

function showVisit(i){
 if(world3D)world3D.focusInteraction(i);
 if(i===4){
  if(state.bossDone){if(world3D)world3D.focusInteraction(null);result();return;}
  open(`<span class="eyebrow">PERTARUNGAN AKHIR</span><h2 id="modalTitle">Raja Kabut menanti anda.</h2><p>Gunakan empat teknik untuk mengurus festival sekolah. Setiap cabaran yang diselesaikan memecahkan satu perisai kabut. Jawapan salah memberikan penerangan; anda boleh terus mencuba.</p><div class="task-art">♜ &nbsp; EMPAT PERISAI KABUT</div><div class="actions"><button class="primary" id="beginBtn">Mulakan pertarungan</button></div>`);
  $('beginBtn').onclick=()=>begin(4);return;
 }
 const r=regions[i];
 if(state.completed[i]){
  open(`<span class="eyebrow">KRISTAL ${r.tech.toUpperCase()}</span><h2 id="modalTitle">${r.name} dipulihkan!</h2><p>${r.definition}</p><div class="feedback">Contoh kehidupan harian: ${r.example}</div><div class="actions"><button class="primary" id="reviewBtn">Buka buku ilmu</button><button class="secondary" id="returnBtn">Kembali ke peta</button></div>`);
  $('reviewBtn').onclick=notes;$('returnBtn').onclick=close;return;
 }
 open(`<span class="eyebrow">PENJAGA ILMU · ${r.npc.toUpperCase()}</span><h2 id="modalTitle">${r.name}</h2><p>${r.intro}</p><div class="feedback"><b>${r.tech}</b><br>${r.definition}</div><p>Selesaikan tiga cabaran untuk memperoleh kristal ${r.tech.toLowerCase()}.</p><div class="actions"><button class="primary" id="beginBtn">${state.steps[i]?'Sambung':'Terima'} misi →</button></div>`);
 $('beginBtn').onclick=()=>begin(i);
}

function currentTask(){return session===4?bossTasks[state.bossStep]:regions[session].tasks[state.steps[session]];}
function begin(i){session=i;sfx('mission');task();}
function task(){
 const keep=session,t=currentTask(),step=session===4?state.bossStep:state.steps[session];
 if(world3D&&session!==null)world3D.focusInteraction(session);
 selected=[];order=t.options.map((_,i)=>i);checked=false;tries=0;hinted=false;
 const heading=session===4?'Raja Kabut':regions[session].tech;
 open(`<div class="challenge-top"><span class="eyebrow">${heading.toUpperCase()}</span><span class="pill">Cabaran ${step+1} / ${session===4?4:3}</span></div><h2 id="modalTitle">${t.title}</h2>${session===4?`<p>Perisai kabut: ${100-step*25}%</p><div class="boss-health"><span style="width:${100-step*25}%"></span></div>`:''}<p>${t.text}</p>${t.art?`<div class="task-art">${t.art}</div>`:''}<div id="answers" class="options"></div><div class="feedback" id="feedback" role="status" hidden></div><div id="hintArea" class="hint"></div><div class="actions"><button class="primary" id="checkBtn">Semak jawapan</button><button class="secondary" id="hintBtn">Petunjuk</button><button class="primary" id="nextBtn" hidden>Teruskan →</button></div>`);
 session=keep;renderAnswers();
 $('checkBtn').onclick=check;$('hintBtn').onclick=()=>{hinted=true;$('hintArea').textContent=t.hint;$('hintBtn').disabled=true;};$('nextBtn').onclick=advance;
}

function renderAnswers(){
 const t=currentTask();
 if(t.type==='order'){
  $('answers').innerHTML=order.map((v,i)=>`<div class="order-row"><b>${i+1}.</b><span>${esc(t.options[v])}</span><button data-move="${i},-1" ${i===0||checked?'disabled':''} aria-label="Naikkan ${esc(t.options[v])}">↑</button><button data-move="${i},1" ${i===order.length-1||checked?'disabled':''} aria-label="Turunkan ${esc(t.options[v])}">↓</button></div>`).join('');
  $('answers').querySelectorAll('[data-move]').forEach(b=>b.onclick=()=>{const [i,d]=b.dataset.move.split(',').map(Number);[order[i],order[i+d]]=[order[i+d],order[i]];renderAnswers();});
  return;
 }
 $('answers').innerHTML=t.options.map((o,i)=>`<button class="option ${selected.includes(i)?'selected':''}" aria-pressed="${selected.includes(i)}" data-answer="${i}" ${checked?'disabled':''}><span class="letter">${t.type==='multi'?selected.includes(i)?'✓':'□':String.fromCharCode(65+i)}</span><span>${esc(o)}</span></button>`).join('');
 $('answers').querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.answer);if(t.type==='multi')selected=selected.includes(i)?selected.filter(x=>x!==i):[...selected,i];else selected=[i];renderAnswers();const f=$('answers').querySelector(`[data-answer="${i}"]`);if(f)f.focus();});
}

function correct(t,picked,arr){
 if(t.type==='order')return JSON.stringify(arr)===JSON.stringify(t.answer);
 if(t.type==='multi')return JSON.stringify([...picked].sort((a,b)=>a-b))===JSON.stringify([...t.answer].sort((a,b)=>a-b));
 return picked[0]===t.answer;
}

function check(){
 if(checked||session===null)return;const t=currentTask();
 if(t.type!=='order'&&!selected.length){toast('Pilih jawapan terlebih dahulu.');return;}
 tries++;state.attempts++;const ok=correct(t,selected,order);
 $('feedback').hidden=false;$('feedback').className='feedback'+(ok?'':' bad');
 if(!ok){$('feedback').textContent='Belum tepat. '+t.hint+' Anda boleh ubah jawapan dan cuba lagi.';tone(false);save();return;}
 checked=true;state.solved++;if(tries===1&&!hinted)state.firstCorrect++;if(hinted)state.assisted++;
 const earned=tries===1&&!hinted?50:30;state.xp+=earned;
 $('feedback').textContent='Tepat! +'+earned+' XP. '+t.why;
 $('checkBtn').hidden=true;$('hintBtn').hidden=true;$('nextBtn').hidden=false;
 renderAnswers();
 const i=session;
 if(i===4)state.bossStep++;
 else{state.steps[i]++;if(state.steps[i]===3)state.completed[i]=true;}
 if(state.bossStep===4)state.bossDone=true;
 update();tone();$('nextBtn').focus();
}

function advance(){
 const i=session;
 if(i===4&&state.bossDone){burst(575,80);sfx('victory');if(world3D)world3D.focusInteraction(null);result();return;}
 if(i<4&&state.completed[i]){
  const r=regions[i];burst(r.x,r.y);sfx('crystal');
  open(`<span class="eyebrow">MISI SELESAI</span><h2 id="modalTitle">Kristal ${r.tech} diperoleh!</h2><div class="intro-art"><i class="crystal" style="--c:${r.color}"></i></div><p>${r.npc} mengucapkan terima kasih. Jambatan ke ${i===3?'Istana Raja Kabut':regions[i+1].name} kini dibuka!</p><div class="feedback">${r.example}</div><div class="actions"><button class="primary" id="continueMap">Lalui jambatan seterusnya →</button></div>`);
  $('continueMap').onclick=()=>{close();};return;
 }
 task();
}

function notes(){
 if(world3D)world3D.focusInteraction(null);
 open(`<span class="eyebrow">BUKU ILMU PENGEMBARA</span><h2 id="modalTitle">Empat teknik, satu pemikiran.</h2><p>Pemikiran komputasional ialah proses menyelesaikan masalah secara sistematik menggunakan konsep asas sains komputer. Manusia boleh melakukannya dengan atau tanpa bantuan komputer.</p><div class="note-grid">${regions.map(r=>`<article class="note"><h3 style="color:${r.color}">${r.tech}</h3><p>${r.definition}</p><p><b>Contoh</b><br>${r.example}</p><small>SP ${r.sp}</small></article>`).join('')}</div><div class="feedback">Pengecaman corak mencari persamaan dan perbezaan. Pengitlakan membina kaedah umum daripada persamaan itu untuk masalah sejenis.</div><div class="actions"><button class="primary" id="backBtn">Kembali ke pengembaraan</button></div>`,true);
 $('backBtn').onclick=close;
}

function help(){
 if(world3D)world3D.focusInteraction(null);
 open(`<span class="eyebrow">PANDUAN PENGEMBARA</span><h2 id="modalTitle">Cara bermain</h2><p>1. Masukkan nama dan mulakan langkah dari Pulau Permulaan.<br>2. <b>Gerakkan watak menggunakan WASD atau kekunci arah:</b> Anda kini boleh bergerak bebas di seluruh pulau dan <b>menyeberangi jambatan magis</b> ke pulau seterusnya.<br>3. Setiap jambatan dilindungi pintu tenaga magis yang akan terbuka sebaik sahaja misi pulau selesai.<br>4. Dekati penjaga ilmu dan tekan <b>[E]</b> atau butang Berinteraksi untuk memulakan cabaran.<br>5. Anda juga boleh klik pulau atau kad misi dalam menu untuk berpindah pantas.<br>6. Lengkapkan 4 kristal ilmu untuk membuka pintu istana dan menghadapi Raja Kabut!</p><div class="feedback">Jawapan betul kali pertama: 50 XP. Selepas petunjuk: 30 XP. Sijil tamat boleh dicetak selepas pertarungan akhir!</div><div class="actions"><button class="primary" id="backBtn">Kembali</button><button class="secondary" id="restartBtn">Mula semula</button></div>`);
 $('backBtn').onclick=close;$('restartBtn').onclick=confirmReset;
}

function confirmReset(){
 if(world3D)world3D.focusInteraction(null);
 open(`<span class="eyebrow">PENGEMBARAAN BAHARU</span><h2 id="modalTitle">Mulakan semula?</h2><p>Nama, kristal dan XP permainan pada pelayar ini akan dipadam.</p><div class="actions"><button class="primary" id="resetYes">Ya, mula semula</button><button class="secondary" id="resetNo">Kembali</button></div>`);
 $('resetYes').onclick=()=>{state=fresh();resetNavigation();update();intro();};$('resetNo').onclick=help;
}

function result(){
 if(world3D)world3D.focusInteraction(null);
 open(`<span class="eyebrow no-print">PENGEMBARAAN SELESAI</span><h2 id="modalTitle" class="no-print">Nusa Logika kembali bercahaya!</h2><p class="no-print">${esc(state.name)}, anda telah memecahkan empat perisai Raja Kabut dan menyelesaikan 16 cabaran.</p><div class="result-stats no-print"><div><b>${state.xp}</b><small>Jumlah XP</small></div><div><b>${state.firstCorrect} / 16</b><small>Tepat kali pertama tanpa petunjuk</small></div><div><b>4 / 4</b><small>Kristal ilmu</small></div></div><div class="certificate"><span class="eyebrow">AKADEMI PENGEMBARA DIGITAL</span><h3>Pengembara Nusa Logika</h3><p>Diberikan kepada</p><h2>${esc(state.name)}</h2><p>Telah menamatkan pengembaraan ASK Tingkatan 1<br>Asas Pemikiran Komputasional</p><p>Leraian · Pengecaman Corak<br>Peniskalaan · Pengitlakan</p><small>Penghargaan permainan · ${state.xp} XP</small></div><div class="actions"><button class="primary" id="printBtn">Cetak sijil</button><button class="secondary" id="notesEnd">Nota ulang kaji</button><button class="secondary" id="backBtn">Kembali ke dunia</button></div>`,true);
 $('printBtn').onclick=()=>window.print();$('notesEnd').onclick=notes;$('backBtn').onclick=close;
}

function nearest(){
 if(travel)return -1;
 if(currentIsland>=0&&currentIsland<=4)return currentIsland;
 return -1;
}

function interact(){
 if(modalOpen||menuOpen||travel)return;
 const i=nearest();
 if(i>=0)showVisit(i);
 else toast('Teruskan perjalanan melalui jambatan menuju pulau seterusnya.');
}

function burst(x,y){if(world3D)world3D.celebrate(x,y);}

let previous=0,lastSave=0;
function draw(now){
 const dt=Math.min((now-previous)/1000,.04)||.016;previous=now;if(!reduced)phase+=dt;
 if(world3D&&!modalOpen&&!menuOpen){
  if(travel){
   advanceTravel(dt);
  }else{
   const beforeX=state.hero.x,beforeY=state.hero.y;
   let dx=(keys.has('arrowright')||keys.has('d')?1:0)-(keys.has('arrowleft')||keys.has('a')?1:0);
   let dy=(keys.has('arrowdown')||keys.has('s')?1:0)-(keys.has('arrowup')||keys.has('w')?1:0);
   const moveSpeed=185;

   if(dx||dy){
    target=null;
    const m=Math.hypot(dx,dy),v=world3D&&use3D?world3D.move(dx,dy):{dx,dy};
    state.hero=moveHero(state.hero,v.dx/m*moveSpeed*dt,v.dy/m*moveSpeed*dt);
   }else if(target){
    const x=target.x-state.hero.x,y=target.y-state.hero.y,d=Math.hypot(x,y);
    if(d<3){target=null;}
    else{
     const stepDist=Math.min(moveSpeed*dt,d);
     state.hero=moveHero(state.hero,x/d*stepDist,y/d*stepDist);
    }
   }

   if(Math.hypot(state.hero.x-beforeX,state.hero.y-beforeY)>.1&&now-lastStep>280){
    sfx(stepSide?'stepAlt':'step');stepSide=!stepSide;lastStep=now;
   }
   if(now-lastSave>2000&&(dx||dy||target)){save();lastSave=now;}
  }
 }

 if(world3D)world3D.render(phase,dt,target);
 const near=nearest();
 $('interactBtn').textContent=travel?'Sedang bergerak':near===4?'Masuk istana [E]':near>=0?'Temui '+regions[near].npc+' [E]':'Berinteraksi [E]';
 requestAnimationFrame(draw);
}

function setWorldView(enabled){
 use3D=!!world3D&&enabled;
 if(use3D&&!travel){
  if(!isPointWalkable(state.hero).ok){
   state.hero={x:islandAreas[currentIsland].x,y:islandAreas[currentIsland].y};
  }
  target=null;
 }
 canvas.style.visibility=use3D?'visible':'hidden';canvas.style.pointerEvents=use3D?'auto':'none';
 $('viewStatus').textContent=use3D?'Dunia 3D · Three.js':'Paparan 3D tidak tersedia';
 ['rotateLeft','rotateRight','tiltUp','tiltDown','zoomIn','zoomOut','resetCamera'].forEach(id=>$(id).disabled=!use3D);
 if(world3D&&use3D)world3D.resize();
}

function show3DError(error){
 cancelTravel();world3D=null;setWorldView(false);modalOpen=false;$('overlay').hidden=true;
 if(menuOpen)setDrawer(false,false);$('webglReason').textContent=error?.message||String(error);
 $('webglError').hidden=false;$('retry3D').onclick=()=>window.location.reload();
}

function initWorld3D(){
 try{
  world3D=window.Nusa3D.create({
   canvas:$('scene3d'),
   getState:()=>state,
   getHeroLift:()=>heroLift,
   regions,
   reduced,
   islandAreas,
   bridgeLinks,
   bridgeUnlocked:bIdx=>bridgeUnlocked(bIdx),
   isModalOpen:()=>modalOpen||menuOpen,
   onDestination:p=>{walkTo(p);$('scene3d').focus();},
   onVisit:i=>visit(i),
   onLost:()=>show3DError('Sambungan WebGL terputus. Muat semula untuk membuka dunia 3D.')
  });
  if(world3D&&world3D.bridgePolylines){
   cachedBridgePolylines=world3D.bridgePolylines;
  }
  setWorldView(true);
 }catch(e){show3DError(e);}

 [['rotateLeft',()=>world3D.turn(-1)],['rotateRight',()=>world3D.turn(1)],['tiltUp',()=>world3D.tilt(1)],['tiltDown',()=>world3D.tilt(-1)],['zoomIn',()=>world3D.setZoom(.12)],['zoomOut',()=>world3D.setZoom(-.12)],['resetCamera',()=>world3D.reset()]].forEach(([id,act])=>$(id).onclick=()=>{if(world3D&&use3D){act();sfx('select');}});
}

function resize(){if(world3D)world3D.resize();}
resize();window.addEventListener('resize',resize);

window.addEventListener('keydown',e=>{
 if(menuOpen&&!modalOpen){drawerKeys(e);return;}
 if(modalOpen){
  if(e.key==='Escape'){close();return;}
  if(e.key==='Tab'){
   const f=[...$('dialog').querySelectorAll('button:not([disabled]):not([hidden]),input')].filter(el=>el.offsetParent!==null);
   if(!f.length)return;
   const first=f[0],last=f[f.length-1];
   if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
   else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  }
  return;
 }
 if(travel||document.activeElement?.tagName==='INPUT')return;
 const k=e.key.toLowerCase();
 if(['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d'].includes(k)){e.preventDefault();keys.add(k);}
 if(k==='e'&&!e.repeat)interact();
});
window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
window.addEventListener('blur',()=>{keys.clear();save();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){keys.clear();silenceSounds();save();}});

document.querySelectorAll('[data-dir]').forEach(b=>{
 const k='arrow'+b.dataset.dir;
 b.addEventListener('pointerdown',e=>{e.preventDefault();if(travel||modalOpen||menuOpen)return;keys.add(k);b.setPointerCapture(e.pointerId);});
 ['pointerup','pointercancel','lostpointercapture'].forEach(ev=>b.addEventListener(ev,()=>keys.delete(k)));
});

$('notesBtn').onclick=notes;$('helpBtn').onclick=help;$('interactBtn').onclick=interact;$('soundBtn').onclick=toggleSound;
function setDrawer(opened,focus=true){menuOpen=!!opened;keys.clear();if(world3D)world3D.cancelOrbit();$('sidePanel').hidden=!menuOpen;$('drawerBackdrop').hidden=!menuOpen;$('menuToggle').setAttribute('aria-expanded',String(menuOpen));if(focus)(menuOpen?$('menuClose'):$('menuToggle')).focus();}
function drawerKeys(e){if(e.key==='Escape'){e.preventDefault();setDrawer(false);return;}if(e.key!=='Tab')return;const f=[...$('sidePanel').querySelectorAll('button:not([disabled]),a[href]')].filter(el=>el.offsetParent!==null);if(!f.length)return;const first=f[0],last=f[f.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
function fullscreenUI(){const active=!!(document.fullscreenElement||document.webkitFullscreenElement);$('fullScreenBtn').textContent=active?'Keluar skrin penuh':'Skrin penuh';$('fullScreenBtn').setAttribute('aria-pressed',String(active));resize();}
function toggleFullscreen(){const active=document.fullscreenElement||document.webkitFullscreenElement;const fn=active?(document.exitFullscreen||document.webkitExitFullscreen):($('gameFrame').requestFullscreen||$('gameFrame').webkitRequestFullscreen);if(!fn){toast('Permainan sudah memenuhi skrin pelayar.');return;}try{Promise.resolve(fn.call(active?document:$('gameFrame'))).then(()=>{setDrawer(false);fullscreenUI();}).catch(()=>toast('Skrin penuh tidak tersedia.'));}catch(e){toast('Permainan kekal memenuhi ruang pelayar.');}}
$('menuToggle').onclick=()=>{setDrawer(!menuOpen);sfx('menu');};$('menuClose').onclick=()=>{setDrawer(false);sfx('menu');};$('drawerBackdrop').onclick=()=>setDrawer(false);$('fullScreenBtn').onclick=toggleFullscreen;document.addEventListener('fullscreenchange',fullscreenUI);document.addEventListener('webkitfullscreenchange',fullscreenUI);
if(window.ResizeObserver){const observer=new ResizeObserver(()=>resize());observer.observe($('gameFrame'));}

initWorld3D();update();requestAnimationFrame(draw);if(world3D&&!state.name)intro();
