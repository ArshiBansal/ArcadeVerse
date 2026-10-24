/**
 * Quantum Minesweeper
 * Pure Vanilla JavaScript recursive flood-fill grid engine
 */

(() => {
  const minefieldEl = document.getElementById("minefield");
  const mineCountEl = document.getElementById("mine-count");
  const timerDisplayEl = document.getElementById("timer-display");
  const faceBtn = document.getElementById("face-btn");
  const flagToggleBtn = document.getElementById("flag-toggle-btn");
  const flagModeStateEl = document.getElementById("flag-mode-state");

  const diffBtns = document.querySelectorAll(".diff-btn");
  const resultModal = document.getElementById("result-modal");
  const resultTitle = document.getElementById("result-title");
  const resultIcon = document.getElementById("result-icon");
  const resultMessage = document.getElementById("result-message");
  const resultTime = document.getElementById("result-time");
  const resultDiff = document.getElementById("result-diff");
  const closeResultBtn = document.getElementById("close-result-btn");
  const modalRestartBtn = document.getElementById("modal-restart-btn");

  const rulesBtn = document.getElementById("rules-btn");
  const closeRulesBtn = document.getElementById("close-rules-btn");
  const rulesModal = document.getElementById("rules-modal");

  const CONFIGS = {
    easy: { rows: 9, cols: 9, mines: 10, label: "9x9" },
    medium: { rows: 12, cols: 12, mines: 20, label: "12x12" }
  };

  let currentDiff = "easy";
  let rows = 9;
  let cols = 9;
  let totalMines = 10;
  let grid = [];
  let isGameOver = false;
  let isGameStarted = false;
  let flagsLeft = 10;
  let flagMode = false;
  let timer = 0;
  let timerInterval = null;

  function setDifficulty(diff) {
    currentDiff = diff;
    rows = CONFIGS[diff].rows;
    cols = CONFIGS[diff].cols;
    totalMines = CONFIGS[diff].mines;

    diffBtns.forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-diff") === diff);
    });

    initGame();
  }

  function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timer = 0;
    timerDisplayEl.textContent = "000";
    timerInterval = setInterval(() => {
      timer++;
      timerDisplayEl.textContent = String(Math.min(999, timer)).padStart(3, "0");
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function initGame() {
    stopTimer();
    isGameOver = false;
    isGameStarted = false;
    flagsLeft = totalMines;
    mineCountEl.textContent = flagsLeft;
    timerDisplayEl.textContent = "000";
    faceBtn.textContent = "🙂";
    resultModal.classList.remove("active");

    grid = [];
    minefieldEl.innerHTML = "";
    minefieldEl.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

    for (let r = 0; r < rows; r++) {
      grid[r] = [];
      for (let c = 0; c < cols; c++) {
        const cell = {
          r,
          c,
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          neighborMines: 0,
          element: null
        };

        const cellEl = document.createElement("div");
        cellEl.className = "cell";
        cellEl.dataset.r = r;
        cellEl.dataset.c = c;

        cellEl.addEventListener("click", () => handleCellClick(r, c));
        cellEl.addEventListener("contextmenu", (e) => {
          e.preventDefault();
          toggleFlag(r, c);
        });

        minefieldEl.appendChild(cellEl);
        cell.element = cellEl;
        grid[r][c] = cell;
      }
    }
  }

  function plantMines(firstR, firstC) {
    let planted = 0;
    while (planted < totalMines) {
      const r = Math.floor(Math.random() * rows);
      const c = Math.floor(Math.random() * cols);

      // Safe zone around first click
      if (Math.abs(r - firstR) <= 1 && Math.abs(c - firstC) <= 1) continue;
      if (!grid[r][c].isMine) {
        grid[r][c].isMine = true;
        planted++;
      }
    }

    // Calculate neighbor mine counts
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!grid[r][c].isMine) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc].isMine) {
                count++;
              }
            }
          }
          grid[r][c].neighborMines = count;
        }
      }
    }
  }

  function toggleFlag(r, c) {
    if (isGameOver) return;
    const cell = grid[r][c];
    if (cell.isRevealed) return;

    if (cell.isFlagged) {
      cell.isFlagged = false;
      cell.element.classList.remove("flagged");
      cell.element.textContent = "";
      flagsLeft++;
    } else if (flagsLeft > 0) {
      cell.isFlagged = true;
      cell.element.classList.add("flagged");
      cell.element.textContent = "🚩";
      flagsLeft--;
    }

    mineCountEl.textContent = flagsLeft;
  }

  function handleCellClick(r, c) {
    if (isGameOver) return;
    if (flagMode) {
      toggleFlag(r, c);
      return;
    }

    const cell = grid[r][c];
    if (cell.isFlagged || cell.isRevealed) return;

    if (!isGameStarted) {
      isGameStarted = true;
      plantMines(r, c);
      startTimer();
    }

    if (cell.isMine) {
      // Detonation!
      revealMines();
      cell.element.style.background = "#ef4444";
      gameOver(false);
      return;
    }

    revealCell(r, c);
    checkVictory();
  }

  function revealCell(r, c) {
    const cell = grid[r][c];
    if (cell.isRevealed || cell.isFlagged || cell.isMine) return;

    cell.isRevealed = true;
    cell.element.classList.add("revealed");

    if (cell.neighborMines > 0) {
      cell.element.textContent = cell.neighborMines;
      cell.element.dataset.num = cell.neighborMines;
    } else {
      // Recursive flood-fill
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
            revealCell(nr, nc);
          }
        }
      }
    }
  }

  function revealMines() {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = grid[r][c];
        if (cell.isMine) {
          cell.element.classList.add("mine");
          cell.element.textContent = "💣";
        }
      }
    }
  }

  function checkVictory() {
    let unrevealedSafeCells = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = grid[r][c];
        if (!cell.isMine && !cell.isRevealed) {
          unrevealedSafeCells++;
        }
      }
    }

    if (unrevealedSafeCells === 0) {
      gameOver(true);
    }
  }

  function gameOver(won) {
    isGameOver = true;
    stopTimer();

    faceBtn.textContent = won ? "😎" : "😵";

    resultTitle.textContent = won ? "Quantum Sector Secured!" : "Singularity Breach!";
    resultIcon.textContent = won ? "🏆" : "💥";
    resultMessage.textContent = won 
      ? `All ${totalMines} subatomic quantum hazards have been safely neutralized!`
      : "A quantum mine was triggered, destabilizing the local field.";
    resultTime.textContent = `${timer}s`;
    resultDiff.textContent = CONFIGS[currentDiff].label;

    setTimeout(() => {
      resultModal.classList.add("active");
    }, 700);
  }

  // Event Listeners
  faceBtn.addEventListener("click", initGame);
  modalRestartBtn.addEventListener("click", initGame);
  closeResultBtn.addEventListener("click", () => resultModal.classList.remove("active"));

  diffBtns.forEach(btn => {
    btn.addEventListener("click", () => setDifficulty(btn.getAttribute("data-diff")));
  });

  flagToggleBtn.addEventListener("click", () => {
    flagMode = !flagMode;
    flagToggleBtn.classList.toggle("active", flagMode);
    flagModeStateEl.textContent = flagMode ? "ON" : "OFF";
  });

  rulesBtn.addEventListener("click", () => rulesModal.classList.add("active"));
  closeRulesBtn.addEventListener("click", () => rulesModal.classList.remove("active"));
  rulesModal.addEventListener("click", (e) => {
    if (e.target === rulesModal) rulesModal.classList.remove("active");
  });

  initGame();
})();
