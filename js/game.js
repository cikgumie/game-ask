/**
 * Misi Nusa Logika 3D — Logik Utama & Pengawal Permainan
 * Menyokong Bab 1 (Pemikiran Komputasional) & Bab 2 (Perwakilan Data),
 * Puzzle Padanan Berpasangan (Matching Pairs), Navigasi 10 Pulau & 2 Bos Pertarungan.
 */
'use strict';

const $=id=>document.getElementById(id), KEY='nusa-logika-v2';

function fresh(){
 return {
  version: 2,
  name: '',
  completed: Array(regions.length).fill(false),
  steps: Array(regions.length).fill(0),
  bossStep: 0,
  bossDone: false,
  cyberBossStep: 0,
  cyberBossDone: false,
  xp: 0,
  attempts: 0,
  firstCorrect: 0,
  solved: 0,
  assisted: 0,
  hero: {x: 550, y: 545},
  startedAt: null
 };
}

let state=fresh(), storageOK=true;
try{
 const raw=JSON.parse(localStorage.getItem(KEY)) || JSON.parse(localStorage.getItem('nusa-logika-v1'));
 if(raw && typeof raw.name === 'string'){
  state = { ...fresh(), ...raw, version: 2 };
  if(!Array.isArray(state.completed)) state.completed = [];
  if(!Array.isArray(state.steps)) state.steps = [];
  while(state.completed.length < regions.length) state.completed.push(false);
  while(state.steps.length < regions.length) state.steps.push(0);
  if(state.bossStep === undefined) state.bossStep = 0;
  if(state.cyberBossStep === undefined) state.cyberBossStep = 0;
  if(!state.hero || !Number.isFinite(state.hero.x)) state.hero = {x: 550, y: 545};
 }
}catch(e){storageOK=false;}

let menuOpen=false, modalOpen=false, session=null, selected=[], order=[], checked=false, tries=0, hinted=false;
let lastFocus=null, target=null, keys=new Set(), phase=0;
let world3D=null, use3D=false;
let currentIsland=5, travel=null, heroLift=0;
let cachedBridgePolylines=[];

// Keadaan Puzzle Padanan Berpasangan (Matching Pairs)
let matchState = { selectedLeft: null, pairs: {}, rightOrder: [] };

// Pemetaan Indeks Pulau ke Indeks Kawasan Kurikulum
const islandToRegion = { 0:0, 1:1, 2:2, 3:3, 6:4, 7:5, 8:6 };
const regionToIsland = { 0:0, 1:1, 2:2, 3:3, 4:6, 5:7, 6:8 };

function unlocked(i){
 if(i===0) return true;
 if(i<=3) return state.completed[i-1];
 if(i===4) return state.bossDone; // Pulau Bit & Perduaan dibuka selepas Raja Kabut
 if(i<=6) return state.completed[i-1];
 return false;
}

function bridgeUnlocked(bIdx){
 if(bIdx===4) return true; // 5 -> 0 (Permulaan -> Kampung)
 if(bIdx<=2) return state.completed[bIdx]; // Jambatan dalaman Bab 1
 if(bIdx===3) return state.completed.slice(0,4).every(Boolean); // Menara -> Istana Raja Kabut
 if(bIdx===5) return state.bossDone; // Menara -> Pulau Bit (Pintu Gerbang Dimensi Alam 2)
 if(bIdx===6) return state.completed[4]; // Pulau Bit -> Lembah Ukuran Data
 if(bIdx===7) return state.completed[5]; // Lembah Ukuran -> Teluk Imej & Audio
 if(bIdx===8) return state.completed.slice(4,7).every(Boolean); // Teluk Imej -> Teras CyberByte
 if(bIdx===9) return state.cyberBossDone; // Teras CyberByte -> Pulau Permulaan
 return false;
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
  toast('Jambatan ke '+b.name+' dikunci tenaga kuasa! Selesaikan misi sebelumnya.');
  sfx('wrong');
 }
}

