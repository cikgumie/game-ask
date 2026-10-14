/* Dunia Nusa Logika — Three.js r180. */
window.Nusa3D=(()=>{
function create(options){
 const T=window.THREE;if(!T)throw Error('Three.js tidak tersedia');
 const {canvas,getState,onDestination,onVisit,reduced,islandAreas,bridgeLinks,bridgeUnlocked}=options;
 const renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.6));renderer.setClearColor(0x12152f,0);
 renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.NeutralToneMapping;renderer.toneMappingExposure=1.0;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
 const scene=new T.Scene();scene.background=new T.Color(0x74d9ff);scene.fog=new T.FogExp2(0x92e7ff,.0016);
 const camera=new T.OrthographicCamera(-26,26,16,-16,.1,160);
 const initialPitch=Math.atan2(33,39),radius=Math.hypot(39,33);let yaw=0,pitch=initialPitch,zoom=1;
 const ray=new T.Raycaster(),pointer=new T.Vector2(),plane=new T.Plane(new T.Vector3(0,1,0),0),hit=new T.Vector3();
 const anim=[],labels=[],islands=[],markers=[],pickables=[],bursts=[],barriers=[],materials=new Map();
 let hero,heroHat,heroCape,heroLegs=[],castleCrystal;

 function mat(color,glow=0){const key=color+':'+glow;if(!materials.has(key))materials.set(key,new T.MeshStandardMaterial({color,flatShading:true,roughness:.8,metalness:.08,emissive:color,emissiveIntensity:glow}));return materials.get(key);}
 function mesh(geometry,color,parent=scene,x=0,y=0,z=0,glow=0){const m=new T.Mesh(geometry,mat(color,glow));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 function box(x,y,z,color,parent,px=0,py=0,pz=0){return mesh(new T.BoxGeometry(x,y,z),color,parent,px,py,pz);}
 function cyl(rt,rb,h,n,color,parent,x=0,y=0,z=0){return mesh(new T.CylinderGeometry(rt,rb,h,n),color,parent,x,y,z);}
 function ball(r,color,parent,x=0,y=0,z=0){return mesh(new T.IcosahedronGeometry(r,0),color,parent,x,y,z);}
 function ring(radius,color,parent,y=0,width=.045){const m=new T.Mesh(new T.TorusGeometry(radius,width,6,64),new T.MeshBasicMaterial({color,transparent:true,opacity:.75}));m.rotation.x=Math.PI/2;m.position.y=y;parent.add(m);return m;}

 const WORLD_SCALE=20;
 function coords(x,y){return new T.Vector3((x-550)/WORLD_SCALE,0,(y-330)/WORLD_SCALE);}
 function place(group,x,y){group.position.copy(coords(x,y));scene.add(group);return group;}

 scene.add(new T.HemisphereLight(0xd8faff,0x399b79,1.75));
 const sunlight=new T.DirectionalLight(0xfff4d2,2.2);sunlight.position.set(-16,34,18);sunlight.castShadow=true;sunlight.shadow.mapSize.set(1024,1024);
 Object.assign(sunlight.shadow.camera,{left:-38,right:38,top:32,bottom:-32,near:.5,far:90});sunlight.shadow.normalBias=.04;scene.add(sunlight);
 const rim=new T.DirectionalLight(0x8bdcff,1.0);rim.position.set(18,12,-20);scene.add(rim);

 const glowCanvas=document.createElement('canvas');glowCanvas.width=128;glowCanvas.height=128;
 const gc=glowCanvas.getContext('2d'),gradient=gc.createRadialGradient(64,64,0,64,64,64);
 gradient.addColorStop(0,'rgba(255,255,255,.75)');gradient.addColorStop(.24,'rgba(255,255,255,.3)');gradient.addColorStop(1,'rgba(255,255,255,0)');
 gc.fillStyle=gradient;gc.fillRect(0,0,128,128);const glowTexture=new T.CanvasTexture(glowCanvas);

 function halo(parent,color,size,y){const s=new T.Sprite(new T.SpriteMaterial({map:glowTexture,color,transparent:true,depthWrite:false,blending:T.AdditiveBlending}));s.scale.set(size,size,1);s.position.y=y;parent.add(s);return s;}
 function label(text,parent,y,color='#e4f3ff',small=false,subtext='',zOffset=0){
  const c=document.createElement('canvas');
  const w=small?560:920, h=small?140:220;
  c.width=w; c.height=h;
  const g=c.getContext('2d');

  // Bayang luaran lembut & pekat
  g.shadowColor='rgba(0,0,0,0.85)';
  g.shadowBlur=18;
  g.shadowOffsetY=6;

  // Latar belakang pil obsidian/gelap berdefinisi tinggi
  g.fillStyle='rgba(9,14,32,0.96)';
  g.beginPath();
  g.roundRect(12,12,w-24,h-24,small?24:38);
  g.fill();

  // Bingkai bercahaya warna tema
  g.shadowColor=color;
  g.shadowBlur=16;
  g.strokeStyle=color;
  g.lineWidth=small?4.5:6;
  g.stroke();

  // Tetapkan semula bayang untuk teks tajam
  g.shadowBlur=0;
  g.shadowOffsetY=0;
  g.textAlign='center';
  g.textBaseline='middle';

  if(small){
   g.font='900 64px Arial,Helvetica,sans-serif';
   g.strokeStyle='rgba(0,0,0,0.92)';
   g.lineWidth=8;
   g.strokeText(text,w/2,h/2);
   g.fillStyle=color;
   g.fillText(text,w/2,h/2);
  }else{
   if(subtext){
    g.font='900 74px Arial,Helvetica,sans-serif';
    g.strokeStyle='rgba(0,0,0,0.95)';
    g.lineWidth=10;
    g.strokeText(text,w/2,76);
    g.fillStyle='#FFFFFF';
    g.fillText(text,w/2,76);

    g.font='900 42px Arial,Helvetica,sans-serif';
    g.strokeStyle='rgba(0,0,0,0.9)';
    g.lineWidth=6;
    const subStr='✦ '+subtext.toUpperCase()+' ✦';
    g.strokeText(subStr,w/2,150);
    g.fillStyle=color;
    g.fillText(subStr,w/2,150);
   }else{
    g.font='900 78px Arial,Helvetica,sans-serif';
    g.strokeStyle='rgba(0,0,0,0.95)';
    g.lineWidth=10;
    g.strokeText(text,w/2,h/2);
    g.fillStyle='#FFFFFF';
    g.fillText(text,w/2,h/2);
   }
  }

  const texture=new T.CanvasTexture(c);
  texture.colorSpace=T.SRGBColorSpace;
  texture.minFilter=T.LinearFilter;
  texture.magFilter=T.LinearFilter;

  // depthTest: false memastikan teks sentiasa di hadapan tanpa terpotong
  const spr=new T.Sprite(new T.SpriteMaterial({map:texture,transparent:true,depthTest:false,depthWrite:false}));
  spr.renderOrder=small?1000:995;
  spr.position.set(0,y,zOffset);
  spr.scale.set(small?2.8:6.6,small?0.72:1.58,1);
  parent.add(spr);
  labels.push(spr);
  if(!small)anim.push({type:'banner',object:spr,base:y});
  return spr;
 }

 function island(x,y,r,color,index){
  const g=place(new T.Group(),x,y);
  cyl(r*.98,r*.76,1.8,9,0x64885d,g,0,-1.45);
  cyl(r*.76,r*.4,3.0,9,0x3d775a,g,0,-3.75);
  const terrain=cyl(r,r,.5,16,color,g,0,-.26);
  cyl(r*1.02,r*.98,.18,16,0xffc969,g,0,-.53);
  const glow=ring(r*.86,[0xf4b760,0x65e9aa,0x68c5ff,0xc58cff,0xa697ec,0x67e1db][index],g,-.01,.036);
  glow.material.opacity=.25;
  islands.push({group:g,index,terrain,ring:glow});
  terrain.userData.region=index;pickables.push(terrain);
  for(let j=0;j<8;j++){
   const a=j*(Math.PI/4)+index*.3;
   ball(.24,[0xcca5ff,0x84e9d1,0xffd575,0x72d6fc][j%4],g,Math.cos(a)*(r-.5),.12,Math.sin(a)*(r-.5));
  }
  return g;
 }

 const village=island(islandAreas[0].x,islandAreas[0].y,islandAreas[0].r,0x35c873,0),
       forest=island(islandAreas[1].x,islandAreas[1].y,islandAreas[1].r,0x19b95c,1),
       lake=island(islandAreas[2].x,islandAreas[2].y,islandAreas[2].r,0x3ccdb3,2),
       towerIsland=island(islandAreas[3].x,islandAreas[3].y,islandAreas[3].r,0x9555df,3),
       castle=island(islandAreas[4].x,islandAreas[4].y,islandAreas[4].r,0x718ee0,4),
       spawn=island(islandAreas[5].x,islandAreas[5].y,islandAreas[5].r,0x48d273,5);

 function tree(g,x,z,s=1,pine=false){
  const group=new T.Group();group.position.set(x,0,z);group.scale.setScalar(s);g.add(group);
  cyl(.14,.2,1.2,6,0x906d61,group,0,.5);
  if(pine){
   cyl(0,1.1,1.7,7,0x0b984a,group,0,1.7);cyl(0,.85,1.45,7,0x1cbd5a,group,0,2.55);cyl(0,.6,1.2,7,0x54e078,group,0,3.25);
  }else{
   ball(1,0x14aa48,group,0,1.6);ball(.85,0x36d366,group,.45,2.1,.05);ball(.68,0x7bea79,group,-.42,2.35,-.12);
  }
  return group;
 }
 function house(g,x,z,s=1,color=0xf1662d){
  const h=new T.Group();h.position.set(x,0,z);h.scale.setScalar(s);g.add(h);
  box(2,1.4,1.65,0xffe3a0,h,0,.72);
  const roof=cyl(0,1.7,1.1,4,color,h,0,1.93);roof.rotation.y=Math.PI/4;
  box(.52,.83,.09,0x70719a,h,0,.42,.87);
  [-.65,.65].forEach(v=>{const w=box(.33,.38,.06,0xffd17d,h,v,.96,.86);w.material=mat(0xffd17d,.7);});
  box(.25,.8,.28,0xebbb9f,h,.68,2.12,-.2);
  return h;
 }
 function tower(g,x,z,s=1,color=0x7f39d4){
  const t=new T.Group();t.position.set(x,0,z);t.scale.setScalar(s);g.add(t);
  cyl(.72,.83,3.1,8,0xdde0f4,t,0,1.55);cyl(0,1.07,1.4,8,color,t,0,3.6);
  cyl(.87,.87,.14,8,0xb5bddf,t,0,.35);cyl(.82,.82,.14,8,0xb5bddf,t,0,2.4);
  box(.35,.7,.07,0xffd68e,t,0,1.7,.75).material=mat(0xffd68e,.6);
  return t;
 }

 // Perhiasan Kampung Leraian (Pulau 0)
 house(village,-1.2,-2.1,1.4,0xf1662d);
 house(village,3.2,1.8,.95,0xffa63d);
 house(village,-3.4,1.5,.85,0x56a5e8);
 tree(village,-4.6,-1.2,1.1);tree(village,-4.2,2.8,.85);tree(village,4.4,-1.8,.95);tree(village,1.6,-4.4,1.0);tree(village,-2.2,4.6,.8);
 cyl(.65,.75,.4,8,0xdde6e5,village,0,.2,0);ring(.5,0x55d4ee,village,.21,.04); // Telaga kampung

 // Perhiasan Hutan Corak (Pulau 1)
 [[-3.5,-1.8,1.2],[-2.8,-3.8,1.0],[2.8,-3.5,1.15],[4.4,.8,1.05],[-4.4,1.8,.95],[1.4,4.2,1.1],[-2.2,4.4,.9],[4.0,-1.5,.95]].forEach(([x,z,s])=>tree(forest,x,z,s,true));
 const forestStone=cyl(1.1,1.3,.38,8,0xc7e3a8,forest,0,.15,-.1);
 [-.7,0,.7].forEach((v,i)=>ball(.22,[0xffd778,0x78ffd4,0xc898ff][i],forest,v,.45,-.1));

 // Perhiasan Tasik Peniskalaan (Pulau 2)
 const pond=cyl(2.7,2.7,.08,48,0x45bada,lake,.2,.02,-.2);
 pond.material=new T.MeshPhysicalMaterial({color:0x4ad7f4,roughness:.12,metalness:.25,transparent:true,opacity:.88});
 ring(2.0,0xc1f9ff,pond,.05,.028);ring(1.2,0xa2f3ff,pond,.07,.025);
 house(lake,-3.8,-1.2,.85,0x6ca7e8);
 box(1.8,.08,.6,0x9f7353,lake,-1.4,.08,-.2); // Jeti kayu tasik
 tree(lake,4.4,-1.8,1.1);tree(lake,3.2,-4.2,.95);tree(lake,-4.2,2.4,.9);tree(lake,4.2,2.2,1.0);tree(lake,-1.8,-4.6,.85);
 const boat=new T.Group();boat.position.set(.4,.1,-.1);lake.add(boat);
 cyl(.38,.29,.2,5,0xa07866,boat);const sail=mesh(new T.ConeGeometry(.55,1.1,3),0xffedd2,boat,0,.7,0);sail.rotation.z=-.4;anim.push({type:'boat',object:boat,base:.1});

 // Perhiasan Menara Pengitlakan (Pulau 3)
 tower(towerIsland,0,-1.4,1.35,0x7f39d4);
 tower(towerIsland,-3.1,.8,.85,0xa556ef);
 tower(towerIsland,3.1,.8,.9,0x5b36bd);
 cyl(.32,.32,1.6,6,0xded2f9,towerIsland,-1.9,.8,2.6);cyl(.32,.32,1.6,6,0xded2f9,towerIsland,1.9,.8,2.6); // Tiang akademi
 tree(towerIsland,-4.2,-2.2,.95,true);tree(towerIsland,4.2,-2.2,.95,true);tree(towerIsland,-4.4,2.2,.8,true);tree(towerIsland,4.4,2.2,.8,true);

 // Perhiasan Istana Raja Kabut (Pulau 4)
 tower(castle,-2.5,-2.2,1.35,0x7940cc);tower(castle,2.5,-2.2,1.35,0x7940cc);
 box(3.8,3.0,2.4,0xcdd5ed,castle,0,1.5,-2.4);
 box(1.2,1.8,.2,0x483a65,castle,0,.9,-1.15); // Pintu gerbang istana
 cyl(0,2.6,1.7,4,0x8737d0,castle,0,3.85,-2.4).rotation.y=Math.PI/4;
 for(let i=0;i<5;i++)box(.36,.42,.42,0xe3eaff,castle,-1.5+i*.75,3.1,-1.1);
 box(1.8,1.6,1.4,0xb8c2df,castle,-4.1,.8,-2.2);box(1.8,1.6,1.4,0xb8c2df,castle,4.1,.8,-2.2); // Tembok sisi

 // Perhiasan Pulau Permulaan (Pulau 5)
 cyl(.28,.32,2.2,6,0xdfede8,spawn,-1.3,1.1,-.8);cyl(.28,.32,2.2,6,0xdfede8,spawn,1.3,1.1,-.8);
 box(3.0,.35,.5,0xdfede8,spawn,0,2.3,-.8);cyl(0,.9,.65,4,0x2bbba3,spawn,0,2.85,-.8).rotation.y=Math.PI/4; // Gerbang Kebangkitan
 ring(1.3,0x6ffbe4,spawn,.02,.035);
 tree(spawn,-2.3,1.6,.9);tree(spawn,2.3,1.6,.9);

 const colors=[0xffc662,0x66efb5,0x69d0ff,0xc49aff];
 function crystal(g,color,index,x=0,z=0){
  const c=new T.Group();c.position.set(x,2.7,z);g.add(c);
  const core=mesh(new T.OctahedronGeometry(.65),color,c,0,0,0,.35);core.scale.y=1.65;
  const haloMesh=halo(c,color,3.1,0);const orbit=ring(.96,color,c,-.15,.025);orbit.rotation.x=1.13;
  anim.push({type:'crystal',object:c,base:2.7,index,core,halo:haloMesh});return c;
 }
 [village,forest,lake,towerIsland].forEach((g,i)=>{
  crystal(g,colors[i],i,0,1.9);
  const portal=new T.Mesh(new T.TorusGeometry(.65,.08,8,40),mat(colors[i],.65));
  portal.position.set(1.9,.9,1.6);g.add(portal);halo(portal,colors[i],1.7,0);
  anim.push({type:'portal',object:portal,index:i});
 });
 castleCrystal=crystal(castle,0xd4b5ff,4,0,-1.4);castleCrystal.position.y=5.6;anim[anim.length-1].base=5.6;

 function character(g,x,z,color,isHero=false){
  const person=new T.Group();person.position.set(x,0,z);g.add(person);
  cyl(.2,.3,.56,7,color,person,0,.74);ball(.27,0xffdab7,person,0,1.22);
  const cap=cyl(.24,.31,.12,8,isHero?0x2ce0ca:color,person,0,1.43);
  box(.52,.07,.35,isHero?0xffce71:color,person,0,1.39,.12);
  const legs=[];[-.13,.13].forEach(v=>{const leg=box(.15,.43,.2,0x35425e,person,v,.24);legs.push(leg);box(.2,.12,.34,0x26344c,person,v,.08,.06);});
  box(.11,.42,.14,0xffdab7,person,-.33,.68);box(.11,.42,.14,0xffdab7,person,.33,.68);
  if(isHero){
   heroHat=cap;heroCape=box(.43,.65,.05,0xf78885,person,0,.67,-.23);heroLegs=legs;
   const hover=cyl(.38,.45,.055,16,0x74f6eb,person,0,.01);hover.material=mat(0x74f6eb,.45);
   ring(.49,0x7dfdf0,person,.03,.022);halo(person,0x40decf,1.5,.01);
  }
  return person;
 }

 const npcs=[];
 const npcIcons=['🔨','🏹','🛶','📜'];
 const npcColors=['#ffd27b','#78ffd4','#70d6ff','#d8b4fe'];
 [village,forest,lake,towerIsland].forEach((g,i)=>{
  const p=character(g,0,1.1,colors[i]);
  npcs.push(p);
  label(npcIcons[i]+' '+options.regions[i].npc,p,2.15,npcColors[i],true,'',0);
  const m=mesh(new T.OctahedronGeometry(.19),0xffd27b,g,0,2.05,1.1,.45);
  markers.push(m);
 });
 // Bos Raja Kabut (MVP) di Pulau Istana
 const boss=character(castle,0,0.6,0x3d1a5e);
 boss.scale.setScalar(1.65);
 cyl(0,.36,.35,5,0xffbe3b,boss,0,1.62);
 box(.58,.96,.08,0x1d0f33,boss,0,.78,-.26);
 halo(boss,0x9d4edd,2.4,0.05);
 npcs.push(boss);
 label('👑 Raja Kabut',boss,2.65,'#ff4370',true,'',0);
 const bossMarker=mesh(new T.OctahedronGeometry(.24),0xff4370,castle,0,2.5,0.6,.45);
 markers.push(bossMarker);

 hero=character(scene,0,0,0x1eccc1,true);hero.scale.setScalar(1.55);

 const techs=options.regions.map(r=>r.tech);
 const names=options.regions.map(r=>r.name);
 const islandColors=['#ffd294','#a3f6cc','#b0e8ff','#e2c5ff'];

 const islandBanners=[
  {y:4.3,color:'#FFB300',tech:'Teknik Leraian',z:-0.2},
  {y:4.3,color:'#00E676',tech:'Pengecaman Corak',z:-0.2},
  {y:4.3,color:'#00B0FF',tech:'Teknik Peniskalaan',z:-0.2},
  {y:4.5,color:'#D500F9',tech:'Teknik Pengitlakan',z:-0.2}
 ];

 [village,forest,lake,towerIsland].forEach((g,i)=>{
  label(names[i],g,islandBanners[i].y,islandBanners[i].color,false,islandBanners[i].tech,islandBanners[i].z);
 });
 label('Istana Raja Kabut',castle,5.2,'#FF4081',false,'Pertarungan Akhir',-0.5);
 label('Pulau Permulaan',spawn,3.8,'#00E5FF',false,'Titik Mula',0);
 label('⭐ Anda',hero,2.35,'#5EEAD4',true,'',0);

 // Pembinaan Jambatan Terapung & Gerbang Kuasa Magis
 const bridgeCurves=[],bridgePolylines=[];
 bridgeLinks.forEach((b,i)=>{
  const curve=new T.CatmullRomCurve3(b.points.map(([x,y])=>{const p=coords(x,y);p.y=-.025;return p;}));
  bridgeCurves.push(curve);
  const pts=curve.getPoints(40).map(p=>({x:p.x*WORLD_SCALE+550,y:p.z*WORLD_SCALE+330}));
  bridgePolylines.push(pts);

  // Rasuk tenaga di bawah jambatan
  const beam=new T.Mesh(new T.TubeGeometry(curve,44,.055,6,false),new T.MeshBasicMaterial({color:b.color,transparent:true,opacity:.75}));
  scene.add(beam);

  // Jubin batu lantai jambatan yang lebar & kukuh
  const tileCount=34;
  for(let j=0;j<=tileCount;j++){
   const t=j/tileCount,p=curve.getPoint(t),tangent=curve.getTangent(t);
   const normal=new T.Vector3(-tangent.z,0,tangent.x).normalize();
   const tile=box(1.35,.12,.42,i===3?0x9584c0:0x98b8be,scene,p.x,-.11,p.z);
   tile.rotation.y=-Math.atan2(tangent.z,tangent.x);

   // Tiang hiasan & tanglung kristal di tepi jambatan
   if(j%3===0&&j>0&&j<tileCount){
    [-.68,.68].forEach(side=>{
     const postPos=p.clone().addScaledVector(normal,side);
     cyl(.045,.06,.26,6,0xc5d2d4,scene,postPos.x,.02,postPos.z);
     ball(.065,b.color,scene,postPos.x,.18,postPos.z);
    });
   }
  }

  // Pintu gerbang tenaga magis untuk jambatan yang belum dibuka
  if(i<4){
   const barrierT=.45,barrierPt=curve.getPoint(barrierT),tangent=curve.getTangent(barrierT);
   const bGroup=new T.Group();bGroup.position.set(barrierPt.x,0,barrierPt.z);
   bGroup.rotation.y=-Math.atan2(tangent.z,tangent.x);scene.add(bGroup);
   const arch=new T.Mesh(new T.TorusGeometry(.82,.065,8,24,Math.PI),mat(b.color,.7));
   arch.position.y=.08;bGroup.add(arch);
   const shield=new T.Mesh(new T.CircleGeometry(.78,20,0,Math.PI),new T.MeshBasicMaterial({color:b.color,transparent:true,opacity:.45,side:T.DoubleSide}));
   shield.position.y=.08;bGroup.add(shield);
   const lockRune=mesh(new T.OctahedronGeometry(.18),0xffd266,bGroup,0,1.02,0,.7);
   barriers.push({group:bGroup,bridgeIndex:i,shield,lockRune});
  }
 });

 const fireGeo=new T.BufferGeometry(),firePos=[];for(let i=0;i<70;i++)firePos.push(Math.sin(i*17)*20,.5+(i%6)*.4,Math.cos(i*13)*10);
 fireGeo.setAttribute('position',new T.Float32BufferAttribute(firePos,3));
 const fireflies=new T.Points(fireGeo,new T.PointsMaterial({color:0xa0ffe5,size:.085,transparent:true,opacity:.7}));scene.add(fireflies);
 const destinationRing=new T.Mesh(new T.RingGeometry(.28,.38,32),new T.MeshBasicMaterial({color:0xaffff2,side:T.DoubleSide,transparent:true,opacity:.9}));
 destinationRing.rotation.x=-Math.PI/2;destinationRing.visible=false;scene.add(destinationRing);

 let lastX=0,lastZ=0;
 const defaultLook=new T.Vector3(0,-.75,0);
 const currentLook=new T.Vector3(0,-.75,0);
 const targetLook=new T.Vector3(0,-.75,0);
 let currentZoom=1, targetZoom=1;

 function positionCamera(){
  const aspect=(canvas.clientWidth||1100)/(canvas.clientHeight||650);
  const halfH=Math.max(18.5,28/aspect)/currentZoom;
  camera.left=-halfH*aspect;camera.right=halfH*aspect;camera.top=halfH;camera.bottom=-halfH;
  const horizontal=radius*Math.cos(pitch);
  camera.position.set(currentLook.x+Math.sin(yaw)*horizontal,currentLook.y+radius*Math.sin(pitch),currentLook.z+Math.cos(yaw)*horizontal);
  camera.lookAt(currentLook);
  camera.updateProjectionMatrix();camera.updateMatrixWorld();
 }
 function resize(){const w=canvas.clientWidth||1100,h=canvas.clientHeight||650;renderer.setSize(w,h,false);positionCamera();}
 function orbit(dx,dy){yaw-=dx*.006;pitch=Math.max(-1.05,Math.min(1.46,pitch+dy*.006));positionCamera();}
 function turn(direction){yaw+=direction*.3;positionCamera();}
 function tilt(direction){pitch=Math.max(-1.05,Math.min(1.46,pitch+direction*.16));positionCamera();}
 function setZoom(delta){targetZoom=Math.max(.65,Math.min(3.4,targetZoom+delta));}
 function reset(){cancelOrbit();yaw=0;pitch=initialPitch;targetZoom=1;targetLook.copy(defaultLook);focusInteraction(null);}

 function focusInteraction(islandIndex){
  if(islandIndex===null||islandIndex===undefined||islandIndex<0||islandIndex>4){
   targetLook.copy(defaultLook);
   targetZoom=1.0;
   npcs.forEach(n=>n.rotation.y=0);
   return;
  }

  scene.updateMatrixWorld(true);

  const heroPos=new T.Vector3();
  hero.getWorldPosition(heroPos);

  const targetPos=new T.Vector3();
  if(npcs[islandIndex]){
   npcs[islandIndex].getWorldPosition(targetPos);
   // Hero dan NPC/Bos saling berhadapan secara dinamik
   const dx=targetPos.x-heroPos.x, dz=targetPos.z-heroPos.z;
   hero.rotation.y=Math.atan2(dx,dz);
   npcs[islandIndex].rotation.y=Math.atan2(-dx,-dz);
  }

  // Titik tumpu tengah antara Player dan NPC/Bos, diimbangi sedikit ke bawah
  // supaya kedua-dua watak jelas kelihatan di bahagian atas skrin (di atas kad dialog)
  const midX=(heroPos.x+targetPos.x)*0.5;
  const midY=Math.max(heroPos.y,targetPos.y)-0.45;
  const midZ=(heroPos.z+targetPos.z)*0.5;

  targetLook.set(midX,midY,midZ);
  targetZoom=2.8; // Zum sinematik dekat (Player vs NPC / Bos)
 }
 function move(dx,dy){const vertical=pitch<0?-dy:dy;return {dx:dx*Math.cos(yaw)+vertical*Math.sin(yaw),dy:-dx*Math.sin(yaw)+vertical*Math.cos(yaw)};}
 function destination(clientX,clientY){
  const rect=canvas.getBoundingClientRect();pointer.set((clientX-rect.left)/rect.width*2-1,-(clientY-rect.top)/rect.height*2+1);
  ray.setFromCamera(pointer,camera);const regionsHit=ray.intersectObjects(pickables,false);
  if(regionsHit.length){onVisit(regionsHit[0].object.userData.region);return;}
  if(ray.ray.intersectPlane(plane,hit)){onDestination({x:Math.max(40,Math.min(1060,hit.x*WORLD_SCALE+550)),y:Math.max(40,Math.min(620,hit.z*WORLD_SCALE+330))});}
 }

 const pointers=new Map();let pinchDistance=0;canvas.style.cursor='grab';
 function pairDistance(){const p=[...pointers.values()];return p.length>1?Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y):0;}
 function cancelOrbit(){const ids=[...pointers.keys()];pointers.clear();pinchDistance=0;canvas.style.cursor='grab';for(const id of ids){try{if(canvas.hasPointerCapture?.(id))canvas.releasePointerCapture(id);}catch(e){}}}
 canvas.addEventListener('pointerdown',e=>{if(options.isModalOpen()||e.button!==undefined&&e.button!==0&&e.pointerType!=='touch')return;e.preventDefault();pointers.set(e.pointerId,{x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY,dragged:false});try{canvas.setPointerCapture(e.pointerId);}catch(err){}if(pointers.size>1){pointers.forEach(p=>p.dragged=true);pinchDistance=pairDistance();}});
 canvas.addEventListener('pointermove',e=>{const p=pointers.get(e.pointerId);if(!p)return;if(options.isModalOpen()){cancelOrbit();return;}e.preventDefault();const dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;if(pointers.size>1){pointers.forEach(v=>v.dragged=true);const distance=pairDistance();if(pinchDistance>0&&distance>0)setZoom(zoom*(distance/pinchDistance-1));pinchDistance=distance;canvas.style.cursor='grabbing';return;}if(!p.dragged&&Math.hypot(p.x-p.sx,p.y-p.sy)>5){p.dragged=true;orbit(p.x-p.sx,p.y-p.sy);}else if(p.dragged)orbit(dx,dy);if(p.dragged)canvas.style.cursor='grabbing';});
 function finishPointer(e,cancelled=false){const p=pointers.get(e.pointerId);if(!p)return;pointers.delete(e.pointerId);pinchDistance=0;pointers.forEach(v=>{v.dragged=true;v.sx=v.x;v.sy=v.y;});try{if(canvas.hasPointerCapture?.(e.pointerId))canvas.releasePointerCapture(e.pointerId);}catch(err){}if(!pointers.size)canvas.style.cursor='grab';const tap=!cancelled&&!p.dragged&&Math.hypot(e.clientX-p.sx,e.clientY-p.sy)<=5;if(tap&&!options.isModalOpen())destination(e.clientX,e.clientY);}
 canvas.addEventListener('pointerup',e=>finishPointer(e));canvas.addEventListener('pointercancel',e=>finishPointer(e,true));canvas.addEventListener('lostpointercapture',e=>finishPointer(e,true));canvas.addEventListener('contextmenu',e=>e.preventDefault());window.addEventListener?.('blur',cancelOrbit);
 canvas.addEventListener('wheel',e=>{if(options.isModalOpen())return;e.preventDefault();setZoom(e.deltaY>0?-.08:.08);},{passive:false});
 let lost=false;canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true;cancelOrbit();options.onLost();});

 function celebrate(x,y){const group=new T.Group();group.position.copy(coords(x,y));scene.add(group);const pieces=[];for(let i=0;i<32;i++){const m=mesh(new T.OctahedronGeometry(.1),colors[i%4],group,0,1,0,.4);pieces.push({mesh:m,vx:Math.sin(i*2.4)*3.5,vy:2.5+i%4,vz:Math.cos(i*2.4)*3.5});}bursts.push({group,pieces,age:0});}

 function render(time,dt,target){
  if(lost)return;const s=getState(),p=coords(s.hero.x,s.hero.y),moving=Math.hypot(p.x-lastX,p.z-lastZ)>.005;
  const turnAngle=Math.atan2(p.x-lastX,p.z-lastZ);
  hero.position.set(p.x,(options.getHeroLift?.()||0)+(reduced?.06:.07+Math.sin(time*3)*.035),p.z);
  if(moving)hero.rotation.y=turnAngle;
  heroLegs.forEach((l,i)=>l.rotation.x=moving&&!reduced?Math.sin(time*13+i*Math.PI)*.35:0);
  if(heroCape)heroCape.rotation.x=moving?.2:0;lastX=p.x;lastZ=p.z;

  anim.forEach((a,i)=>{
   if(a.type==='crystal'){
    a.object.rotation.y=reduced?0:time*.7;a.object.position.y=a.base+(reduced?0:Math.sin(time*1.7+i)*.2);
    const done=a.index<4?s.completed[a.index]:s.bossDone;
    const available=a.index===0||a.index<4&&s.completed[a.index-1]||a.index===4&&s.completed.every(Boolean);
    a.core.material.emissiveIntensity=done?.85:available?.35:.06;a.halo.material.opacity=done?1:available?.75:.15;
   }else if(a.type==='portal'){a.object.rotation.z=reduced?0:Math.sin(time*.5)*.08;}
   else if(a.type==='boat'){a.object.position.y=a.base+(reduced?0:Math.sin(time*1.3)*.045);}
   else if(a.type==='banner'){a.object.position.y=a.base+(reduced?0:Math.sin(time*1.6+i)*.12);}
  });

  markers.forEach((m,i)=>{
   const done=i<4?s.completed[i]:s.bossDone;
   const ready=i===0||(i<4?s.completed[i-1]:s.completed.every(Boolean));
   m.visible=!done&&ready;
   m.rotation.y=reduced?0:time;
   m.position.y=(i===4?2.5:2.08)+(reduced?0:Math.sin(time*2.2)*.12);
  });
  islands.forEach(a=>{const done=a.index<4?s.completed[a.index]:a.index===4?s.bossDone:false;a.ring.material.opacity=done?.9:.24;});
  castleCrystal.children[0].material.color.set(s.bossDone?0xffd271:0xc39cf2);

  // Kemas kini pintu gerbang magis pada jambatan yang terkunci
  barriers.forEach(b=>{
   const open=bridgeUnlocked?bridgeUnlocked(b.bridgeIndex):false;
   b.group.visible=!open;
   if(!open){
    b.shield.material.opacity=.32+Math.sin(time*3.6+b.bridgeIndex)*.16;
    if(b.lockRune)b.lockRune.rotation.y=time*1.7;
   }
  });

  destinationRing.visible=!!target;if(target){destinationRing.position.copy(coords(target.x,target.y));destinationRing.position.y=.055;}
  if(!reduced){fireflies.rotation.y=Math.sin(time*.13)*.02;}
  for(let i=bursts.length-1;i>=0;i--){const b=bursts[i];b.age+=dt;b.pieces.forEach(v=>{v.mesh.position.x+=v.vx*dt;v.mesh.position.y+=v.vy*dt;v.mesh.position.z+=v.vz*dt;v.vy-=5*dt;v.mesh.scale.setScalar(Math.max(.1,1-b.age/1.8));});if(b.age>1.8){scene.remove(b.group);b.pieces.forEach(v=>v.mesh.geometry.dispose());bursts.splice(i,1);}}

  // Kelancaran pergerakan kamera (Smooth Camera Lerp)
  const lerpSpeed = Math.min(1, dt * 5.5);
  currentLook.lerp(targetLook, lerpSpeed);
  currentZoom += (targetZoom - currentZoom) * lerpSpeed;
  positionCamera();

  renderer.render(scene,camera);
 }

 resize();
 return {scene,camera,renderer,render,resize,turn,tilt,setZoom,reset,move,celebrate,destination,cancelOrbit,logicalPoint:coords,bridgePolylines,focusInteraction};
}
return {create};
})();
