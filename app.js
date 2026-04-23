const state = {
  log: loadLog(),
  goals: loadGoals(),
  journal: loadJournal(),
  toastTimer: null,
  unlockedIds: new Set()
};

const heroMiles = document.getElementById('heroMiles');
const heroSteps = document.getElementById('heroSteps');
const heroUnlocked = document.getElementById('heroUnlocked');
const snapshotHelper = document.getElementById('snapshotHelper');
const quickLogHelper = document.getElementById('quickLogHelper');
const mapDate = document.getElementById('mapDate');

const routeBase = document.getElementById('routeBase');
const routeHalo = document.getElementById('routeHalo');
const routeProgress = document.getElementById('routeProgress');
const routeMarkers = document.getElementById('routeMarkers');
const youMarker = document.getElementById('youMarker');
const routeStatLine = document.getElementById('routeStatLine');

const dateInput = document.getElementById('dateInput');
const stepsInput = document.getElementById('stepsInput');
const logButton = document.getElementById('logButton');

const dailyGoalInput = document.getElementById('dailyGoalInput');
const mileGoalInput = document.getElementById('mileGoalInput');
const saveGoalsButton = document.getElementById('saveGoalsButton');
const resetProgressButton = document.getElementById('resetProgressButton');

const stopsWrap = document.getElementById('stopsWrap');
const logBody = document.getElementById('logBody');

const journalPromptText = document.getElementById('journalPromptText');
const journalText = document.getElementById('journalText');
const saveJournalButton = document.getElementById('saveJournalButton');
const savedEntryCard = document.getElementById('savedEntryCard');
const savedEntryText = document.getElementById('savedEntryText');

const toast = document.getElementById('toast');
const modalBg = document.getElementById('modalBg');
const modalImage = document.getElementById('modalImage');
const modalFallback = document.getElementById('modalFallback');
const modalEyebrow = document.getElementById('modalEyebrow');
const modalTitle = document.getElementById('modalTitle');
const modalText = document.getElementById('modalText');
const closeModalButton = document.getElementById('closeModalButton');

function loadLog(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch { return []; }
}
function saveLog(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state.log)); }