function isPointWalkable(p){
 // 1. Periksa pulau
 for(let i=0;i<islandAreas.length;i++){
  const a=islandAreas[i],d=Math.hypot(p.x-a.x,p.y-a.y);
  if(d<=a.r*20-4)return {ok:true,islandIndex:i};
 }
 // 2. Periksa jambatan
 for(let b=0;b<bridgeLinks.length;b++){
  const info=distToBridge(p,b);
  if(info.d<=26){
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
  currentIsland=check.islandIndex;
  sfx('select');
  if(currentIsland===4){
   toast('Tiba di Istana Raja Kabut. Pertarungan Akhir Bab 1!');
  }else if(currentIsland===5){
   toast('Pulau Permulaan.');
  }else if(currentIsland===9){
   toast('Tiba di Teras CyberByte. Pertarungan Akhir Bab 2!');
  }else{
   const rIdx=islandToRegion[currentIsland];
   if(rIdx!==undefined){
    const r=regions[rIdx];
    toast('Tiba di '+r.name+'. '+(state.completed[rIdx]?'Kawasan dipulihkan.':'Tekan [E] untuk menemui '+r.npc+'.'));
   }
  }
  update();
 }
}

function moveHero(pCur,dx,dy){
 const pTarget={x:pCur.x+dx,y:pCur.y+dy};
 const checkFull=isPointWalkable(pTarget);
 if(checkFull.ok){updateZone(checkFull);return pTarget;}
 if(checkFull.blockedBridge!==undefined)warnLockedBridge(checkFull.blockedBridge);

 const pX={x:pTarget.x,y:pCur.y};
 const checkX=isPointWalkable(pX);
 if(checkX.ok){updateZone(checkX);return pX;}

 const pY={x:pCur.x,y:pTarget.y};
 const checkY=isPointWalkable(pY);
 if(checkY.ok){updateZone(checkY);return pY;}

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
 if(i!==currentIsland){visitIsland(i);return;}
 target=p;sfx('select');
}

function startTravel(i){
 if(menuOpen)setDrawer(false,false);keys.clear();target=null;
 const a=islandAreas[i],to={x:a.x,y:a.y+(i===5?0:i===4||i===9?38:44)},from={...state.hero},distance=Math.hypot(to.x-from.x,to.y-from.y),cross=i!==currentIsland;
 if(distance<2){state.hero=to;currentIsland=i;showVisit(i);return;}
 travel={from,to,fromIndex:currentIsland,index:i,elapsed:0,duration:Math.max(cross?1.35:.45,Math.min(3.2,distance/(cross?240:175))),lift:cross?Math.min(5,2.8+distance/250):0};target=to;
 $('journeyText').textContent='Menuju '+islandAreas[i].name;$('journeyFill').style.width='0%';journeyUI();sfx('travel');
}

function advanceTravel(dt){
 const trip=travel;trip.elapsed=Math.min(trip.duration,trip.elapsed+dt);const t=trip.elapsed/trip.duration,u=t*t*(3-2*t);
 state.hero={x:trip.from.x+(trip.to.x-trip.from.x)*u,y:trip.from.y+(trip.to.y-trip.from.y)*u};heroLift=reduced?0:Math.sin(Math.PI*t)*trip.lift;$('journeyFill').style.width=(t*100)+'%';
 if(t>=1){currentIsland=trip.index;state.hero=trip.to;travel=null;heroLift=0;target=null;keys.clear();journeyUI();save();sfx('select');showVisit(trip.index);}
}

function setDrawer(open,withFocus=true){
 menuOpen=open;
 const d=$('drawer');d.classList.toggle('open',open);$('menuToggle').setAttribute('aria-expanded',String(open));$('menuToggle').setAttribute('aria-label',open?'Tutup menu':'Buka menu pengembara');
 if(open){cancelTravel();if(withFocus)$('closeDrawer').focus();}
 else if(withFocus&&lastFocus&&lastFocus.isConnected)lastFocus.focus();
}

function drawerKeys(e){
 if(e.key==='Escape'){setDrawer(false);return;}
 if(e.key==='Tab'){
  const f=[...$('drawer').querySelectorAll('button')].filter(el=>el.offsetParent!==null);
  if(!f.length)return;
  const first=f[0],last=f[f.length-1];
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
 }
}

function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){storageOK=false;}$('saveStatus').textContent=storageOK?'Kemajuan disimpan pada pelayar ini':'Simpanan pelayar tidak tersedia; kekalkan tab ini';}

function open(html,wide=false){cancelTravel();lastFocus=menuOpen?$('menuToggle'):document.activeElement;if(menuOpen)setDrawer(false,false);modalOpen=true;keys.clear();target=null;$('dialog').className='dialog'+(wide?' wide':'');$('dialog').innerHTML='<button class="close" id="closeModal" aria-label="Tutup">×</button>'+html;$('overlay').hidden=false;$('closeModal').onclick=close;setTimeout(()=>{const f=$('dialog').querySelector('input,button.primary,button.option,button');if(f)f.focus();},0);}
function close(){modalOpen=false;session=null;matchState={selectedLeft:null,pairs:{},rightOrder:[]};$('overlay').hidden=true;if(world3D)world3D.focusInteraction(null);if(lastFocus&&lastFocus.isConnected)lastFocus.focus();}
function toast(message){$('toast').textContent=message;$('toast').hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('toast').hidden=true,3200);}

