/**
 * Quantum Memory Matrix - Logic Engine
 */

const matrixGrid = document.getElementById("matrix-grid");
const movesCountEl = document.getElementById("moves-count");
const pairsCountEl = document.getElementById("pairs-count");
const timerValEl = document.getElementById("timer-val");
const restartBtn = document.getElementById("restart-btn");
const winOverlay = document.getElementById("win-overlay");
const winSummary = document.getElementById("win-summary");
const playAgainBtn = document.getElementById("play-again-btn");

const glyphIcons = ["⚡", "💎", "🛸", "👾", "🔮", "🧬", "🔥", "🪐"];
let cardsArray = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let timer = 0;
let timerInterval = null;
let isLockBoard = false;

function initGame() {
  clearInterval(timerInterval);
  timer = 0;
  moves = 0;
  matchedPairs = 0;
  flippedCards = [];
  isLockBoard = false;

  movesCountEl.textContent = moves;
  pairsCountEl.textContent = matchedPairs;
  timerValEl.textContent = "00:00";
  winOverlay.classList.add("hidden");

  // Duplicate icons for 8 pairs (16 cards total)
  cardsArray = [...glyphIcons, ...glyphIcons];
  shuffle(cardsArray);

  renderBoard();
  startTimer();
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function renderBoard() {
  matrixGrid.innerHTML = "";
  cardsArray.forEach((glyph, index) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.dataset.glyph = glyph;
    card.dataset.index = index;

    card.innerHTML = `
      <div class="card-face card-front"><i data-lucide="atom"></i></div>
      <div class="card-face card-back">${glyph}</div>
    `;

    card.addEventListener("click", () => handleCardClick(card));
    matrixGrid.appendChild(card);
  });
  if (window.lucide) {
    lucide.createIcons();
  }
}

function handleCardClick(card) {
  if (isLockBoard) return;
  if (card === flippedCards[0]) return;
  if (card.classList.contains("matched") || card.classList.contains("flipped")) return;

  card.classList.add("flipped");
  flippedCards.push(card);

  if (flippedCards.length === 2) {
    moves++;
    movesCountEl.textContent = moves;
    checkForMatch();
  }
}

function checkForMatch() {
  const [first, second] = flippedCards;
  const isMatch = first.dataset.glyph === second.dataset.glyph;

  if (isMatch) {
    disableMatchedCards();
  } else {
    unflipCards();
  }
}

function disableMatchedCards() {
  flippedCards.forEach((card) => {
    card.classList.add("matched");
  });
  matchedPairs++;
  pairsCountEl.textContent = matchedPairs;
  flippedCards = [];

  if (matchedPairs === glyphIcons.length) {
    endGame();
  }
}

function unflipCards() {
  isLockBoard = true;
  setTimeout(() => {
    flippedCards.forEach((card) => {
      card.classList.remove("flipped");
    });
    flippedCards = [];
    isLockBoard = false;
  }, 900);
}

function startTimer() {
  timerInterval = setInterval(() => {
    timer++;
    const mins = String(Math.floor(timer / 60)).padStart(2, "0");
    const secs = String(timer % 60).padStart(2, "0");
    timerValEl.textContent = `${mins}:${secs}`;
  }, 1000);
}

function endGame() {
  clearInterval(timerInterval);
  const mins = String(Math.floor(timer / 60)).padStart(2, "0");
  const secs = String(timer % 60).padStart(2, "0");
  winSummary.textContent = `You unlocked the matrix in ${moves} moves and ${mins}:${secs}!`;
  winOverlay.classList.remove("hidden");
}

restartBtn.addEventListener("click", initGame);
playAgainBtn.addEventListener("click", initGame);

// Start on load
initGame();