function loadGoals(){
  try{
    const raw = localStorage.getItem(GOALS_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return {
      dailySteps: Number(parsed?.dailySteps) > 0 ? Number(parsed.dailySteps) : DEFAULT_DAILY_GOAL,
      mileGoal: Number(parsed?.mileGoal) > 0 ? Number(parsed.mileGoal) : DEFAULT_MILE_GOAL
    };
  } catch {
    return { dailySteps: DEFAULT_DAILY_GOAL, mileGoal: DEFAULT_MILE_GOAL };
  }
}
function saveGoals(){ localStorage.setItem(GOALS_KEY, JSON.stringify(state.goals)); }

function loadJournal(){
  try{
    const raw = localStorage.getItem(JOURNAL_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch { return {}; }
}
function saveJournal(){ localStorage.setItem(JOURNAL_KEY, JSON.stringify(state.journal)); }

function todayKey(){ return new Date().toISOString().split('T')[0]; }
function getPromptForToday(){
  const d = new Date();
  const index = (d.getFullYear() * 372 + (d.getMonth()+1) * 31 + d.getDate()) % JOURNAL_PROMPTS.length;
  return JOURNAL_PROMPTS[index];
}
function getTotalSteps(){ return state.log.reduce((sum, e) => sum + Number(e.steps || 0), 0); }
function getTotalMiles(){ return +(getTotalSteps() / STEPS_PER_MILE).toFixed(2); }
function getUnlockedStops(){ const m = getTotalMiles(); return STOPS.filter(s => m >= s.miles); }
function getPercentComplete(){
  const goal = Math.max(0.1, state.goals.mileGoal);
  return Math.min(100, Math.round((getTotalMiles() / goal) * 100));
}

function buildSmoothPath(points){
  if(!points.length) return '';
  let path = `M ${points[0][0]},${points[0][1]}`;
  for(let i=0;i<points.length-1;i++){
    const current = points[i], next = points[i+1];
    const midX = (current[0] + next[0]) / 2;
    path += ` C ${midX},${current[1]} ${midX},${next[1]} ${next[0]},${next[1]}`;
  }
  return path;
}

function interpolatePoint(miles){
  const goalCap = Math.max(...ROUTE_MILES);
  const clamped = Math.max(0, Math.min(miles, goalCap));
  for(let i=0;i<ROUTE_MILES.length-1;i++){
    if(clamped >= ROUTE_MILES[i] && clamped <= ROUTE_MILES[i+1]){
      const ratio = (clamped - ROUTE_MILES[i]) / (ROUTE_MILES[i+1] - ROUTE_MILES[i]);
      const x = ROUTE_POINTS[i][0] + ratio * (ROUTE_POINTS[i+1][0] - ROUTE_POINTS[i][0]);
      const y = ROUTE_POINTS[i][1] + ratio * (ROUTE_POINTS[i+1][1] - ROUTE_POINTS[i][1]);
      return [x,y];
    }
  }
  return ROUTE_POINTS[ROUTE_POINTS.length-1];
}

function buildProgressPath(miles){
  const goalCap = Math.max(...ROUTE_MILES);
  const clamped = Math.max(0, Math.min(miles, goalCap));
  let segment = 0;
  for(let i=0;i<ROUTE_MILES.length-1;i++){
    if(clamped <= ROUTE_MILES[i+1]){ segment = i; break; }
    segment = i + 1;
  }
  const points = [...ROUTE_POINTS.slice(0, segment+1)];
  const endPoint = interpolatePoint(clamped);
  const last = points[points.length-1];
  if(!last || last[0] !== endPoint[0] || last[1] !== endPoint[1]) points.push(endPoint);
  return buildSmoothPath(points);
}

function createSvgNode(tag, attrs={}){
  const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
  Object.entries(attrs).forEach(([k,v]) => node.setAttribute(k,v));
  return node;
}

function renderHome(){
  const steps = getTotalSteps();
  const miles = getTotalMiles();
  const unlocked = getUnlockedStops().length;
  const pct = getPercentComplete();

  heroMiles.textContent = miles;
  heroSteps.textContent = steps.toLocaleString();
  heroUnlocked.textContent = `${unlocked}/10`;
  snapshotHelper.textContent = `${pct}% complete · ${steps.toLocaleString()} total steps · ${state.goals.mileGoal} mile goal`;

  const selectedDate = dateInput.value || todayKey();
  const existing = state.log.find(entry => entry.date === selectedDate);
  if(existing){
    quickLogHelper.textContent = `Selected day already has ${Number(existing.steps).toLocaleString()} steps logged.`;
  } else {
    quickLogHelper.textContent = `Daily goal: ${state.goals.dailySteps.toLocaleString()} steps.`;
  }
}

function renderGoals(){
  dailyGoalInput.value = state.goals.dailySteps;
  mileGoalInput.value = state.goals.mileGoal;
}

function renderRoutePreview(){
  const miles = getTotalMiles();
  const fullPath = buildSmoothPath(ROUTE_POINTS);
  const progressPath = buildProgressPath(miles);
  routeBase.setAttribute('d', fullPath);
  routeHalo.setAttribute('d', progressPath);
  routeProgress.setAttribute('d', progressPath);
  routeMarkers.innerHTML = '';

  STOPS.forEach((stop, index) => {
    const [x, y] = ROUTE_POINTS[index + 1];
    const unlocked = miles >= stop.miles;
    const g = createSvgNode('g', { transform: `translate(${x},${y})` });

    const circle = createSvgNode('circle', {
      r:'18',
      fill: unlocked ? 'rgba(255,252,253,.98)' : 'rgba(247,238,242,.95)',
      stroke: unlocked ? '#d47d9b' : '#d8bfca',
      'stroke-width': unlocked ? '2.2' : '1.5'
    });
    const icon = createSvgNode('text', {
      'text-anchor':'middle',
      'dominant-baseline':'central',
      'font-size':'12'
    });
    icon.textContent = stop.emoji || String(stop.id);

    const milesText = createSvgNode('text', {
      'text-anchor':'middle',
      y:'31',
      'font-family':'Plus Jakarta Sans, sans-serif',
      'font-size':'8.6',
      'font-weight':'700',
      fill: unlocked ? '#9f5570' : '#9f7b8d'
    });
    milesText.textContent = `${stop.miles} mi`;

    const label = createSvgNode('text', {
      'text-anchor':'middle',
      y:'48',
      'class':'routeLabel'
    });
    label.textContent = stop.short || stop.name;

    g.append(circle, icon, milesText, label);
    routeMarkers.appendChild(g);
  });

  const [x, y] = interpolatePoint(miles);
  youMarker.setAttribute('transform', `translate(${x},${y})`);

  routeStatLine.innerHTML = `<strong>${miles.toFixed(2)} miles</strong> travelled · <strong>${getTotalSteps().toLocaleString()}</strong> steps logged · <strong>${getUnlockedStops().length}/10</strong> stops unlocked`;
}

function renderStops(){
  const miles = getTotalMiles();
  const nowUnlocked = new Set(getUnlockedStops().map(stop => stop.id));
  for(const id of nowUnlocked){
    if(!state.unlockedIds.has(id)){
      const stop = STOPS.find(s => s.id === id);
      if(stop) showToast(`Unlocked: ${stop.name}`);
    }
  }
  state.unlockedIds = nowUnlocked;

  stopsWrap.innerHTML = STOPS.map((stop, index) => {
    const unlocked = miles >= stop.miles;
    const sizeClass = index === 0 || index === 5 || index === 9 ? 'large' : (index === 2 || index === 7 ? 'tall' : '');
    return `
      <article class="tile ${sizeClass} ${unlocked ? 'unlocked' : 'locked'}">
        <div class="tileFallback" style="background:${stop.fallback}">${stop.name}</div>
        <img src="${stop.image}" alt="${stop.name}" onload="this.style.opacity=1" onerror="this.style.display='none'">
        <div class="tileContent">
          <div class="tileTop">
            <div class="tileMiles">${stop.miles} miles · stop ${String(stop.id).padStart(2,'0')}</div>
            <div class="tileStatus">${unlocked ? 'Unlocked' : 'Locked'}</div>
          </div>
          <div class="tileTitle">${stop.name}</div>
          <div class="tileNote">${stop.note}</div>
          <button class="tileBtn" data-postcard="${stop.id}" ${unlocked ? '' : 'disabled'}>View postcard</button>
        </div>
      </article>
    `;
  }).join('');
}

function renderJournal(){
  const today = todayKey();
  journalPromptText.textContent = getPromptForToday();
  journalText.value = state.journal[today] || '';
  if(state.journal[today]){
    savedEntryCard.style.display = '';
    savedEntryText.textContent = state.journal[today];
  } else {
    savedEntryCard.style.display = 'none';
    savedEntryText.textContent = '';
  }

  if(!state.log.length){
    logBody.innerHTML = '<div class="journalEntry"><div class="journalDate">No entries yet</div><div class="journalSteps">Start the quest</div><div class="journalMiles">0.00 mi</div><div></div></div>';
    return;
  }
  logBody.innerHTML = state.log.map(entry => `
    <div class="journalEntry">
      <div class="journalDate">${entry.date}</div>
      <div class="journalSteps">${Number(entry.steps).toLocaleString()} steps</div>
      <div class="journalMiles">${(Number(entry.steps)/STEPS_PER_MILE).toFixed(2)} mi</div>
      <button class="deleteBtn" aria-label="Delete ${entry.date}" data-delete="${entry.date}">×</button>
    </div>
  `).join('');
}

function renderAll(){
  renderHome();
  renderGoals();
  renderRoutePreview();
  renderStops();
  renderJournal();
}

function logSteps(){
  const date = dateInput.value;
  const steps = Number.parseInt(stepsInput.value, 10);
  if(!date || !steps || steps < 1){
    showToast('Enter a date and a real step count.');
    return;
  }
  const existing = state.log.find(entry => entry.date === date);
  if(existing) existing.steps += steps;
  else state.log.push({date, steps});
  state.log.sort((a,b) => b.date.localeCompare(a.date));
  saveLog();
  stepsInput.value = '';
  renderAll();
  showToast(`Logged ${steps.toLocaleString()} steps.`);
}

function saveGoalsAction(){
  const dailySteps = Number.parseInt(dailyGoalInput.value, 10);
  const mileGoal = Number.parseFloat(mileGoalInput.value);
  if(!dailySteps || dailySteps < 1 || !mileGoal || mileGoal <= 0){
    showToast('Enter real goal numbers.');
    return;
  }
  state.goals.dailySteps = dailySteps;
  state.goals.mileGoal = +mileGoal.toFixed(1).replace(/\.0$/, '');
  saveGoals();
  renderAll();
  showToast('Goals saved.');
}

function resetProgress(){
  state.log = [];
  state.journal = {};
  saveLog();
  saveJournal();
  renderAll();
  showToast('Progress reset.');
}

function saveJournalEntry(){
  const text = journalText.value.trim();
  const today = todayKey();
  if(!text){
    delete state.journal[today];
    saveJournal();
    renderJournal();
    showToast('Today’s journal entry cleared.');
    return;
  }
  state.journal[today] = text;
  saveJournal();
  renderJournal();
  showToast('Journal entry saved.');
}

function deleteEntry(date){
  state.log = state.log.filter(entry => entry.date !== date);
  saveLog();
  renderAll();
  showToast('Entry removed. Order restored.');
}

function openPostcard(id){
  const stop = STOPS.find(s => s.id === Number(id));
  if(!stop) return;
  modalEyebrow.textContent = `${stop.miles} miles · real landmark postcard`;
  modalTitle.textContent = stop.name;
  modalText.innerHTML = `<strong>${stop.souvenir}</strong><br>${stop.note}<br><span style="display:inline-block;margin-top:8px;font-size:.8rem;color:#7d5f6c;">Photo source: Wikimedia Commons</span>`;
  modalFallback.textContent = stop.name;
  modalFallback.style.background = stop.fallback;
  modalImage.classList.remove('loaded');
  modalImage.style.display = '';
  modalImage.alt = stop.name;
  modalImage.onload = () => modalImage.classList.add('loaded');
  modalImage.onerror = () => { modalImage.style.display = 'none'; };
  modalImage.src = stop.image;
  modalBg.classList.add('show');
  modalBg.setAttribute('aria-hidden', 'false');
}

function closeModal(){
  modalBg.classList.remove('show');
  modalBg.setAttribute('aria-hidden', 'true');
}

function showToast(message){
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

function switchScreen(name){
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.toggle('active', screen.id === `screen-${name}`);
  });
  document.querySelectorAll('.navBtn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.screen === name);
  });
}

function init(){
  const today = new Date();
  dateInput.value = today.toISOString().split('T')[0];
  mapDate.textContent = today.toLocaleDateString('en-US', {weekday:'short', month:'short', day:'numeric', year:'numeric'});
  state.unlockedIds = new Set(getUnlockedStops().map(stop => stop.id));
  renderAll();

  logButton.addEventListener('click', logSteps);
  saveGoalsButton.addEventListener('click', saveGoalsAction);
  resetProgressButton.addEventListener('click', resetProgress);
  saveJournalButton.addEventListener('click', saveJournalEntry);

  stepsInput.addEventListener('keydown', event => { if(event.key === 'Enter') logSteps(); });

  document.addEventListener('click', event => {
    const deleteDate = event.target.getAttribute('data-delete');
    if(deleteDate) deleteEntry(deleteDate);
    const postcardId = event.target.getAttribute('data-postcard');
    if(postcardId) openPostcard(postcardId);
    const nav = event.target.closest('.navBtn');
    if(nav) switchScreen(nav.dataset.screen);
  });

  closeModalButton.addEventListener('click', closeModal);
  modalBg.addEventListener('click', event => { if(event.target === modalBg) closeModal(); });
  document.addEventListener('keydown', event => { if(event.key === 'Escape') closeModal(); });
}

document.addEventListener('DOMContentLoaded', init);