function update(){
 const c1=state.completed.slice(0,4).filter(Boolean).length;
 const c2=state.completed.slice(4,7).filter(Boolean).length;
 const totalCrystals=c1+c2;
 const totalQuestsDone=totalCrystals+(state.bossDone?1:0)+(state.cyberBossDone?1:0);

 $('playerName').textContent=state.name||'Pengembara baharu';$('avatarBadge').textContent=(state.name||'P')[0].toUpperCase();
 $('playerStats').textContent='Tahap '+(1+Math.floor(state.xp/150))+' · '+state.xp+' XP';
 $('xpFill').style.width=(state.xp%150)/150*100+'%';
 $('crystalCount').textContent=totalCrystals+' / 7';
 $('hudCrystal').textContent='◇ '+totalCrystals+' / 7';
 $('questCount').textContent=totalQuestsDone+' / 9';

 let qHtml=`<div class="realm-header">✦ BAB 1: PEMIKIRAN KOMPUTASIONAL ✦</div>`;
 qHtml+=regions.slice(0,4).map((r,i)=>`<button class="quest-card ${unlocked(i)&&!state.completed[i]?'active':''}" data-quest="reg-${i}" style="--qbg:${r.bg};--qcolor:${r.color}"><div class="quest-icon">${state.completed[i]?'✓':i+1}</div><div><h3>${r.name}</h3><p>${r.tech}</p><small>${state.completed[i]?'Kristal diperoleh · Ulang kaji':unlocked(i)?state.steps[i]+' / 3 cabaran · Teroka kawasan':'Selesaikan kawasan sebelumnya'}</small></div></button>`).join('');
 qHtml+=`<button class="quest-card boss-card" data-quest="boss-1" style="--qbg:#2b4f64;--qcolor:#ffd266"><div class="quest-icon">♜</div><div><h3>Istana Raja Kabut</h3><p>Bos Akhir Bab 1</p><small>${state.bossDone?'Dunia Bab 1 Dipulihkan':c1===4?'Pertarungan akhir sedia':'Perlu 4 kristal Bab 1'}</small></div></button>`;

 qHtml+=`<div class="realm-header">✦ BAB 2: PERWAKILAN DATA ✦</div>`;
 qHtml+=regions.slice(4,7).map((r,idx)=>{
  const i=idx+4;
  return `<button class="quest-card ${unlocked(i)&&!state.completed[i]?'active':''}" data-quest="reg-${i}" style="--qbg:${r.bg};--qcolor:${r.color}"><div class="quest-icon">${state.completed[i]?'✓':i+1}</div><div><h3>${r.name}</h3><p>${r.tech}</p><small>${state.completed[i]?'Kristal diperoleh · Ulang kaji':unlocked(i)?state.steps[i]+' / 3 cabaran · Teroka kawasan':'Kalahkan Raja Kabut dahulu'}</small></div></button>`;
 }).join('');
 qHtml+=`<button class="quest-card boss-card" data-quest="boss-2" style="--qbg:#1a324b;--qcolor:#00e5ff"><div class="quest-icon">⚡</div><div><h3>Teras CyberByte</h3><p>Bos Akhir Bab 2</p><small>${state.cyberBossDone?'Teras Data Bercahaya':c2===3?'Pertarungan CyberByte sedia':'Perlu 3 kristal Bab 2'}</small></div></button>`;

 $('quests').innerHTML=qHtml;
 $('quests').querySelectorAll('[data-quest]').forEach(b=>{
  b.onclick=()=>{
   const q=b.dataset.quest;
   if(q.startsWith('reg-')) visitRegion(Number(q.split('-')[1]));
   else if(q==='boss-1') visitIsland(4);
   else if(q==='boss-2') visitIsland(9);
  };
 });

 const next=regions.find((r,i)=>!state.completed[i]);
 $('mentorText').textContent=next?next.intro:state.cyberBossDone?'Tahniah! Semua silibus ASK Tingkatan 1 berjaya dikuasai dengan cemerlang!':'Hadapi cabaran bos untuk melengkapkan pengembaraan nusa.';
 $('missionLabel').textContent=state.cyberBossDone?'Nusa Logika & Alam Data Dipulihkan!':next?'Misi: '+next.name:'Pertarungan Bos';
 $('missionDesc').textContent=next?next.tech+' · Selesaikan cabaran & puzzle padanan.':'Buka rumusan untuk mencetak sijil pengembara.';
 save();
}

function intro(){
 if(world3D)world3D.focusInteraction(null);
 open(`<span class="eyebrow">SELAMAT DATANG, PENGEMBARA</span><h2 id="modalTitle">Nusa Logika Menanti Anda!</h2><p>Dunia terbahagi kepada dua alam agung: <b>Bab 1 (Pemikiran Komputasional)</b> dan <b>Bab 2 (Perwakilan Data)</b>. Terokai kepulauan 3D, selesaikan kuiz & puzzle padanan, kumpulkan 7 kristal ilmu dan kalahkan Raja Kabut serta CyberByte!</p><div class="intro-art"><i class="crystal" style="--c:#f7b556"></i><i class="crystal" style="--c:#45c999"></i><i class="crystal" style="--c:#00d2ee"></i><i class="crystal" style="--c:#e91e63"></i></div><label class="name-label" for="nameInput">Nama pengembara</label><input id="nameInput" maxlength="24" placeholder="Masukkan nama murid / pengembara" value="${esc(state.name)}" autocomplete="off"><p style="font-size:11px">Gunakan <b>WASD</b> atau kekunci anak panah untuk bergerak di pulau dan <b>menyeberangi jambatan dimensi</b>. Anggaran masa: 20–30 minit.</p><div class="actions"><button class="primary" id="startBtn">Mulakan pengembaraan →</button></div>`);
 $('startBtn').onclick=()=>{state.name=$('nameInput').value.trim()||'Pengembara';state.startedAt=state.startedAt||Date.now();close();update();sfx('start');toast('Lalui jambatan hadapan menuju Kampung Leraian dan temui Tok Bina.');};
 $('nameInput').onkeydown=e=>{if(e.key==='Enter')$('startBtn').click();};
}

