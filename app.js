/* ── State ── */
const STATE_KEY = 'escapeHatchState';
function defaultState(){
  return { savedItems:[], charms:[], nopedItems:[], nopedTypes:{}, nopedCategories:{}, brainWeatherHistory:[], dailyDoorSeen:{date:null,id:null}, currentShelf:'all' };
}
function loadState(){ try{ return Object.assign(defaultState(), JSON.parse(localStorage.getItem(STATE_KEY)||'{}')); }catch(e){ return defaultState(); } }
function saveState(){ localStorage.setItem(STATE_KEY, JSON.stringify(state)); }
let state = loadState();

/* ── Helpers ── */
function rand(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function randIdx(arr){ return Math.floor(Math.random()*arr.length); }
function dateKey(){ return new Date().toISOString().slice(0,10); }
function $(id){ return document.getElementById(id); }
function show(el){ if(typeof el==='string') el=$(el); if(el) el.classList.remove('hidden'); }
function hide(el){ if(typeof el==='string') el=$(el); if(el) el.classList.add('hidden'); }
function qs(sel){ return document.querySelector(sel); }

function toast(msg, dur=2200){
  const t=$('toast'); t.textContent=msg; t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'), dur);
}

function showCharm(charmId){
  if(state.charms.includes(charmId)) return;
  state.charms.push(charmId); saveState();
  const charm = EH.charms.find(c=>c.id===charmId);
  if(!charm) return;
  const el=$('charmNotif');
  $('charmNotifIcon').textContent = charm.icon;
  $('charmNotifText').textContent = 'Charm earned: '+charm.label;
  el.classList.add('show');
  setTimeout(()=>el.classList.remove('show'), 3000);
  renderCharms();
}

function copyToClipboard(text){
  navigator.clipboard ? navigator.clipboard.writeText(text).then(()=>toast('Copied!')).catch(()=>toast('Copied (maybe)')) : toast('Copy manually.');
}

/* ── Navigation ── */
function showScreen(name){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  const sc = $('screen-'+name); if(sc) sc.classList.add('active');
  const nb = qs(`.nav-btn[data-screen="${name}"]`); if(nb) nb.classList.add('active');
  if(name==='cabinet') renderCabinet();
  if(name==='saved') renderSaved();
}
document.querySelectorAll('.nav-btn').forEach(btn=>{
  btn.addEventListener('click',()=>showScreen(btn.dataset.screen));
});

/* ── Daily Door ── */
function renderDailyDoor(){
  const today = dateKey();
  const dayIdx = (new Date().getDay()); // 0–6
  const door = EH.dailyDoors[dayIdx % EH.dailyDoors.length];
  $('dailyDoorTitle').textContent = door.title;
  $('dailyDoorDesc').textContent = door.desc;
  $('dailyDoorTime').textContent = door.time;
  $('dailyDoorOpen')._door = door;
  $('dailyDoorSave')._door = door;
}
$('dailyDoorOpen').addEventListener('click', function(){
  const door = this._door;
  if(door.id==='d4'){ openRiddle(); return; }
  if(door.link) window.open(door.link,'_blank',door.link.startsWith('http')?'noopener':'');
  else toast('No link for this door — do the tiny task!');
});
$('dailyDoorSave').addEventListener('click', function(){
  const door = this._door;
  openShelfModal({ id:'door-'+door.id, title:door.title, description:door.desc, type:'link', url:door.link });
});
$('dailyDoorNot').addEventListener('click',()=>{ hide('dailyDoor'); toast('Skipped. Another day.'); });

/* ── Mood Grid ── */
function renderMoodGrid(){
  const grid=$('moodGrid'); grid.innerHTML='';
  EH.moods.forEach(mood=>{
    const btn=document.createElement('button');
    btn.className='mood-btn'; btn.textContent=mood;
    btn.addEventListener('click',()=>{
      document.querySelectorAll('.mood-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      showRec(mood);
    });
    grid.appendChild(btn);
  });
}

/* ── Recommendation Engine ── */
let currentMood=null, currentRecIdx=0, currentRecItem=null;

function showRec(mood){
  currentMood=mood;
  const recs = EH.moodRecs[mood];
  if(!recs||!recs.length) return;
  // filter out noped items
  const filtered = recs.filter(r=>{
    if(r.type==='link'&&r.id&&state.nopedItems.includes(r.id)) return false;
    return true;
  });
  const pool = filtered.length ? filtered : recs;
  currentRecIdx = randIdx(pool);
  renderRecItem(pool[currentRecIdx], pool, mood);
}

function renderRecItem(rec, pool, mood){
  currentRecItem = rec;
  const panel=$('recPanel');
  show(panel);
  const actionEl=$('recAction'), cardEl=$('recCard');
  cardEl.innerHTML='';

  if(rec.type==='link'){
    const link = EH.links.find(l=>l.id===rec.id);
    if(!link){ hide(panel); return; }
    actionEl.textContent = "Here’s one door for " + mood.toLowerCase() + ".";
    cardEl.innerHTML = `<strong>${link.title}</strong><br>${link.description}<br><span style="font-size:.78rem;color:var(--text-light)">${link.estimatedTime} · ${link.effort}</span>`;
    $('recOpen')._url = link.url;
    $('recOpen')._item = { id:link.id, title:link.title, description:link.description, type:'link', url:link.url };
    $('recSave')._item = { id:link.id, title:link.title, description:link.description, type:'link', url:link.url };
  } else if(rec.type==='joke'){
    const joke = rand(EH.jokes);
    actionEl.textContent = 'Read one joke. Do not evaluate whether it is good.';
    cardEl.textContent = joke;
    $('recOpen')._url = null;
    $('recSave')._item = { id:'joke-'+Date.now(), title:'Joke', description:joke, type:'joke' };
  } else if(rec.type==='riddle'){
    const r = rand(EH.riddles);
    actionEl.textContent = 'Try a riddle. No peeking.';
    cardEl.textContent = r.q;
    $('recOpen')._riddle = r;
    $('recOpen')._url = null;
    $('recSave')._item = { id:'riddle-'+Date.now(), title:'Riddle', description:r.q, type:'riddle', answer:r.a };
  } else if(rec.type==='weirdFact'){
    const fact = rand(EH.weirdFacts);
    actionEl.textContent = 'Read one weird fact and find it alarming.';
    cardEl.textContent = fact;
    $('recOpen')._url = null;
    $('recSave')._item = { id:'fact-'+Date.now(), title:'Weird Fact', description:fact, type:'fact' };
  } else if(rec.type==='cute'){
    const prompt = rand(EH.cutePrompts);
    actionEl.textContent = 'Something cute to do right now.';
    cardEl.textContent = prompt;
    $('recOpen')._url = null;
    $('recSave')._item = { id:'cute-'+Date.now(), title:'Cute Prompt', description:prompt, type:'cute' };
  } else if(rec.type==='hack'){
    const hack = rand(EH.lifeHacks);
    actionEl.textContent = 'One life hack. Annoyingly effective.';
    cardEl.textContent = hack;
    $('recOpen')._url = null;
    $('recSave')._item = { id:'hack-'+Date.now(), title:'Life Hack', description:hack, type:'hack' };
  } else if(rec.type==='tinyTask'){
    const task = rand(EH.tinyTasks);
    actionEl.textContent = 'Do exactly one tiny thing.';
    cardEl.textContent = task;
    $('recOpen')._url = null;
    $('recSave')._item = { id:'task-'+Date.now(), title:'Tiny Task', description:task, type:'task' };
  } else if(rec.type==='script'){
    actionEl.textContent = "If you're avoiding a conversation, here is a script.";
    const s = rand(EH.scripts);
    cardEl.textContent = s.situation + ' → tap Open to read the full script.';
    $('recOpen')._script = s;
    $('recOpen')._url = null;
    $('recSave')._item = { id:s.id, title:s.title, description:s.situation, type:'script' };
  }

  $('recAnother')._pool = pool;
  $('recAnother')._mood = mood;
}

$('recOpen').addEventListener('click', function(){
  if(this._url){ window.open(this._url,'_blank','noopener'); showCharm('rabbit-hole'); }
  else if(this._riddle){ openRiddle(this._riddle); }
  else if(this._script){ openScript(this._script); }
  else { toast('Done? Excellent. That counted.'); showCharm('opened-thing'); }
});
$('recSave').addEventListener('click', function(){
  if(this._item) openShelfModal(this._item);
});
$('recAnother').addEventListener('click', function(){
  const pool=this._pool, mood=this._mood;
  if(!pool) return;
  currentRecIdx=(currentRecIdx+1)%pool.length;
  renderRecItem(pool[currentRecIdx], pool, mood);
});
$('recNope').addEventListener('click', function(){
  if(currentRecItem&&currentRecItem.type==='link'&&currentRecItem.id){
    if(!state.nopedItems.includes(currentRecItem.id)) state.nopedItems.push(currentRecItem.id);
    saveState();
  }
  toast('Noted. Showing less of that.');
  if(currentMood) showRec(currentMood);
});
$('recDidThing').addEventListener('click',()=>{
  toast('You did a thing. Annoying, but true. ✦');
  showCharm('opened-thing');
});

/* ── Brain Weather ── */
function renderWeatherGrid(){
  const grid=$('weatherGrid'); grid.innerHTML='';
  EH.brainWeather.forEach(w=>{
    const btn=document.createElement('button');
    btn.className='weather-btn'; btn.textContent=w;
    btn.addEventListener('click',()=>{
      document.querySelectorAll('.weather-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const info=EH.brainWeatherMap[w];
      const res=$('weatherResult');
      res.textContent = w+': '+info.desc;
      show(res);
      state.brainWeatherHistory.push({w,d:dateKey()}); saveState();
      // Switch mood to matching mood after brief delay
      setTimeout(()=>{
        if(info.moods&&info.moods.length){
          const mood=info.moods[0];
          const moodBtn=qs(`.mood-btn`);
          document.querySelectorAll('.mood-btn').forEach(b=>{ if(b.textContent===mood){ b.click(); } });
        }
      }, 800);
    });
    grid.appendChild(btn);
  });
}

/* ── I Can't Start ── */
let csStepIdx=0, csEasierMode=false;
function openCantStart(){
  csStepIdx=0; csEasierMode=false;
  show('overlayStart'); hide('csDoorWrap'); hide('csEnd');
  show('csStepWrap'); renderCSStep();
}
function renderCSStep(){
  const step=EH.cantStartSteps[csStepIdx];
  $('csStepText').textContent = csEasierMode ? step.easier : step.text;
}
$('btnCantStart').addEventListener('click',openCantStart);
$('closeStart').addEventListener('click',()=>hide('overlayStart'));
$('csNext').addEventListener('click',()=>{
  csEasierMode=false;
  csStepIdx++;
  if(csStepIdx>=EH.cantStartSteps.length){
    hide('csStepWrap'); show('csDoorWrap'); renderCSDoors();
  } else { renderCSStep(); }
});
$('csEasier').addEventListener('click',()=>{ csEasierMode=true; renderCSStep(); });
$('csSkip').addEventListener('click',()=>{
  csEasierMode=false; csStepIdx++;
  if(csStepIdx>=EH.cantStartSteps.length){ hide('csStepWrap'); show('csDoorWrap'); renderCSDoors(); }
  else renderCSStep();
});
function renderCSDoors(){
  const grid=$('csDoorGrid'); grid.innerHTML='';
  EH.cantStartDoors.forEach(d=>{
    const btn=document.createElement('button');
    btn.className='cs-door-btn'; btn.textContent=d;
    btn.addEventListener('click',()=>{
      hide('csDoorWrap'); show('csEnd');
      showCharm('tiny-exit');
      handleDoor(d);
    });
    grid.appendChild(btn);
  });
}
function handleDoor(door){
  if(door==='Cute'){ const p=rand(EH.cutePrompts); toast(p.slice(0,60)+'…'); }
  if(door==='Funny'){ const j=rand(EH.jokes); toast(j.slice(0,80)+'…'); }
  if(door==='Weird'){ window.open(EH.links.find(l=>l.id==='useless-web').url,'_blank','noopener'); }
  if(door==='Deep Dive'){ window.open(EH.links.find(l=>l.id==='atlas-obscura').url,'_blank','noopener'); }
  if(door==='Tiny Task'){ toast(rand(EH.tinyTasks)); }
}
$('csEndClose').addEventListener('click',()=>hide('overlayStart'));

/* ── Pick For Me ── */
let pfmHelp=null, pfmEnergy=null;
function openPickForMe(){
  pfmHelp=null; pfmEnergy=null;
  show('overlayPick'); show('pfmStep1'); hide('pfmStep2'); hide('pfmResult');
  renderPFMHelp();
}
function renderPFMHelp(){
  const grid=$('pfmHelpGrid'); grid.innerHTML='';
  EH.pickForMeHelp.forEach(h=>{
    const btn=document.createElement('button');
    btn.className='pfm-option'; btn.textContent=h;
    btn.addEventListener('click',()=>{
      pfmHelp=h;
      document.querySelectorAll('#pfmHelpGrid .pfm-option').forEach(b=>b.classList.remove('selected'));
      btn.classList.add('selected');
      setTimeout(()=>{ hide('pfmStep1'); show('pfmStep2'); renderPFMEnergy(); }, 200);
    });
    grid.appendChild(btn);
  });
}
function renderPFMEnergy(){
  const grid=$('pfmEnergyGrid'); grid.innerHTML='';
  EH.pickForMeEnergy.forEach(e=>{
    const btn=document.createElement('button');
    btn.className='pfm-option'; btn.textContent=e;
    btn.addEventListener('click',()=>{
      pfmEnergy=e;
      document.querySelectorAll('#pfmEnergyGrid .pfm-option').forEach(b=>b.classList.remove('selected'));
      btn.classList.add('selected');
      setTimeout(()=>{ hide('pfmStep2'); showPFMResult(); }, 200);
    });
    grid.appendChild(btn);
  });
}
function showPFMResult(){
  const key = pfmHelp+'+'+pfmEnergy;
  const rec = EH.pickForMe[key];
  show('pfmResult');
  if(rec){ $('pfmResultAction').textContent = rec.action; $('pfmResult')._rec=rec; }
  else $('pfmResultAction').textContent = 'Open the nearest calm thing and stay there for 2 minutes.';
}
$('btnDontThink').addEventListener('click',openPickForMe);
$('closePick').addEventListener('click',()=>hide('overlayPick'));
$('pfmGo').addEventListener('click',function(){
  const rec=$('pfmResult')._rec;
  if(!rec){ hide('overlayPick'); return; }
  hide('overlayPick');
  if(rec.contentType==='link'&&rec.id){
    const link=EH.links.find(l=>l.id===rec.id);
    if(link) window.open(link.url,'_blank','noopener');
  } else if(rec.contentType==='cantStart'){ openCantStart(); }
  else if(rec.contentType==='fieldTrip'){ openRandomFieldTrip(); }
  else if(rec.contentType==='weirdFact'){ toast(rand(EH.weirdFacts)); }
  else if(rec.contentType==='makeMeLaugh'){ toast(rand([...EH.jokes,...EH.fakeAwards])); }
  else if(rec.contentType==='tinyTask'){ toast(rand(EH.tinyTasks)); }
  showCharm('boredom-dodger');
});
$('pfmAnother').addEventListener('click',()=>{ pfmHelp=null; pfmEnergy=null; show('pfmStep1'); hide('pfmStep2'); hide('pfmResult'); renderPFMHelp(); });
$('pfmCloseDone').addEventListener('click',()=>hide('overlayPick'));

/* ── Cabinet ── */
let activeCat='All';
function renderCabinet(){
  renderCatFilters();
  renderCabinetCards();
}
function renderCatFilters(){
  const wrap=$('catFilters'); wrap.innerHTML='';
  EH.cabinetCategories.forEach(cat=>{
    const btn=document.createElement('button');
    btn.className='cat-btn'+(cat===activeCat?' active':''); btn.textContent=cat;
    btn.addEventListener('click',()=>{ activeCat=cat; renderCatFilters(); renderCabinetCards(); });
    wrap.appendChild(btn);
  });
}
function renderCabinetCards(){
  const grid=$('cabinetGrid'); grid.innerHTML='';
  const allCards=buildAllCards();
  const filtered = activeCat==='All' ? allCards : allCards.filter(c=>c.category===activeCat);
  if(!filtered.length){ grid.innerHTML='<div style="padding:24px;color:var(--text-light);font-size:.88rem">Nothing here yet. Try a different category.</div>'; return; }
  filtered.forEach(card=>{ grid.appendChild(buildCardEl(card)); });
}
function buildAllCards(){
  const cards=[];
  EH.links.forEach(l=>cards.push({...l, displayType:'link'}));
  EH.jokes.slice(0,5).forEach((j,i)=>cards.push({ id:'joke-'+i, title:'Joke #'+(i+1), description:j, category:'Funny', effort:'Bare Minimum', estimatedTime:'10 sec', displayType:'joke' }));
  EH.riddles.slice(0,5).forEach((r,i)=>cards.push({ id:'riddle-'+i, title:'Riddle #'+(i+1), description:r.q, answer:r.a, category:'Riddles', effort:'Bare Minimum', estimatedTime:'1 min', displayType:'riddle' }));
  EH.lifeHacks.slice(0,5).forEach((h,i)=>cards.push({ id:'hack-'+i, title:'Life Hack #'+(i+1), description:h, category:'Life Hacks', effort:'Bare Minimum', estimatedTime:'30 sec', displayType:'hack' }));
  EH.tinyTasks.slice(0,5).forEach((t,i)=>cards.push({ id:'task-'+i, title:'Tiny Task #'+(i+1), description:t, category:'Tiny Tasks', effort:'Bare Minimum', estimatedTime:'5 min', displayType:'task' }));
  EH.weirdFacts.slice(0,5).forEach((f,i)=>cards.push({ id:'fact-'+i, title:'Weird Fact #'+(i+1), description:f, category:'Weird Internet', effort:'Bare Minimum', estimatedTime:'10 sec', displayType:'fact' }));
  EH.scripts.forEach(s=>cards.push({ id:s.id, title:s.title, description:s.situation, category:'Scripts', effort:'Tiny', estimatedTime:'2 min', displayType:'script', _script:s }));
  EH.fieldTrips.forEach(ft=>cards.push({ id:ft.id, title:ft.title, description:ft.why, category:'Field Trips', effort:ft.effort, estimatedTime:ft.time, displayType:'fieldTrip', _trip:ft }));
  EH.cutePrompts.slice(0,3).forEach((p,i)=>cards.push({ id:'cute-'+i, title:'Cute Prompt #'+(i+1), description:p, category:'Cute', effort:'Bare Minimum', estimatedTime:'1 min', displayType:'cute' }));
  return cards;
}
function buildCardEl(card){
  const div=document.createElement('div');
  div.className='content-card';
  div.innerHTML=`
    <div class="card-type-tag">${card.category}</div>
    <div class="card-title">${card.title}</div>
    <div class="card-desc">${card.description}</div>
    <div class="card-meta">
      ${card.effort?`<span class="card-tag">${card.effort}</span>`:''}
      ${card.estimatedTime?`<span class="card-tag">${card.estimatedTime}</span>`:''}
    </div>
    <div class="card-actions"></div>
  `;
  const actions=div.querySelector('.card-actions');

  if(card.displayType==='link'&&card.url){
    const openBtn=document.createElement('button'); openBtn.className='btn-primary'; openBtn.textContent='Open';
    openBtn.addEventListener('click',()=>{ window.open(card.url,'_blank','noopener'); showCharm('rabbit-hole'); });
    actions.appendChild(openBtn);
  } else if(card.displayType==='riddle'){
    const revBtn=document.createElement('button'); revBtn.className='btn-primary'; revBtn.textContent='Open Riddle';
    revBtn.addEventListener('click',()=>openRiddle({ q:card.description, a:card.answer }));
    actions.appendChild(revBtn);
  } else if(card.displayType==='script'){
    const sBtn=document.createElement('button'); sBtn.className='btn-primary'; sBtn.textContent='View Script';
    sBtn.addEventListener('click',()=>openScript(card._script));
    actions.appendChild(sBtn);
  } else if(card.displayType==='fieldTrip'){
    const ftBtn=document.createElement('button'); ftBtn.className='btn-primary'; ftBtn.textContent='Details';
    ftBtn.addEventListener('click',()=>openFieldTrip(card._trip));
    actions.appendChild(ftBtn);
  }

  const saveBtn=document.createElement('button'); saveBtn.className='btn-ghost'; saveBtn.textContent='Save';
  saveBtn.addEventListener('click',()=>openShelfModal(card));
  actions.appendChild(saveBtn);

  const nopeBtn=document.createElement('button'); nopeBtn.className='btn-ghost nope'; nopeBtn.textContent='Nope';
  nopeBtn.addEventListener('click',()=>{
    if(!state.nopedItems.includes(card.id)) state.nopedItems.push(card.id);
    saveState(); div.style.opacity='.4'; div.style.pointerEvents='none';
    toast("Noped. We'll show less of that.");
  });
  actions.appendChild(nopeBtn);

  return div;
}

/* ── Saved ── */
let activeShelf='all';
function renderSaved(){
  renderShelfTabs();
  renderSavedCards();
  renderCharms();
}
function renderShelfTabs(){
  const wrap=$('shelfTabs'); wrap.innerHTML='';
  const tabs=['All Saved',...EH.savedShelves];
  tabs.forEach((shelf,i)=>{
    const btn=document.createElement('button');
    const key=i===0?'all':shelf;
    btn.className='shelf-tab'+(key===activeShelf?' active':''); btn.textContent=shelf;
    btn.addEventListener('click',()=>{ activeShelf=key; renderShelfTabs(); renderSavedCards(); });
    wrap.appendChild(btn);
  });
}
function renderSavedCards(){
  const grid=$('savedGrid'); grid.innerHTML='';
  const emptyEl=$('savedEmpty');
  let items = state.savedItems;
  if(activeShelf!=='all') items=items.filter(i=>i.shelves&&i.shelves.includes(activeShelf));
  if(!items.length){ show(emptyEl); return; }
  hide(emptyEl);
  items.slice().reverse().forEach(item=>{
    const card=document.createElement('div'); card.className='content-card';
    card.innerHTML=`
      <div class="card-type-tag">${item.type||'saved'}</div>
      <div class="card-title">${item.title}</div>
      <div class="card-desc">${item.description||''}</div>
      <div class="card-actions"></div>
    `;
    const actions=card.querySelector('.card-actions');
    if(item.url){
      const openBtn=document.createElement('button'); openBtn.className='btn-primary'; openBtn.textContent='Open';
      openBtn.addEventListener('click',()=>window.open(item.url,'_blank','noopener'));
      actions.appendChild(openBtn);
    }
    if(item.type==='riddle'&&item.answer){
      const rBtn=document.createElement('button'); rBtn.className='btn-primary'; rBtn.textContent='View Riddle';
      rBtn.addEventListener('click',()=>openRiddle({ q:item.description, a:item.answer }));
      actions.appendChild(rBtn);
    }
    if(item.type==='script'&&item._script){
      const sBtn=document.createElement('button'); sBtn.className='btn-primary'; sBtn.textContent='View Script';
      sBtn.addEventListener('click',()=>openScript(item._script));
      actions.appendChild(sBtn);
    }
    const rmBtn=document.createElement('button'); rmBtn.className='btn-ghost nope'; rmBtn.textContent='Remove';
    rmBtn.addEventListener('click',()=>{
      state.savedItems=state.savedItems.filter(i=>i.id!==item.id); saveState(); renderSaved();
    });
    actions.appendChild(rmBtn);
    grid.appendChild(card);
  });
}
function renderCharms(){
  const grid=$('charmsGrid'), emptyEl=$('charmsEmpty');
  grid.innerHTML='';
  if(!state.charms.length){ show(emptyEl); return; }
  hide(emptyEl);
  state.charms.forEach(cid=>{
    const charm=EH.charms.find(c=>c.id===cid);
    if(!charm) return;
    const el=document.createElement('div'); el.className='charm';
    el.innerHTML=`<span class="charm-icon">${charm.icon}</span><span>${charm.label}</span>`;
    grid.appendChild(el);
  });
}

/* ── Save to Shelf Modal ── */
let shelfPendingItem=null, shelfSelected=new Set();
function openShelfModal(item){
  shelfPendingItem=item; shelfSelected=new Set();
  const list=$('shelfList'); list.innerHTML='';
  EH.savedShelves.forEach(shelf=>{
    const btn=document.createElement('button');
    btn.className='shelf-option'; btn.innerHTML=`<span class="shelf-option-check"></span><span>${shelf}</span>`;
    btn.addEventListener('click',()=>{
      if(shelfSelected.has(shelf)){ shelfSelected.delete(shelf); btn.classList.remove('selected'); }
      else { shelfSelected.add(shelf); btn.classList.add('selected'); }
    });
    list.appendChild(btn);
  });
  show('overlayShelf');
}
$('closeShelf').addEventListener('click',()=>hide('overlayShelf'));
$('shelfSaveConfirm').addEventListener('click',()=>{
  if(!shelfPendingItem) return;
  const existing=state.savedItems.find(i=>i.id===shelfPendingItem.id);
  if(existing){ existing.shelves=[...new Set([...(existing.shelves||[]),...shelfSelected])]; }
  else { state.savedItems.push({...shelfPendingItem, shelves:[...shelfSelected]}); }
  saveState(); hide('overlayShelf');
  toast('Saved ✦'); showCharm('opened-thing');
});

/* ── Riddle Modal ── */
let currentRiddle=null;
function openRiddle(riddle){
  currentRiddle = riddle || rand(EH.riddles);
  $('riddleQ').textContent=currentRiddle.q;
  $('riddleA').textContent=currentRiddle.a;
  hide('riddleA'); $('riddleReveal').textContent='Tap to reveal';
  show('overlayRiddle');
}
$('closeRiddle').addEventListener('click',()=>hide('overlayRiddle'));
$('riddleReveal').addEventListener('click',()=>{ show('riddleA'); $('riddleReveal').textContent='There it is.'; });
$('riddleAnother').addEventListener('click',()=>openRiddle(null));
$('riddleClose').addEventListener('click',()=>hide('overlayRiddle'));

/* ── Script Modal ── */
function openScript(script){
  if(!script) return;
  $('scriptSituation').textContent=script.situation;
  $('scriptTitle').textContent=script.title;
  $('scriptText').textContent=script.script;
  $('scriptSofter').textContent=script.softer;
  $('scriptFirmer').textContent=script.firmer;
  $('scriptCopy')._text=script.script;
  $('scriptSave')._item={ id:script.id, title:script.title, description:script.situation, type:'script', _script:script };
  show('overlayScript');
}
$('closeScript').addEventListener('click',()=>hide('overlayScript'));
$('scriptCopy').addEventListener('click',function(){ copyToClipboard(this._text); });
$('scriptSave').addEventListener('click',function(){ if(this._item) openShelfModal(this._item); });

/* ── Field Trip Modal ── */
let currentTrip=null;
function openFieldTrip(trip){
  currentTrip=trip;
  $('tripTitle').textContent=trip.title;
  $('tripWhy').textContent=trip.why;
  $('tripMission').textContent=trip.mission;
  $('tripMeta').innerHTML=`<span class="trip-meta-tag">${trip.effort}</span><span class="trip-meta-tag">${trip.time}</span><span class="trip-meta-tag">${trip.budget}</span><span class="trip-meta-tag">${trip.social}</span>`;
  show('overlayTrip');
}
function openRandomFieldTrip(){
  const noped=state.nopedItems;
  const pool=EH.fieldTrips.filter(ft=>!noped.includes(ft.id));
  openFieldTrip(pool.length ? rand(pool) : rand(EH.fieldTrips));
}
$('closeTrip').addEventListener('click',()=>hide('overlayTrip'));
$('tripGo').addEventListener('click',()=>{ hide('overlayTrip'); showCharm('requires-shoes'); toast('Mission accepted. Shoes on.'); });
$('tripSave').addEventListener('click',()=>{ if(currentTrip) openShelfModal({ id:currentTrip.id, title:currentTrip.title, description:currentTrip.why, type:'fieldTrip', effort:currentTrip.effort, _trip:currentTrip }); });
$('tripAnother').addEventListener('click',()=>{ hide('overlayTrip'); openRandomFieldTrip(); });

/* ── Dismiss overlays on backdrop click ── */
['overlayStart','overlayPick','overlayShelf','overlayScript','overlayTrip','overlayRiddle'].forEach(id=>{
  const el=$(id);
  if(el) el.addEventListener('click',e=>{ if(e.target===el) hide(el); });
});

/* ── Init ── */
function init(){
  renderDailyDoor();
  renderMoodGrid();
  renderWeatherGrid();
}
init();
