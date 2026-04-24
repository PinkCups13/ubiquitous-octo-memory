// ── State ─────────────────────────────────────────────────────────────────────
const state = {
  steps:       loadSteps(),
  goals:       loadGoals(),
  prevUnlocked: new Set()
};

// Toast queue — prevents overlapping celebrations
let toastQueue    = [];
let toastBusy     = false;
let toastTimer    = null;

// ── Storage ───────────────────────────────────────────────────────────────────
function loadSteps() {
  return Math.max(0, parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10));
}
function saveSteps() {
  localStorage.setItem(STORAGE_KEY, String(state.steps));
}
function loadGoals() {
  const n = parseInt(localStorage.getItem(GOALS_KEY) || '0', 10);
  return { totalSteps: n > 0 ? n : DEFAULT_GOAL_STEPS };
}
function saveGoals() {
  localStorage.setItem(GOALS_KEY, String(state.goals.totalSteps));
}

// ── Unlock logic ──────────────────────────────────────────────────────────────
function getStopTarget(index) {
  return Math.round(state.goals.totalSteps * (index + 1) / STOPS.length);
}
function stopUnlocked(index) {
  return state.steps >= getStopTarget(index);
}
function getUnlockedCount() {
  return STOPS.filter((_, i) => stopUnlocked(i)).length;
}

// ── Progress ──────────────────────────────────────────────────────────────────
function getProgressFraction() {
  return Math.min(1, state.steps / Math.max(1, state.goals.totalSteps));
}
function getTotalMiles() {
  return +(getProgressFraction() * ROUTE_TOTAL_MILES).toFixed(1);
}
function getPercentComplete() {
  return Math.min(100, Math.round(getProgressFraction() * 100));
}