function visitRegion(rIdx){
 if(travel||!state.name){if(!state.name)intro();return;}
 if(!unlocked(rIdx)){toast('Selesaikan kawasan sebelumnya dahulu.');return;}
 const targetIsl=regionToIsland[rIdx];
 if(targetIsl!==undefined)startTravel(targetIsl);
}

function visitIsland(i){
 if(!Number.isInteger(i)||i<0||i>=islandAreas.length)return;
 if(travel)return;if(!state.name){intro();return;}
 if(i===4&&!state.completed.slice(0,4).every(Boolean)){toast('Kumpulkan empat kristal Bab 1 sebelum memasuki istana.');return;}
 if(i===9&&!state.completed.slice(4,7).every(Boolean)){toast('Kumpulkan tiga kristal Bab 2 sebelum menghadapi CyberByte.');return;}
 const rIdx=islandToRegion[i];
 if(rIdx!==undefined&&!unlocked(rIdx)){toast('Selesaikan kawasan sebelumnya dahulu.');return;}
 startTravel(i);
}

function showVisit(i){
 if(world3D)world3D.focusInteraction(i);
 if(i===4){ // Bos 1: Raja Kabut
  if(state.bossDone){open(`<span class="eyebrow">ISTANA RAJA KABUT</span><h2 id="modalTitle">Raja Kabut Berjaya Dikalahkan!</h2><p>Empat perisai kabut telah dimusnahkan. Pintu gerbang dimensi ke <b>Alam 2: Perwakilan Data</b> di Menara Pengitlakan kini terbuka!</p><div class="actions"><button class="primary" id="goToRealm2">Menuju Pulau Bit (Bab 2) →</button><button class="secondary" id="retMap">Kembali ke peta</button></div>`);$('goToRealm2').onclick=()=>visitIsland(6);$('retMap').onclick=close;return;}
  open(`<span class="eyebrow">PERTARUNGAN AKHIR · BAB 1</span><h2 id="modalTitle">Raja Kabut menanti anda.</h2><p>Gunakan empat teknik pemikiran komputasional untuk mengurus festival sekolah. Setiap cabaran yang diselesaikan memecahkan satu perisai kabut.</p><div class="task-art">♜ &nbsp; EMPAT PERISAI KABUT</div><div class="actions"><button class="primary" id="beginBtn">Mulakan pertarungan</button></div>`);
  $('beginBtn').onclick=()=>begin('boss1');return;
 }
 if(i===9){ // Bos 2: CyberByte
  if(state.cyberBossDone){result();return;}
  open(`<span class="eyebrow">PERTARUNGAN AKHIR · BAB 2</span><h2 id="modalTitle">Teras CyberByte Bersedia!</h2><p>Buktikan penguasaan anda dalam Sistem Nombor Perduaan, Ukuran Storan Data, dan Multimedia Digital untuk memulihkan Teras Alam Data.</p><div class="task-art">⚡ &nbsp; TERAS KOD CYBERBYTE</div><div class="actions"><button class="primary" id="beginBtn">Mulakan Pertarungan Siber</button></div>`);
  $('beginBtn').onclick=()=>begin('boss2');return;
 }
 if(i===5){ // Pulau Permulaan
  open(`<span class="eyebrow">PULAU PERMULAAN</span><h2 id="modalTitle">Titik Mula Nusa Logika</h2><p>Dari sini, anda boleh menyeberangi jambatan ke Kampung Leraian atau menggunakan jalan pintas portal ke pulau-pulau yang telah dibuka.</p><div class="actions"><button class="primary" id="retMap">Teruskan Meneroka</button></div>`);
  $('retMap').onclick=close;return;
 }

 const rIdx=islandToRegion[i];
 if(rIdx===undefined)return;
 const r=regions[rIdx];
 if(state.completed[rIdx]){
  open(`<span class="eyebrow">KRISTAL ${r.tech.toUpperCase()}</span><h2 id="modalTitle">${r.name} Dipulihkan!</h2><p>${r.definition}</p><div class="feedback">Contoh kehidupan harian: ${r.example}</div><div class="actions"><button class="primary" id="reviewBtn">Buka buku ilmu</button><button class="secondary" id="returnBtn">Kembali ke peta</button></div>`);
  $('reviewBtn').onclick=notes;$('returnBtn').onclick=close;return;
 }
 open(`<span class="eyebrow">${r.realmTitle.toUpperCase()} · ${r.npc.toUpperCase()}</span><h2 id="modalTitle">${r.name}</h2><p>${r.intro}</p><div class="feedback"><b>${r.tech}</b><br>${r.definition}</div><p>Selesaikan tiga cabaran & puzzle untuk memperoleh kristal ilmu ${r.tech.toLowerCase()}.</p><div class="actions"><button class="primary" id="beginBtn">${state.steps[rIdx]?'Sambung':'Terima'} misi →</button></div>`);
 $('beginBtn').onclick=()=>begin(rIdx);
}

