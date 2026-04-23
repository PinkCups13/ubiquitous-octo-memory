(() => {
  // ── State ──────────────────────────────────────────────────
  const today      = new Date();
  const dayIndex   = today.getDay();           // 0 Sun … 6 Sat
  const storageKey = `ms-done-${today.toDateString()}`;

  let completed       = new Set(JSON.parse(localStorage.getItem(storageKey) || '[]'));
  let activeSaver     = null;
  let selectedMinutes = 1;
  let totalSeconds    = 60;
  let remaining       = 60;
  let interval        = null;
  let timerState      = 'idle';   // idle | running | paused | done

  const CIRCUMFERENCE = 2 * Math.PI * 88; // r = 88

  // ── Accent palette (within the rose/pink editorial world) ──
  const ACCENT = {
    S:  { color: '#e896b6', stroke: '#e090b0', atmo: 'rgba(224, 100, 155, 0.55)' },
    A:  { color: '#c098d2', stroke: '#b888cc', atmo: 'rgba(175, 72, 210, 0.45)'  },
    V:  { color: '#d2b092', stroke: '#c8a882', atmo: 'rgba(208, 155, 72, 0.45)'  },
    E:  { color: '#e08880', stroke: '#d87870', atmo: 'rgba(215, 90, 75, 0.42)'   },
    R:  { color: '#c07a90', stroke: '#b86a80', atmo: 'rgba(185, 72, 98, 0.45)'   },
    SC: { color: '#d2a0a8', stroke: '#c89098', atmo: 'rgba(200, 120, 130, 0.45)' },
  };

  // ── DOM ────────────────────────────────────────────────────
  const grid          = document.getElementById('savers-grid');
  const modal         = document.getElementById('timer-modal');
  const modalClose    = document.getElementById('modal-close');
  const modalAtmo     = document.getElementById('modal-atmo');
  const modalLetter   = document.getElementById('modal-letter');
  const modalName     = document.getElementById('modal-name');
  const modalDayTitle = document.getElementById('modal-day-title');
  const timerDisplay  = document.getElementById('timer-display');
  const timerStatus   = document.getElementById('timer-status');
  const ringFg        = document.getElementById('ring-fg');
  const btnStart      = document.getElementById('btn-start');
  const btnPause      = document.getElementById('btn-pause');
  const btnResume     = document.getElementById('btn-resume');
  const btnReset      = document.getElementById('btn-reset');
  const completeBanner = document.getElementById('complete-banner');
  const sessionCount  = document.getElementById('session-count');
  const sessionBar    = document.getElementById('session-bar');
  const todayLabel    = document.getElementById('today-label');
  const instrContent  = document.getElementById('instructions-content');
  const ideasContent  = document.getElementById('ideas-content');

  const DAY_NAMES_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // ── Init ───────────────────────────────────────────────────
  function init() {
    todayLabel.textContent = DAY_NAMES_FULL[dayIndex];
    renderGrid();
    updateSessionUI();
    attachListeners();
  }

  // ── Render editorial SAVER rows ────────────────────────────
  function renderGrid() {
    grid.innerHTML = '';
    SAVERS_DATA.forEach((saver, i) => {
      const day   = saver.daily[dayIndex];
      const num   = String(i + 1).padStart(2, '0');
      const done  = completed.has(saver.id);
      const bgLetter = saver.id === 'SC' ? 'S' : saver.letter;

      const el = document.createElement('div');
      el.className   = `saver-item${done ? ' done' : ''}`;
      el.dataset.saver = saver.id;
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      el.innerHTML = `
        <div class="si-index">${num}</div>
        <div class="si-body">
          <span class="si-name">${saver.name}</span>
          <span class="si-day-title">${day.title}</span>
          <p class="si-snippet">${day.snippet}</p>
        </div>
        <div class="si-right">
          <div class="si-durations">
            <span class="si-dur">1′</span>
            <span class="si-dur">3′</span>
            <span class="si-dur">10′</span>
          </div>
          <div class="si-check">✦</div>
        </div>
        <div class="si-bg-letter" aria-hidden="true">${bgLetter}</div>
      `;

      el.addEventListener('click', () => openModal(saver));
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(saver); }
      });

      grid.appendChild(el);
    });
  }

  // ── Open modal ─────────────────────────────────────────────
  function openModal(saver) {
    activeSaver = saver;
    const day    = saver.daily[dayIndex];
    const accent = ACCENT[saver.id];

    // Header
    modalLetter.textContent = saver.id === 'SC' ? 'S' : saver.letter;
    modalLetter.style.color = accent.color;
    modalName.textContent   = saver.name;
    modalDayTitle.textContent = day.title;

    // Atmospheric glow
    modalAtmo.style.background = `radial-gradient(circle, ${accent.atmo} 0%, transparent 70%)`;

    // Ring
    ringFg.style.stroke = accent.stroke;

    // Instructions
    instrContent.innerHTML = saver.instructions;

    // Ideas
    ideasContent.innerHTML = saver.ideas.map((idea) => `
      <div class="idea-item">
        <strong>${idea.title}</strong>
        <div class="idea-item-body">${idea.body}</div>
      </div>
    `).join('');

    // Complete state
    completeBanner.classList.toggle('hidden', !completed.has(saver.id));

    // Reset to defaults
    setDuration(1);
    resetTimer();
    switchTab('practice');

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    stopTimer();
    modal.classList.add('hidden');
    document.body.style.overflow = '';
    activeSaver = null;
  }

  // ── Duration ───────────────────────────────────────────────
  function setDuration(minutes) {
    selectedMinutes = minutes;
    totalSeconds    = minutes * 60;
    remaining       = totalSeconds;

    document.querySelectorAll('.dur-btn').forEach((btn) => {
      btn.classList.toggle('active', parseInt(btn.dataset.minutes) === minutes);
    });

    updateDisplay();
    setRing(1);
  }

  // ── Timer ──────────────────────────────────────────────────
  function tick() {
    remaining--;
    updateDisplay();
    setRing(remaining / totalSeconds);
    if (remaining <= 0) {
      clearInterval(interval);
      timerState = 'done';
      timerStatus.textContent = 'Complete';
      showControls('done');
      markComplete();
    }
  }

  function startTimer() {
    if (timerState === 'done') return;
    timerState = 'running';
    timerStatus.textContent = 'In progress';
    showControls('running');
    interval = setInterval(tick, 1000);
  }

  function pauseTimer() {
    clearInterval(interval);
    timerState = 'paused';
    timerStatus.textContent = 'Paused';
    showControls('paused');
  }

  function resumeTimer() {
    timerState = 'running';
    timerStatus.textContent = 'In progress';
    showControls('running');
    interval = setInterval(tick, 1000);
  }

  function resetTimer() {
    stopTimer();
    remaining  = totalSeconds;
    timerState = 'idle';
    timerStatus.textContent = 'Ready';
    updateDisplay();
    setRing(1);
    showControls('idle');
  }

  function stopTimer() {
    clearInterval(interval);
    interval = null;
  }

  function updateDisplay() {
    const m = Math.floor(remaining / 60);
    const s = remaining % 60;
    timerDisplay.textContent = `${m}:${String(s).padStart(2, '0')}`;
  }

  function setRing(fraction) {
    const offset = CIRCUMFERENCE * (1 - Math.max(0, Math.min(1, fraction)));
    ringFg.style.strokeDashoffset = offset;
    ringFg.style.strokeDasharray  = CIRCUMFERENCE;
  }

  function showControls(state) {
    btnStart.classList.toggle('hidden',  state !== 'idle');
    btnPause.classList.toggle('hidden',  state !== 'running');
    btnResume.classList.toggle('hidden', state !== 'paused');
    btnReset.classList.toggle('hidden',  state === 'idle');
  }

  // ── Mark complete ──────────────────────────────────────────
  function markComplete() {
    if (!activeSaver) return;
    completed.add(activeSaver.id);
    localStorage.setItem(storageKey, JSON.stringify([...completed]));
    completeBanner.classList.remove('hidden');
    updateSessionUI();

    const row = grid.querySelector(`[data-saver="${activeSaver.id}"]`);
    if (row) row.classList.add('done');
  }

  // ── Session UI ─────────────────────────────────────────────
  function updateSessionUI() {
    const count = completed.size;
    sessionCount.textContent = `${count} of 6 complete`;
    sessionBar.style.width   = `${(count / 6) * 100}%`;

    document.querySelectorAll('.pip').forEach((pip, i) => {
      pip.classList.toggle('done', i < count);
    });
  }

  // ── Tab switching ──────────────────────────────────────────
  function switchTab(name) {
    document.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.tab === name);
    });
    document.getElementById('tab-practice').classList.toggle('hidden',     name !== 'practice');
    document.getElementById('tab-instructions').classList.toggle('hidden', name !== 'instructions');
    document.getElementById('tab-ideas').classList.toggle('hidden',        name !== 'ideas');
  }

  // ── Listeners ──────────────────────────────────────────────
  function attachListeners() {
    modalClose.addEventListener('click', closeModal);
    modal.querySelector('.modal-backdrop').addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeModal();
    });

    btnStart.addEventListener('click',  startTimer);
    btnPause.addEventListener('click',  pauseTimer);
    btnResume.addEventListener('click', resumeTimer);
    btnReset.addEventListener('click',  resetTimer);

    document.querySelectorAll('.dur-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (timerState !== 'idle') resetTimer();
        setDuration(parseInt(btn.dataset.minutes));
      });
    });

    document.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
  }

  init();
})();
