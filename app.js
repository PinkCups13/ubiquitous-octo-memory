const state = {
  log:             loadLog(),
  goals:           loadGoals(),
  toastTimer:      null,
  unlockedIds:     new Set(),
  completionShown: !!localStorage.getItem(COMPLETION_KEY)
};

// ── DOM refs ──────────────────────────────────────────────────────────────────
const heroMiles      = document.getElementById('heroMiles');
const heroSteps      = document.getElementById('heroSteps');
const heroUnlocked   = document.getElementById('heroUnlocked');
const snapshotHelper = document.getElementById('snapshotHelper');
const quickLogHelper = document.getElementById('quickLogHelper');
const mapDate        = document.getElementById('mapDate');

const routeBase      = document.getElementById('routeBase');
const routeHalo      = document.getElementById('routeHalo');
const routeProgress  = document.getElementById('routeProgress');
const routeMarkers   = document.getElementById('routeMarkers');
const youMarker      = document.getElementById('youMarker');
const routeStatLine  = document.getElementById('routeStatLine');

const dateInput      = document.getElementById('dateInput');
const stepsInput     = document.getElementById('stepsInput');
const logButton      = document.getElementById('logButton');

const goalStepsInput       = document.getElementById('goalStepsInput');
const saveGoalsButton      = document.getElementById('saveGoalsButton');
const resetProgressButton  = document.getElementById('resetProgressButton');

const stopsWrap = document.getElementById('stopsWrap');

const toast            = document.getElementById('toast');
const modalBg          = document.getElementById('modalBg');
const modalImage       = document.getElementById('modalImage');
const modalFallback    = document.getElementById('modalFallback');
const modalEyebrow     = document.getElementById('modalEyebrow');
const modalTitle       = document.getElementById('modalTitle');
const modalText        = document.getElementById('modalText');
const closeModalButton = document.getElementById('closeModalButton');

const completionBg    = document.getElementById('completionBg');
const completionClose = document.getElementById('completionClose');

// ── Storage ───────────────────────────────────────────────────────────────────
function loadLog() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch { return []; }
}
function saveLog() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.log)); }

function loadGoals() {
  try {
    const parsed = JSON.parse(localStorage.getItem(GOALS_KEY) || 'null');
    return { totalSteps: Number(parsed?.totalSteps) > 0 ? Number(parsed.totalSteps) : DEFAULT_GOAL_STEPS };
  } catch {
    return { totalSteps: DEFAULT_GOAL_STEPS };
  }
}
function saveGoals() { localStorage.setItem(GOALS_KEY, JSON.stringify(state.goals)); }

// ── Progress calculations ─────────────────────────────────────────────────────
function todayKey() { return new Date().toISOString().split('T')[0]; }
function getTotalSteps() { return state.log.reduce((sum, e) => sum + Number(e.steps || 0), 0); }

function getTotalMiles() {
  const steps = getTotalSteps();
  const goal  = Math.max(1, state.goals.totalSteps);
  return Math.min(ROUTE_TOTAL_MILES, +(steps / goal * ROUTE_TOTAL_MILES).toFixed(2));
}

function getUnlockedStops() {
  const m = getTotalMiles();
  return STOPS.filter(s => m >= s.miles);
}

function getPercentComplete() {
  return Math.min(100, Math.round(getTotalMiles() / ROUTE_TOTAL_MILES * 100));
}

// ── SVG route helpers ─────────────────────────────────────────────────────────
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

function interpolatePoint(miles) {
  const clamped = Math.max(0, Math.min(miles, ROUTE_TOTAL_MILES));
  for (let i = 0; i < ROUTE_MILES.length - 1; i++) {
    if (clamped >= ROUTE_MILES[i] && clamped <= ROUTE_MILES[i + 1]) {
      const ratio = (clamped - ROUTE_MILES[i]) / (ROUTE_MILES[i + 1] - ROUTE_MILES[i]);
      return [
        ROUTE_POINTS[i][0] + ratio * (ROUTE_POINTS[i + 1][0] - ROUTE_POINTS[i][0]),
        ROUTE_POINTS[i][1] + ratio * (ROUTE_POINTS[i + 1][1] - ROUTE_POINTS[i][1])
      ];
    }
  }
  return ROUTE_POINTS[ROUTE_POINTS.length - 1];
}