function currentTask(){
 if(session==='boss1'||session===4) return bossTasks[state.bossStep];
 if(session==='boss2'||session===9) return cyberBossTasks[state.cyberBossStep];
 return regions[session].tasks[state.steps[session]];
}

function begin(id){session=id;sfx('mission');task();}

function task(){
 const keep=session,t=currentTask();
 const isBoss1=session==='boss1'||session===4;
 const isBoss2=session==='boss2'||session===9;
 const step=isBoss1?state.bossStep:isBoss2?state.cyberBossStep:state.steps[session];
 const maxStep=isBoss1||isBoss2?4:3;

 const targetIsland=isBoss1?4:isBoss2?9:regionToIsland[session];
 if(world3D) world3D.focusInteraction(targetIsland);

 selected=[];checked=false;tries=0;hinted=false;
 order=t.options?t.options.map((_,i)=>i):[];

 if(t.type==='match'){
  matchState={
   selectedLeft: null,
   pairs: {},
   rightOrder: [...Array(t.pairs.length).keys()].sort(()=>Math.random()-.5)
  };
 }

 const heading=isBoss1?'Raja Kabut':isBoss2?'CyberByte':regions[session].tech;
 open(`<div class="challenge-top"><span class="eyebrow">${heading.toUpperCase()}</span><span class="pill">Cabaran ${step+1} / ${maxStep}</span></div><h2 id="modalTitle">${t.title}</h2>${isBoss1?`<p>Perisai kabut: ${100-step*25}%</p><div class="boss-health"><span style="width:${100-step*25}%"></span></div>`:isBoss2?`<p>Integriti teras data: ${100-step*25}%</p><div class="boss-health"><span style="width:${100-step*25}%"></span></div>`:''}<p>${t.text}</p>${t.art?`<div class="task-art">${t.art}</div>`:''}<div id="answers" class="options"></div><div class="feedback" id="feedback" role="status" hidden></div><div id="hintArea" class="hint"></div><div class="actions"><button class="primary" id="checkBtn">Semak jawapan</button><button class="secondary" id="hintBtn">Petunjuk</button><button class="primary" id="nextBtn" hidden>Teruskan →</button></div>`);
 session=keep;renderAnswers();
 $('checkBtn').onclick=check;$('hintBtn').onclick=()=>{hinted=true;$('hintArea').textContent=t.hint;$('hintBtn').disabled=true;};$('nextBtn').onclick=advance;
}

