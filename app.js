(() => {
  // ── State ──────────────────────────────────────────────────
  const today = new Date();
  const dayIndex = today.getDay(); // 0 = Sunday … 6 = Saturday
  const completedKey = `ms-completed-${today.toDateString()}`;

  let completed = new Set(JSON.parse(localStorage.getItem(completedKey) || '[]'));
  let activeSaver = null;
  let selectedMinutes = 1;
  let totalSeconds = 60;
  let remainingSeconds = 60;
  let timerInterval = null;
  let timerState = 'idle'; // idle | running | paused | done
  let activeTab = 'practice';

  // Ring math: circumference of r=88 circle = 2π×88 ≈ 553
  const CIRCUMFERENCE = 2 * Math.PI * 88;

  // ── DOM refs ───────────────────────────────────────────────
  const grid        = document.getElementById('savers-grid');
  const modal        = document.getElementById('timer-modal');
  const modalClose   = document.getElementById('modal-close');
  const modalLetter  = document.getElementById('modal-letter');
  const modalName    = document.getElementById('modal-name');
  const modalDayTitle = document.getElementById('modal-day-title');
  const timerDisplay = document.getElementById('timer-display');
  const timerStatus  = document.getElementById('timer-status');
  const ringFg       = document.getElementById('ring-fg');
  const btnStart     = document.getElementById('btn-start');
  const btnPause     = document.getElementById('btn-pause');
  const btnResume    = document.getElementById('btn-resume');
  const btnReset     = document.getElementById('btn-reset');
  const completeBanner = document.getElementById('complete-banner');
  const sessionCount = document.getElementById('session-count');
  const sessionBar   = document.getElementById('session-bar');
  const todayLabel   = document.getElementById('today-label');
  const instrContent = document.getElementById('instructions-content');
  const ideasContent = document.getElementById('ideas-content');
  const tabPractice  = document.getElementById('tab-practice');
  const tabInstr     = document.getElementById('tab-instructions');
  const tabIdeas     = document.getElementById('tab-ideas');

  // ── Accent colors per saver id ─────────────────────────────
  const ACCENT = {
    S:  { bg: 'rgba(124,58,237,.25)',  color: '#C4B5FD', stroke: '#7C3AED' },
    A:  { bg: 'rgba(219,39,119,.25)',  color: '#F9A8D4', stroke: '#DB2777' },
    V:  { bg: 'rgba(217,119,6,.25)',   color: '#FDE68A', stroke: '#D97706' },
    E:  { bg: 'rgba(22,163,74,.25)',   color: '#86EFAC', stroke: '#16A34A' },
    R:  { bg: 'rgba(37,99,235,.25)',   color: '#93C5FD', stroke: '#2563EB' },
    SC: { bg: 'rgba(8,145,178,.25)',   color: '#67E8F9', stroke: '#0891B2' },
  };

  // ── Init ───────────────────────────────────────────────────
  function init() {
    todayLabel.textContent = DAY_NAMES[dayIndex];
    renderGrid();
    updateSessionUI();
    attachModalListeners();
  }

  // ── Render grid cards ──────────────────────────────────────
  function renderGrid() {
    grid.innerHTML = '';
    SAVERS_DATA.forEach((saver) => {
      const day = saver.daily[dayIndex];
      const accent = ACCENT[saver.id];
      const isDone = completed.has(saver.id);

      const card = document.createElement('div');
      card.className = 'saver-card' + (isDone ? ' done' : '');
      card.dataset.saver = saver.id;
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.innerHTML = `
        <div class="card-check">✓</div>
        <div class="card-top">
          <div class="card-letter">${saver.id === 'SC' ? 'S' : saver.letter}</div>
          <div>
            <div class="card-name">${saver.name}</div>
            <div class="card-icon">${saver.icon}</div>
          </div>
        </div>
        <div class="card-day-title">${day.title}</div>
        <div class="card-snippet">${day.snippet}</div>
        <div class="card-footer">
          <span class="dur-chip">1 min</span>
          <span class="dur-chip">3 min</span>
          <span class="dur-chip">10 min</span>
        </div>
      `;

      card.addEventListener('click', () => openModal(saver));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(saver); }
      });

      grid.appendChild(card);
    });
  }

  // ── Open modal ─────────────────────────────────────────────
  function openModal(saver) {
    activeSaver = saver;
    const day = saver.daily[dayIndex];
    const accent = ACCENT[saver.id];

    // Header
    modalLetter.textContent = saver.id === 'SC' ? 'S' : saver.letter;
    modalLetter.style.background = accent.bg;
    modalLetter.style.color = accent.color;
    modalName.textContent = saver.name;
    modalDayTitle.textContent = `Day ${dayIndex + 1} · ${day.title}`;

    // Ring colour
    ringFg.style.stroke = accent.stroke;

    // Instructions
    instrContent.innerHTML = saver.instructions;

    // Ideas
    ideasContent.innerHTML = saver.ideas.map((idea) => `
      <div class="idea-item" style="border-left-color: ${accent.stroke}">
        <strong>${idea.title}</strong>${idea.body}
      </div>
    `).join('');

    // Complete banner
    if (completed.has(saver.id)) {
      completeBanner.classList.remove('hidden');
    } else {
      completeBanner.classList.add('hidden');
    }

    // Reset timer to defaults
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

  // ── Duration buttons ───────────────────────────────────────
  function setDuration(minutes) {
    selectedMinutes = minutes;
    totalSeconds = minutes * 60;
    remainingSeconds = totalSeconds;
    document.querySelectorAll('.dur-btn').forEach((btn) => {
      btn.classList.toggle('active', parseInt(btn.dataset.minutes) === minutes);
      // Active button gets saver accent
      if (activeSaver && parseInt(btn.dataset.minutes) === minutes) {
        btn.style.background = ACCENT[activeSaver.id].stroke;
      } else {
        btn.style.background = '';
      }
    });
    updateTimerDisplay();
    setRingProgress(1);
  }

  // ── Timer logic ────────────────────────────────────────────
  function startTimer() {
    if (timerState === 'done') return;
    timerState = 'running';
    timerStatus.textContent = 'In progress…';
    showControls('running');

    timerInterval = setInterval(() => {
      remainingSeconds--;
      updateTimerDisplay();
      setRingProgress(remainingSeconds / totalSeconds);

      if (remainingSeconds <= 0) {
        clearInterval(timerInterval);
        timerState = 'done';
        timerStatus.textContent = 'Complete!';
        showControls('done');
        markComplete();
      }
    }, 1000);
  }

  function pauseTimer() {
    clearInterval(timerInterval);
    timerState = 'paused';
    timerStatus.textContent = 'Paused';
    showControls('paused');
  }

  function resumeTimer() {
    timerState = 'running';
    timerStatus.textContent = 'In progress…';
    showControls('running');
    timerInterval = setInterval(() => {
      remainingSeconds--;
      updateTimerDisplay();
      setRingProgress(remainingSeconds / totalSeconds);
      if (remainingSeconds <= 0) {
        clearInterval(timerInterval);
        timerState = 'done';
        timerStatus.textContent = 'Complete!';
        showControls('done');
        markComplete();
      }
    }, 1000);
  }

  function resetTimer() {
    stopTimer();
    remainingSeconds = totalSeconds;
    timerState = 'idle';
    timerStatus.textContent = 'Ready';
    updateTimerDisplay();
    setRingProgress(1);
    showControls('idle');
  }

  function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  function updateTimerDisplay() {
    const m = Math.floor(remainingSeconds / 60);
    const s = remainingSeconds % 60;
    timerDisplay.textContent = `${m}:${String(s).padStart(2, '0')}`;
  }

  function setRingProgress(fraction) {
    // fraction 1 = full circle, 0 = empty
    const offset = CIRCUMFERENCE * (1 - Math.max(0, Math.min(1, fraction)));
    ringFg.style.strokeDashoffset = offset;
    ringFg.style.strokeDasharray = CIRCUMFERENCE;
  }

  function showControls(state) {
    btnStart.classList.toggle('hidden',  state !== 'idle');
    btnPause.classList.toggle('hidden',  state !== 'running');
    btnResume.classList.toggle('hidden', state !== 'paused');
    btnReset.classList.toggle('hidden',  state === 'idle');
  }

  // ── Mark saver complete ────────────────────────────────────
  function markComplete() {
    if (!activeSaver) return;
    completed.add(activeSaver.id);
    localStorage.setItem(completedKey, JSON.stringify([...completed]));
    completeBanner.classList.remove('hidden');
    updateSessionUI();

    // Update card in grid
    const card = grid.querySelector(`[data-saver="${activeSaver.id}"]`);
    if (card) card.classList.add('done');
  }

  // ── Session progress ───────────────────────────────────────
  function updateSessionUI() {
    const count = completed.size;
    sessionCount.textContent = `${count}/6`;
    sessionBar.style.width = `${(count / 6) * 100}%`;
  }

  // ── Tabs ───────────────────────────────────────────────────
  function switchTab(name) {
    activeTab = name;
    document.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.tab === name);
    });
    tabPractice.classList.toggle('hidden', name !== 'practice');
    tabInstr.classList.toggle('hidden',    name !== 'instructions');
    tabIdeas.classList.toggle('hidden',    name !== 'ideas');
  }

  // ── Event listeners ────────────────────────────────────────
  function attachModalListeners() {
    modalClose.addEventListener('click', closeModal);
    modal.querySelector('.modal-backdrop').addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeModal();
    });

    btnStart.addEventListener('click', startTimer);
    btnPause.addEventListener('click', pauseTimer);
    btnResume.addEventListener('click', resumeTimer);
    btnReset.addEventListener('click', resetTimer);

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

  // ── Boot ───────────────────────────────────────────────────
  init();
})();