function buildProgressPath(miles) {
  const clamped = Math.max(0, Math.min(miles, ROUTE_TOTAL_MILES));
  let seg = 0;
  for (let i = 0; i < ROUTE_MILES.length - 1; i++) {
    if (clamped <= ROUTE_MILES[i + 1]) { seg = i; break; }
    seg = i + 1;
  }
  const pts   = [...ROUTE_POINTS.slice(0, seg + 1)];
  const end   = interpolatePoint(clamped);
  const last  = pts[pts.length - 1];
  if (!last || last[0] !== end[0] || last[1] !== end[1]) pts.push(end);
  return buildSmoothPath(pts);
}

function svgNode(tag, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  return el;
}

// ── Render ────────────────────────────────────────────────────────────────────
function renderHome() {
  const steps    = getTotalSteps();
  const miles    = getTotalMiles();
  const unlocked = getUnlockedStops().length;
  const pct      = getPercentComplete();

  heroMiles.textContent    = miles;
  heroSteps.textContent    = steps.toLocaleString();
  heroUnlocked.textContent = `${unlocked}/6`;
  snapshotHelper.textContent = `${pct}% complete · ${steps.toLocaleString()} steps · ${state.goals.totalSteps.toLocaleString()} step goal`;

  const existing = state.log.find(e => e.date === (dateInput.value || todayKey()));
  quickLogHelper.textContent = existing
    ? `Selected day already has ${Number(existing.steps).toLocaleString()} steps logged.`
    : 'Add to today or another date.';
}

function renderGoals() {
  goalStepsInput.value = state.goals.totalSteps;
}