function renderAnswers(){
 const t=currentTask();
 if(t.type==='order'){
  $('answers').innerHTML=order.map((v,i)=>`<div class="order-row"><b>${i+1}.</b><span>${esc(t.options[v])}</span><button data-move="${i},-1" ${i===0||checked?'disabled':''} aria-label="Naikkan">↑</button><button data-move="${i},1" ${i===order.length-1||checked?'disabled':''} aria-label="Turunkan">↓</button></div>`).join('');
  $('answers').querySelectorAll('[data-move]').forEach(b=>b.onclick=()=>{const [i,d]=b.dataset.move.split(',').map(Number);[order[i],order[i+d]]=[order[i+d],order[i]];renderAnswers();});
  return;
 }
 if(t.type==='match'){
  const lefts=t.pairs.map(p=>p.left);
  const rights=t.pairs.map(p=>p.right);
  const rightOrder=matchState.rightOrder||[...Array(t.pairs.length).keys()];
  const pairColors=['paired-0','paired-1','paired-2','paired-3'];

  $('answers').innerHTML=`<div class="match-container">
   <div class="match-info-bar">
    <span><b>Arahan:</b> Klik kad kiri, kemudian klik padanannya di sebelah kanan.</span>
    <button class="match-reset-btn" id="matchResetBtn" type="button" ${checked?'disabled':''}>Padankan Semula</button>
   </div>
   <div class="match-grid">
    <div class="match-col">
     <div class="match-col-header">Konsep / Istilah</div>
     ${lefts.map((txt,lIdx)=>{
      const isPaired=matchState.pairs[lIdx]!==undefined;
      const pairNum=isPaired?Object.keys(matchState.pairs).indexOf(String(lIdx)):-1;
      const colClass=pairNum>=0?pairColors[pairNum%4]:'';
      const isSel=matchState.selectedLeft===lIdx;
      return `<button type="button" class="match-card ${isSel?'active-select':''} ${isPaired?'paired '+colClass:''}" data-left="${lIdx}" ${checked?'disabled':''}>
       <span>${esc(txt)}</span>
       ${isPaired?`<span class="match-badge">Pasangan ${pairNum+1}</span>`:''}
      </button>`;
     }).join('')}
    </div>
    <div class="match-col">
     <div class="match-col-header">Penerangan / Nilai</div>
     ${rightOrder.map(rIdx=>{
      const matchedLeft=Object.keys(matchState.pairs).find(lKey=>matchState.pairs[lKey]===rIdx);
      const isPaired=matchedLeft!==undefined;
      const pairNum=isPaired?Object.keys(matchState.pairs).indexOf(matchedLeft):-1;
      const colClass=pairNum>=0?pairColors[pairNum%4]:'';
      return `<button type="button" class="match-card ${isPaired?'paired '+colClass:''}" data-right="${rIdx}" ${checked?'disabled':''}>
       <span>${esc(rights[rIdx])}</span>
       ${isPaired?`<span class="match-badge">Pasangan ${pairNum+1}</span>`:''}
      </button>`;
     }).join('')}
    </div>
   </div>
  </div>`;

  $('matchResetBtn').onclick=()=>{
   if(checked)return;
   matchState.pairs={};matchState.selectedLeft=null;sfx('select');renderAnswers();
  };
  $('answers').querySelectorAll('[data-left]').forEach(btn=>{
   btn.onclick=()=>{
    if(checked)return;
    const lIdx=Number(btn.dataset.left);
    if(matchState.pairs[lIdx]!==undefined){delete matchState.pairs[lIdx];matchState.selectedLeft=lIdx;}
    else{matchState.selectedLeft=matchState.selectedLeft===lIdx?null:lIdx;}
    sfx('select');renderAnswers();
   };
  });
  $('answers').querySelectorAll('[data-right]').forEach(btn=>{
   btn.onclick=()=>{
    if(checked)return;
    const rIdx=Number(btn.dataset.right);
    if(matchState.selectedLeft!==null){
     for(const k in matchState.pairs){if(matchState.pairs[k]===rIdx)delete matchState.pairs[k];}
     matchState.pairs[matchState.selectedLeft]=rIdx;
     matchState.selectedLeft=null;
     sfx('select');renderAnswers();
    }else{
     for(const k in matchState.pairs){if(matchState.pairs[k]===rIdx){delete matchState.pairs[k];sfx('select');renderAnswers();break;}}
    }
   };
  });
  return;
 }

 $('answers').innerHTML=t.options.map((o,i)=>`<button class="option ${selected.includes(i)?'selected':''}" aria-pressed="${selected.includes(i)}" data-answer="${i}" ${checked?'disabled':''}><span class="letter">${t.type==='multi'?selected.includes(i)?'✓':'□':String.fromCharCode(65+i)}</span><span>${esc(o)}</span></button>`).join('');
 $('answers').querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.answer);if(t.type==='multi')selected=selected.includes(i)?selected.filter(x=>x!==i):[...selected,i];else selected=[i];renderAnswers();const f=$('answers').querySelector(`[data-answer="${i}"]`);if(f)f.focus();});
}

function correct(t,picked,arr){
 if(t.type==='order')return JSON.stringify(arr)===JSON.stringify(t.answer);
 if(t.type==='multi')return JSON.stringify([...picked].sort((a,b)=>a-b))===JSON.stringify([...t.answer].sort((a,b)=>a-b));
 if(t.type==='match'){
  if(Object.keys(matchState.pairs).length<t.pairs.length)return false;
  for(let i=0;i<t.pairs.length;i++){
   const pRight=matchState.pairs[i];
   if(t.pairs[i].right!==t.pairs[pRight]?.right)return false;
  }
  return true;
 }
 return picked[0]===t.answer;
}

function check(){
 if(checked||session===null)return;const t=currentTask();
 if(t.type==='match'&&Object.keys(matchState.pairs).length<t.pairs.length){toast('Sila padankan kesemua '+t.pairs.length+' pasangan terlebih dahulu.');return;}
 if(t.type!=='order'&&t.type!=='match'&&!selected.length){toast('Pilih jawapan terlebih dahulu.');return;}

 tries++;state.attempts++;const ok=correct(t,selected,order);
 $('feedback').hidden=false;$('feedback').className='feedback'+(ok?'':' bad');
 if(!ok){$('feedback').textContent='Belum tepat. '+t.hint+' Anda boleh ubah jawapan dan cuba lagi.';tone(false);save();return;}

 checked=true;state.solved++;if(tries===1&&!hinted)state.firstCorrect++;if(hinted)state.assisted++;
 const earned=tries===1&&!hinted?50:30;state.xp+=earned;
 $('feedback').textContent='Tepat! +'+earned+' XP. '+t.why;
 $('checkBtn').hidden=true;$('hintBtn').hidden=true;$('nextBtn').hidden=false;
 renderAnswers();

 if(session==='boss1'||session===4){
  state.bossStep++;
  if(state.bossStep===4)state.bossDone=true;
 }else if(session==='boss2'||session===9){
  state.cyberBossStep++;
  if(state.cyberBossStep===4)state.cyberBossDone=true;
 }else{
  state.steps[session]++;
  if(state.steps[session]===3)state.completed[session]=true;
 }

 update();tone();$('nextBtn').focus();
}