// ── SVG helpers ───────────────────────────────────────────────────────────────
function buildSmoothPath(points) {
  if (!points.length) return '';
  let d = `M ${points[0][0]},${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const [cx, cy] = points[i], [nx, ny] = points[i + 1];
    const mx = (cx + nx) / 2;
    d += ` C ${mx},${cy} ${mx},${ny} ${nx},${ny}`;
  }
  return d;
}

function routePointAtFraction(fraction) {
  const n   = ROUTE_POINTS.length - 1;
  const pos = Math.min(fraction * n, n);
  const idx = Math.min(Math.floor(pos), n - 1);
  const t   = pos - idx;
  const [x1, y1] = ROUTE_POINTS[idx];
  const [x2, y2] = ROUTE_POINTS[idx + 1] || ROUTE_POINTS[idx];
  return [x1 + t * (x2 - x1), y1 + t * (y2 - y1)];
}

function buildProgressPath(fraction) {
  const n   = ROUTE_POINTS.length - 1;
  const pos = Math.min(fraction * n, n);
  const idx = Math.min(Math.floor(pos), n - 1);
  const t   = pos - idx;
  const pts = [...ROUTE_POINTS.slice(0, idx + 1)];
  const [x1, y1] = ROUTE_POINTS[idx];
  const [x2, y2] = ROUTE_POINTS[idx + 1] || ROUTE_POINTS[idx];
  const end = [x1 + t * (x2 - x1), y1 + t * (y2 - y1)];
  const last = pts[pts.length - 1];
  if (!last || last[0] !== end[0] || last[1] !== end[1]) pts.push(end);
  return buildSmoothPath(pts);
}

function svgNode(tag, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  return el;
}

// ── DOM refs ──────────────────────────────────────────────────────────────────
const heroMiles       = document.getElementById('heroMiles');
const heroSteps       = document.getElementById('heroSteps');
const heroUnlocked    = document.getElementById('heroUnlocked');
const snapshotHelper  = document.getElementById('snapshotHelper');
const quickLogHelper  = document.getElementById('quickLogHelper');
const progressChip    = document.getElementById('progressChip');
const progressBarFill = document.getElementById('progressBarFill');
const mapDate         = document.getElementById('mapDate');
const currentGoalLine = document.getElementById('currentGoalLine');

const routeBase     = document.getElementById('routeBase');
const routeHalo     = document.getElementById('routeHalo');
const routeProgress = document.getElementById('routeProgress');
const routeMarkers  = document.getElementById('routeMarkers');
const youMarker     = document.getElementById('youMarker');

const stepsInput          = document.getElementById('stepsInput');
const logButton           = document.getElementById('logButton');
const goalStepsInput      = document.getElementById('goalStepsInput');
const saveGoalsButton     = document.getElementById('saveGoalsButton');
const resetProgressButton = document.getElementById('resetProgressButton');
const stopsWrap           = document.getElementById('stopsWrap');

const toast            = document.getElementById('toast');
const modalBg          = document.getElementById('modalBg');
const modalImage       = document.getElementById('modalImage');
const modalFallback    = document.getElementById('modalFallback');
const modalEyebrow     = document.getElementById('modalEyebrow');
const modalTitle       = document.getElementById('modalTitle');
const modalText        = document.getElementById('modalText');
const closeModalButton = document.getElementById('closeModalButton');

// ── Render ────────────────────────────────────────────────────────────────────
function renderHome() {
  const pct      = getPercentComplete();
  const miles    = getTotalMiles();
  const unlocked = getUnlockedCount();

  heroMiles.textContent    = miles;
  heroSteps.textContent    = state.steps.toLocaleString();
  heroUnlocked.textContent = `${unlocked}/6`;

  progressBarFill.style.width = `${pct}%`;
  progressChip.textContent    = `${pct}% · ${unlocked}/6 stops`;

  const goalK = (state.goals.totalSteps / 1000).toFixed(0);
  snapshotHelper.textContent = pct < 100
    ? `${pct}% complete · ${state.steps.toLocaleString()} of ${state.goals.totalSteps.toLocaleString()} steps`
    : `Quest complete · ${state.steps.toLocaleString()} steps · ${miles} miles`;

  quickLogHelper.textContent = state.goals.totalSteps === DEFAULT_GOAL_STEPS && !localStorage.getItem(GOALS_KEY)
    ? 'Set a step goal on the Goals screen first.'
    : `Goal: ${state.goals.totalSteps.toLocaleString()} steps total.`;
}

function renderGoals() {
  goalStepsInput.value = state.goals.totalSteps;
  currentGoalLine.textContent = `Current goal: ${state.goals.totalSteps.toLocaleString()} steps`;
}

function renderRoute() {
  const frac     = getProgressFraction();
  const fullPath = buildSmoothPath(ROUTE_POINTS);
  const progPath = buildProgressPath(frac);

  routeBase.setAttribute('d', fullPath);
  routeHalo.setAttribute('d', progPath);
  routeProgress.setAttribute('d', progPath);
  routeMarkers.innerHTML = '';

  STOPS.forEach((stop, i) => {
    const [x, y]   = ROUTE_POINTS[i + 1];
    const unlocked = stopUnlocked(i);
    const g        = svgNode('g', { transform: `translate(${x},${y})` });

    g.appendChild(svgNode('circle', {
      r: '17',
      fill:           unlocked ? 'rgba(255,252,254,.98)' : 'rgba(248,238,244,.95)',
      stroke:         unlocked ? '#c07890' : '#d0b0c0',
      'stroke-width': unlocked ? '2.2' : '1.4'
    }));

    const icon = svgNode('text', { 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': '11' });
    icon.textContent = stop.emoji;

    const lbl = svgNode('text', { 'text-anchor': 'middle', y: '32', class: 'routeLabel' });
    lbl.textContent = stop.short;

    g.append(icon, lbl);
    routeMarkers.appendChild(g);
  });

  const [x, y] = routePointAtFraction(frac);
  youMarker.setAttribute('transform', `translate(${x},${y})`);
}

function renderStops() {
  stopsWrap.innerHTML = STOPS.map((stop, i) => {
    const unlocked  = stopUnlocked(i);
    const target    = getStopTarget(i).toLocaleString();
    const sizeClass = i === 0 || i === 4 ? 'large' : i === 2 ? 'tall' : '';
    return `
      <article class="tile ${sizeClass} ${unlocked ? 'unlocked' : 'locked'}">
        <div class="tileFallback" style="background:${stop.fallback}">${stop.name}</div>
        <img src="${stop.image}" alt="${stop.name}" onload="this.style.opacity=1" onerror="this.style.display='none'">
        <div class="tileContent">
          <div class="tileTop">
            <div class="tileMiles">${target} steps · stop ${String(stop.id).padStart(2, '0')}</div>
            <div class="tileStatus">${unlocked ? 'Unlocked' : 'Locked'}</div>
          </div>
          <div class="tileTitle">${stop.name}</div>
          <div class="tileNote">${stop.note}</div>
          <button class="tileBtn" data-postcard="${stop.id}" ${unlocked ? '' : 'disabled'}>View postcard</button>
        </div>
      </article>`;
  }).join('');
}

function renderAll() {
  renderHome();
  renderGoals();
  renderRoute();
  renderStops();
}

// ── Toast queue ───────────────────────────────────────────────────────────────
function queueToast(message) {
  toastQueue.push(message);
  if (!toastBusy) drainToastQueue();
}

function drainToastQueue() {
  if (!toastQueue.length) { toastBusy = false; return; }
  toastBusy = true;
  toast.textContent = toastQueue.shift();
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(drainToastQueue, 320);
  }, 2600);
}

// ── Celebrations ──────────────────────────────────────────────────────────────
function checkCelebrations(prevSteps) {
  const now = state.steps;
  STOPS.forEach((stop, i) => {
    const target = getStopTarget(i);
    if (prevSteps < target && now >= target) {
      queueToast(`Photo unlocked: ${stop.name}`);
    }
  });
  if (prevSteps < state.goals.totalSteps && now >= state.goals.totalSteps) {
    queueToast('Quest complete.');
  }
}

// ── Actions ───────────────────────────────────────────────────────────────────
function logSteps() {
  const n = parseInt(stepsInput.value, 10);
  if (!n || n < 1) { queueToast('Enter a real step count.'); return; }
  const prev   = state.steps;
  state.steps += n;
  saveSteps();
  stepsInput.value = '';
  renderAll();
  queueToast(`${n.toLocaleString()} steps added.`);
  checkCelebrations(prev);
}

function saveGoalsAction() {
  const n = parseInt(goalStepsInput.value, 10);
  if (!n || n < 1) { queueToast('Enter a real step count.'); return; }
  state.goals.totalSteps = n;
  saveGoals();
  renderAll();
  queueToast('Goal set.');
}

function resetProgress() {
  state.steps = 0;
  saveSteps();
  renderAll();
  queueToast('Quest reset.');
}

// ── Postcard modal ────────────────────────────────────────────────────────────
function openPostcard(id) {
  const idx  = STOPS.findIndex(s => s.id === Number(id));
  const stop = STOPS[idx];
  if (!stop || !stopUnlocked(idx)) return;

  modalEyebrow.textContent      = `Stop ${stop.id} of ${STOPS.length} · photo unlocked`;
  modalTitle.textContent        = stop.name;
  modalText.innerHTML           = `<strong>${stop.souvenir}</strong><br>${stop.note}<br><span style="display:inline-block;margin-top:8px;font-size:.78rem;color:#6b5060;">Photo source: Wikimedia Commons</span>`;
  modalFallback.textContent     = stop.name;
  modalFallback.style.background = stop.fallback;
  modalImage.classList.remove('loaded');
  modalImage.style.display = '';
  modalImage.alt   = stop.name;
  modalImage.onload  = () => modalImage.classList.add('loaded');
  modalImage.onerror = () => { modalImage.style.display = 'none'; };
  modalImage.src = stop.image;
  modalBg.classList.add('show');
  modalBg.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  modalBg.classList.remove('show');
  modalBg.setAttribute('aria-hidden', 'true');
}

// ── Navigation ────────────────────────────────────────────────────────────────
function switchScreen(name) {
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.toggle('active', s.id === `screen-${name}`);
  });
  document.querySelectorAll('.navBtn').forEach(b => {
    b.classList.toggle('active', b.dataset.screen === name);
  });
}

// ── Init ──────────────────────────────────────────────────────────────────────
function init() {
  mapDate.textContent = new Date().toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
  });

  renderAll();

  logButton.addEventListener('click', logSteps);
  saveGoalsButton.addEventListener('click', saveGoalsAction);
  resetProgressButton.addEventListener('click', resetProgress);
  stepsInput.addEventListener('keydown', e => { if (e.key === 'Enter') logSteps(); });

  document.addEventListener('click', e => {
    const pid = e.target.getAttribute('data-postcard');
    if (pid) openPostcard(pid);
    const nav = e.target.closest('.navBtn');
    if (nav) switchScreen(nav.dataset.screen);
  });

  closeModalButton.addEventListener('click', closeModal);
  modalBg.addEventListener('click', e => { if (e.target === modalBg) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
}

document.addEventListener('DOMContentLoaded', init);