function renderRoutePreview() {
  const miles       = getTotalMiles();
  const fullPath    = buildSmoothPath(ROUTE_POINTS);
  const progressPth = buildProgressPath(miles);

  routeBase.setAttribute('d', fullPath);
  routeHalo.setAttribute('d', progressPth);
  routeProgress.setAttribute('d', progressPth);
  routeMarkers.innerHTML = '';

  STOPS.forEach((stop, i) => {
    const [x, y]   = ROUTE_POINTS[i + 1];
    const unlocked = miles >= stop.miles;
    const g        = svgNode('g', { transform: `translate(${x},${y})` });

    g.appendChild(svgNode('circle', {
      r: '17',
      fill:           unlocked ? 'rgba(255,252,254,.98)' : 'rgba(248,238,244,.95)',
      stroke:         unlocked ? '#c07890' : '#d0b0c0',
      'stroke-width': unlocked ? '2.2' : '1.4'
    }));

    const icon = svgNode('text', { 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': '11' });
    icon.textContent = stop.emoji || String(stop.id);

    const miLabel = svgNode('text', {
      'text-anchor': 'middle', y: '30',
      'font-family': 'Plus Jakarta Sans, sans-serif',
      'font-size': '8.2', 'font-weight': '700',
      fill: unlocked ? '#8a4d65' : '#a08090'
    });
    miLabel.textContent = `${stop.miles} mi`;

    const nameLabel = svgNode('text', {
      'text-anchor': 'middle', y: '46', class: 'routeLabel'
    });
    nameLabel.textContent = stop.short;

    g.append(icon, miLabel, nameLabel);
    routeMarkers.appendChild(g);
  });

  const [x, y] = interpolatePoint(miles);
  youMarker.setAttribute('transform', `translate(${x},${y})`);

  routeStatLine.innerHTML = `<strong>${miles.toFixed(2)} miles</strong> travelled · <strong>${getTotalSteps().toLocaleString()}</strong> steps logged · <strong>${getUnlockedStops().length}/6</strong> stops unlocked`;
}

function renderStops() {
  const miles       = getTotalMiles();
  const nowUnlocked = new Set(getUnlockedStops().map(s => s.id));

  for (const id of nowUnlocked) {
    if (!state.unlockedIds.has(id)) {
      const stop = STOPS.find(s => s.id === id);
      if (stop) showToast(`Unlocked: ${stop.name}`);
    }
  }
  state.unlockedIds = nowUnlocked;

  stopsWrap.innerHTML = STOPS.map((stop, i) => {
    const unlocked  = miles >= stop.miles;
    const sizeClass = i === 0 || i === 4 ? 'large' : i === 2 ? 'tall' : '';
    return `
      <article class="tile ${sizeClass} ${unlocked ? 'unlocked' : 'locked'}">
        <div class="tileFallback" style="background:${stop.fallback}">${stop.name}</div>
        <img src="${stop.image}" alt="${stop.name}" onload="this.style.opacity=1" onerror="this.style.display='none'">
        <div class="tileContent">
          <div class="tileTop">
            <div class="tileMiles">${stop.miles} miles · stop ${String(stop.id).padStart(2, '0')}</div>
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
  renderRoutePreview();
  renderStops();
}

// ── Actions ───────────────────────────────────────────────────────────────────
function logSteps() {
  const date  = dateInput.value;
  const steps = Number.parseInt(stepsInput.value, 10);
  if (!date || !steps || steps < 1) { showToast('Enter a date and a real step count.'); return; }

  const existing = state.log.find(e => e.date === date);
  if (existing) existing.steps += steps;
  else state.log.push({ date, steps });
  state.log.sort((a, b) => b.date.localeCompare(a.date));

  saveLog();
  stepsInput.value = '';
  renderAll();
  checkCompletion();
  showToast(`Logged ${steps.toLocaleString()} steps.`);
}

function saveGoalsAction() {
  const total = Number.parseInt(goalStepsInput.value, 10);
  if (!total || total < 1) { showToast('Enter a real step count.'); return; }
  state.goals.totalSteps = total;
  saveGoals();
  renderAll();
  showToast('Goal set.');
}

function resetProgress() {
  state.log              = [];
  state.completionShown  = false;
  localStorage.removeItem(COMPLETION_KEY);
  saveLog();
  completionBg.classList.remove('show');
  renderAll();
  showToast('Quest reset.');
}

// ── Completion ────────────────────────────────────────────────────────────────
function checkCompletion() {
  if (state.completionShown) return;
  if (getTotalMiles() >= ROUTE_TOTAL_MILES) {
    state.completionShown = true;
    localStorage.setItem(COMPLETION_KEY, '1');
    completionBg.classList.add('show');
  }
}

// ── Postcard modal ────────────────────────────────────────────────────────────
function openPostcard(id) {
  const stop = STOPS.find(s => s.id === Number(id));
  if (!stop) return;
  if (getTotalMiles() < stop.miles) return;

  modalEyebrow.textContent = `${stop.miles} miles · real landmark postcard`;
  modalTitle.textContent   = stop.name;
  modalText.innerHTML      = `<strong>${stop.souvenir}</strong><br>${stop.note}<br><span style="display:inline-block;margin-top:8px;font-size:.78rem;color:#6b5060;">Photo source: Wikimedia Commons</span>`;
  modalFallback.textContent         = stop.name;
  modalFallback.style.background    = stop.fallback;
  modalImage.classList.remove('loaded');
  modalImage.style.display = '';
  modalImage.alt           = stop.name;
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

// ── Toast ─────────────────────────────────────────────────────────────────────
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
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
  const today     = new Date();
  dateInput.value = today.toISOString().split('T')[0];
  mapDate.textContent = today.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
  });

  state.unlockedIds = new Set(getUnlockedStops().map(s => s.id));
  renderAll();

  logButton.addEventListener('click', logSteps);
  saveGoalsButton.addEventListener('click', saveGoalsAction);
  resetProgressButton.addEventListener('click', resetProgress);
  completionClose.addEventListener('click', () => completionBg.classList.remove('show'));

  stepsInput.addEventListener('keydown', e => { if (e.key === 'Enter') logSteps(); });

  document.addEventListener('click', e => {
    const del  = e.target.getAttribute('data-delete');
    if (del) {
      state.log = state.log.filter(entry => entry.date !== del);
      saveLog();
      renderAll();
      showToast('Entry removed.');
    }
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