function advance(){
 const isBoss1=session==='boss1'||session===4;
 const isBoss2=session==='boss2'||session===9;

 if(isBoss1&&state.bossDone){
  burst(575,80);sfx('victory');if(world3D)world3D.focusInteraction(null);
  open(`<span class="eyebrow">KABUT DIMUSNAHKAN!</span><h2 id="modalTitle">Tahniah! Bab 1 Berjaya Diselesaikan.</h2><div class="intro-art"><i class="crystal" style="--c:#ffd266"></i><i class="crystal" style="--c:#54b8f4"></i><i class="crystal" style="--c:#45c999"></i><i class="crystal" style="--c:#b08ceb"></i></div><p>Raja Kabut telah berundur! Pintu gerbang dimensi ke <b>Alam 2: Perwakilan Data</b> kini terbuka luas. Melangkah ke hadapan untuk meneroka Pulau Bit & Perduaan!</p><div class="actions"><button class="primary" id="openAlam2Btn">Terokai Alam 2 (Perwakilan Data) →</button><button class="secondary" id="stayMapBtn">Kembali ke peta</button></div>`);
  $('openAlam2Btn').onclick=()=>{close();visitIsland(6);};
  $('stayMapBtn').onclick=close;
  return;
 }

 if(isBoss2&&state.cyberBossDone){
  burst(1620,680);sfx('victory');if(world3D)world3D.focusInteraction(null);
  result();
  return;
 }

 if(!isBoss1&&!isBoss2&&state.completed[session]){
  const r=regions[session];burst(r.x,r.y);sfx('crystal');
  const targetIsl=regionToIsland[session];
  open(`<span class="eyebrow">MISI SELESAI</span><h2 id="modalTitle">Kristal ${r.tech} diperoleh!</h2><div class="intro-art"><i class="crystal" style="--c:${r.color}"></i></div><p>${r.npc} mengucapkan terima kasih. Jambatan tenaga seterusnya kini dibuka!</p><div class="feedback">${r.example}</div><div class="actions"><button class="primary" id="continueMap">Lalui jambatan seterusnya →</button></div>`);
  $('continueMap').onclick=close;
  return;
 }
 task();
}

function notes(){
 if(world3D)world3D.focusInteraction(null);
 open(`<span class="eyebrow">BUKU ILMU PENGEMBARA</span><h2 id="modalTitle">Koleksi Ilmu Sains Komputer</h2><p>Panduan rujukan lengkap bagi Asas Pemikiran Komputasional (Bab 1) dan Perwakilan Data (Bab 2) ASK Tingkatan 1.</p><div class="note-grid">${regions.map(r=>`<article class="note"><h3 style="color:${r.color}">${r.name} · ${r.tech}</h3><p>${r.definition}</p><p><b>Contoh</b><br>${r.example}</p><small>SP ${r.sp}</small></article>`).join('')}</div><div class="feedback"><b>Ringkasan Nilai Asas:</b><br>• Perduaan: 1, 2, 4, 8, 16, 32, 64, 128 (Asas 2)<br>• Storan: 1 Bait = 8 Bit | 1 KB = 1024 Bait | 1 MB = 1024 KB | 1 GB = 1024 MB<br>• Multimedia: Resolusi (piksel) & Kedalaman Bit menentukan ketajaman visual serta saiz fail.</div><div class="actions"><button class="primary" id="backBtn">Kembali ke pengembaraan</button></div>`,true);
 $('backBtn').onclick=close;
}

function help(){
 if(world3D)world3D.focusInteraction(null);
 open(`<span class="eyebrow">PANDUAN PENGEMBARA</span><h2 id="modalTitle">Cara Bermain</h2><p>1. <b>Navigasi Bebas 3D:</b> Gunakan kekunci <b>WASD</b> atau anak panah untuk berjalan di atas pulau dan menyeberangi jambatan magis.<br>2. <b>Dua Alam Pengembaraan:</b> Lengkapkan Bab 1 (4 pulau) untuk membuka pintu dimensi ke Alam 2 (3 pulau & Teras CyberByte).<br>3. <b>Pelbagai Jenis Puzzle:</b> Hadapi soalan pilihan, susunan urutan tertib, dan <b>Puzzle Padanan Berpasangan</b> (klik kad kiri & kanan untuk menyambungkannya).<br>4. <b>Interaksi Pantas:</b> Tekan <b>[E]</b> berdekatan penjaga ilmu untuk membuka dialog sinematik.<br>5. Cetak Sijil Pengiktirafan rasmi selepas memulihkan kedua-dua alam!</p><div class="feedback">Markah: 50 XP (jawapan tepat kali pertama) / 30 XP (selepas petunjuk).</div><div class="actions"><button class="primary" id="backBtn">Kembali</button><button class="secondary" id="restartBtn">Mula semula</button></div>`);
 $('backBtn').onclick=close;$('restartBtn').onclick=confirmReset;
}

