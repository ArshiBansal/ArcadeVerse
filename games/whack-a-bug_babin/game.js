/**
 * Whack-A-Bug Developer Panic
 * Pure Vanilla JavaScript reaction reflex arcade
 */

(() => {
  const serverRack = document.getElementById("server-rack");
  const scoreDisplay = document.getElementById("score-display");
  const tempDisplay = document.getElementById("temp-display");
  const tempBarFill = document.getElementById("temp-bar-fill");
  const bestScoreEl = document.getElementById("best-score");

  const startOverlay = document.getElementById("start-overlay");
  const gameoverOverlay = document.getElementById("gameover-overlay");
  const startBtn = document.getElementById("start-btn");
  const restartBtn = document.getElementById("restart-btn");

  const finalScoreEl = document.getElementById("final-score");
  const finalComboEl = document.getElementById("final-combo");
  const finalBestEl = document.getElementById("final-best");

  const rulesBtn = document.getElementById("rules-btn");
  const closeRulesBtn = document.getElementById("close-rules-btn");
  const rulesModal = document.getElementById("rules-modal");

  const BUG_TYPES = [
    { type: "syntax", icon: "🐛", points: 10, cooling: 2, duration: 1100 },
    { type: "nullpointer", icon: "👾", points: 25, cooling: 4, duration: 900 },
    { type: "golden", icon: "⭐", points: 50, cooling: 10, duration: 750 },
    { type: "firewall", icon: "🛡️", points: -20, cooling: -15, duration: 1200 }
  ];

  let score = 0;
  let combo = 0;
  let maxCombo = 0;
  let cpuTemp = 45;
  let isPlaying = false;
  let slots = [];
  let spawnInterval = null;
  let heatInterval = null;
  let bestScore = parseInt(localStorage.getItem("arcadeverse_whack_bug_best") || "0", 10);

  bestScoreEl.textContent = bestScore;

  function initRack() {
    serverRack.innerHTML = "";
    slots = [];

    for (let i = 0; i < 9; i++) {
      const slot = document.createElement("div");
      slot.className = "rack-slot";
      slot.dataset.index = i;

      slot.addEventListener("pointerdown", () => handleSlotClick(i));
      serverRack.appendChild(slot);
      slots.push({ element: slot, activeBug: null, timer: null });
    }
  }

  function updateHUD() {
    scoreDisplay.textContent = score;
    tempDisplay.textContent = `${Math.round(cpuTemp)}°C`;
    tempBarFill.style.width = `${Math.min(100, Math.max(0, cpuTemp))}%`;

    if (cpuTemp > 80) tempDisplay.style.color = "#ef4444";
    else if (cpuTemp > 60) tempDisplay.style.color = "#f59e0b";
    else tempDisplay.style.color = "#10b981";

    if (score > bestScore) {
      bestScore = score;
      bestScoreEl.textContent = bestScore;
      localStorage.setItem("arcadeverse_whack_bug_best", bestScore);
    }
  }

  function spawnBug() {
    if (!isPlaying) return;

    // Find available slots
    const available = slots.filter(s => !s.activeBug);
    if (available.length === 0) return;

    const randomSlot = available[Math.floor(Math.random() * available.length)];

    // Weighted random bug selection
    const rand = Math.random();
    let bugType;
    if (rand < 0.55) bugType = BUG_TYPES[0]; // Syntax Error
    else if (rand < 0.80) bugType = BUG_TYPES[1]; // Memory Leak
    else if (rand < 0.90) bugType = BUG_TYPES[2]; // Golden Patch
    else bugType = BUG_TYPES[3]; // Firewall Trap

    const bugEl = document.createElement("div");
    bugEl.className = "bug-entity";
    bugEl.textContent = bugType.icon;

    randomSlot.element.appendChild(bugEl);
    randomSlot.activeBug = bugType;

    const duration = Math.max(550, bugType.duration - Math.min(400, score * 3));
    randomSlot.timer = setTimeout(() => {
      clearSlot(randomSlot);
    }, duration);
  }

  function clearSlot(slot) {
    if (slot.activeBug) {
      slot.element.innerHTML = "";
      slot.activeBug = null;
      if (slot.timer) {
        clearTimeout(slot.timer);
        slot.timer = null;
      }
    }
  }

  function showWhackEffect(slotEl, text, isPenalty) {
    const fx = document.createElement("div");
    fx.className = "whack-effect";
    fx.textContent = text;
    if (isPenalty) fx.style.color = "#ef4444";
    slotEl.appendChild(fx);
    setTimeout(() => fx.remove(), 400);
  }

  function handleSlotClick(index) {
    if (!isPlaying) return;
    const slot = slots[index];

    if (slot.activeBug) {
      const bug = slot.activeBug;
      clearSlot(slot);

      if (bug.type === "firewall") {
        // Penalty!
        combo = 0;
        cpuTemp = Math.min(100, cpuTemp - bug.cooling); // heats up!
        score = Math.max(0, score + bug.points);
        showWhackEffect(slot.element, "BLOCKED! +15°C", true);
      } else {
        // Successful Whack!
        combo++;
        if (combo > maxCombo) maxCombo = combo;
        score += bug.points;
        cpuTemp = Math.max(25, cpuTemp - bug.cooling);
        showWhackEffect(slot.element, `+${bug.points}`, false);
      }

      updateHUD();
      if (cpuTemp >= 100) gameOver();
    } else {
      // Miss click slightly increases temp
      cpuTemp = Math.min(100, cpuTemp + 1.5);
      updateHUD();
      if (cpuTemp >= 100) gameOver();
    }
  }

  function gameOver() {
    isPlaying = false;
    clearInterval(spawnInterval);
    clearInterval(heatInterval);
    slots.forEach(s => clearSlot(s));

    finalScoreEl.textContent = score;
    finalComboEl.textContent = `${maxCombo}x`;
    finalBestEl.textContent = bestScore;

    setTimeout(() => {
      gameoverOverlay.classList.add("active");
    }, 600);
  }

  function initGame() {
    score = 0;
    combo = 0;
    maxCombo = 0;
    cpuTemp = 45;
    isPlaying = true;

    slots.forEach(s => clearSlot(s));
    updateHUD();

    startOverlay.classList.remove("active");
    gameoverOverlay.classList.remove("active");

    if (spawnInterval) clearInterval(spawnInterval);
    if (heatInterval) clearInterval(heatInterval);

    spawnInterval = setInterval(spawnBug, 750);

    // Passive CPU temperature climb
    heatInterval = setInterval(() => {
      if (!isPlaying) return;
      cpuTemp += 1.8;
      updateHUD();
      if (cpuTemp >= 100) gameOver();
    }, 1000);
  }

  startBtn.addEventListener("click", initGame);
  restartBtn.addEventListener("click", initGame);

  // Modal Handlers
  rulesBtn.addEventListener("click", () => rulesModal.classList.add("active"));
  closeRulesBtn.addEventListener("click", () => rulesModal.classList.remove("active"));
  rulesModal.addEventListener("click", (e) => {
    if (e.target === rulesModal) rulesModal.classList.remove("active");
  });

  initRack();
  updateHUD();
})();