function confirmReset(){
 if(world3D)world3D.focusInteraction(null);
 open(`<span class="eyebrow">PENGEMBARAAN BAHARU</span><h2 id="modalTitle">Mulakan Semula?</h2><p>Semua nama, kristal dan XP permainan pada pelayar ini akan dipadam.</p><div class="actions"><button class="primary" id="resetYes">Ya, mula semula</button><button class="secondary" id="resetNo">Kembali</button></div>`);
 $('resetYes').onclick=()=>{state=fresh();resetNavigation();update();intro();};$('resetNo').onclick=help;
}

function result(){
 if(world3D)world3D.focusInteraction(null);
 const totalCompleted=state.completed.filter(Boolean).length;
 open(`<span class="eyebrow no-print">PENGEMBARAAN SELESAI</span><h2 id="modalTitle" class="no-print">Nusa Logika & Alam Data Gemilang!</h2><p class="no-print">${esc(state.name)}, anda telah menewaskan Raja Kabut dan mengaktifkan Teras CyberByte!</p><div class="result-stats no-print"><div><b>${state.xp}</b><small>Jumlah XP</small></div><div><b>${state.firstCorrect}</b><small>Tepat Kali Pertama</small></div><div><b>${totalCompleted} / 7</b><small>Kristal Ilmu</small></div></div><div class="certificate"><span class="eyebrow">AKADEMI PENGEMBARA DIGITAL</span><h3>Pengembara Agung Nusa Logika</h3><p>Diberikan dengan bangganya kepada</p><h2>${esc(state.name)}</h2><p>Telah menamatkan pengembaraan ASK Tingkatan 1<br><b>Bab 1: Asas Pemikiran Komputasional &amp; Bab 2: Perwakilan Data</b></p><p>Leraian · Pengecaman Corak · Peniskalaan · Pengitlakan<br>Sistem Nombor Perduaan · Ukuran Data · Imej &amp; Audio Digital</p><small>Penghargaan Permainan Interaktif · ${state.xp} XP Diperoleh</small></div><div class="actions"><button class="primary" id="printBtn">Cetak Sijil</button><button class="secondary" id="notesEnd">Buku Ilmu</button><button class="secondary" id="backBtn">Kembali ke Dunia</button></div>`,true);
 $('printBtn').onclick=()=>window.print();$('notesEnd').onclick=notes;$('backBtn').onclick=close;
}

function nearest(){
 if(travel)return -1;
 if(currentIsland>=0&&currentIsland<islandAreas.length&&currentIsland!==5)return currentIsland;
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
 $('interactBtn').textContent=travel?'Sedang bergerak':near===4?'Masuk istana [E]':near===9?'Cabar CyberByte [E]':near>=0?'Temui '+(islandToRegion[near]!==undefined?regions[islandToRegion[near]].npc:'Penjaga')+' [E]':'Berinteraksi [E]';
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
   onVisit:i=>visitIsland(i),
   onLost:()=>show3DError('Sambungan WebGL terputus. Muat semula untuk membuka dunia 3D.')
  });
  if(world3D&&world3D.bridgePolylines){
   cachedBridgePolylines=world3D.bridgePolylines;
  }
  setWorldView(true);
 }catch(e){show3DError(e);}

 [['rotateLeft',()=>world3D.turn(-1)],['rotateRight',()=>world3D.turn(1)],['tiltUp',()=>world3D.tilt(1)],['tiltDown',()=>world3D.tilt(-1)],['zoomIn',()=>world3D.setZoom(.14)],['zoomOut',()=>world3D.setZoom(-.14)],['resetCamera',()=>world3D.reset()]].forEach(([id,act])=>$(id).onclick=()=>{if(world3D&&use3D){act();sfx('select');}});
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

$('menuToggle').onclick=()=>setDrawer(!menuOpen);
$('closeDrawer').onclick=()=>setDrawer(false);
$('drawerBackdrop').onclick=()=>setDrawer(false);
$('cancelJourney').onclick=cancelTravel;
$('interactBtn').onclick=interact;
$('openNotes').onclick=notes;
$('openHelp').onclick=help;

document.querySelectorAll('[data-dir]').forEach(b=>{
 const dir=b.dataset.dir;
 const send=down=>{
  if(down)keys.add(dir==='up'?'arrowup':dir==='down'?'arrowdown':dir==='left'?'arrowleft':'arrowright');
  else keys.delete(dir==='up'?'arrowup':dir==='down'?'arrowdown':dir==='left'?'arrowleft':'arrowright');
 };
 b.addEventListener('pointerdown',e=>{e.preventDefault();send(true);});
 b.addEventListener('pointerup',()=>send(false));
 b.addEventListener('pointerleave',()=>send(false));
 b.addEventListener('pointercancel',()=>send(false));
});

initWorld3D();
update();
requestAnimationFrame(draw);
if(!state.name)intro();
