const boardElement = document.getElementById("board");
const levelLabel = document.getElementById("level-label");
const movesLabel = document.getElementById("moves-label");
const statusElement = document.getElementById("game-status");
const resetButton = document.getElementById("reset-button");
const nextButton = document.getElementById("next-button");

if (!boardElement || !levelLabel || !movesLabel || !statusElement || !resetButton || !nextButton) {
  throw new Error("Prism Pulse could not find all required game elements.");
}

const SIZE = 6;
const DIRECTIONS = [
  { row: -1, col: 0 },
  { row: 0, col: 1 },
  { row: 1, col: 0 },
  { row: 0, col: -1 }
];

const LEVELS = [
  {
    name: "First Refraction",
    emitter: { row: 3, col: 0, direction: 1 },
    receiver: { row: 5, col: 5 },
    mirrors: [
      { row: 3, col: 2, solved: "\\" },
      { row: 5, col: 2, solved: "/" },
      { row: 5, col: 0, solved: "\\" },
      { row: 1, col: 0, solved: "/" },
      { row: 1, col: 5, solved: "\\" }
    ],
    blockers: [{ row: 2, col: 3 }, { row: 4, col: 4 }]
  },
  {
    name: "Split Horizon",
    emitter: { row: 1, col: 0, direction: 1 },
    receiver: { row: 0, col: 5 },
    mirrors: [
      { row: 1, col: 4, solved: "\\" },
      { row: 4, col: 4, solved: "/" },
      { row: 4, col: 1, solved: "\\" },
      { row: 0, col: 1, solved: "/" }
    ],
    blockers: [{ row: 2, col: 2 }, { row: 3, col: 3 }, { row: 2, col: 5 }]
  },
  {
    name: "Core Convergence",
    emitter: { row: 4, col: 0, direction: 1 },
    receiver: { row: 3, col: 5 },
    mirrors: [
      { row: 4, col: 1, solved: "/" },
      { row: 1, col: 1, solved: "\\" },
      { row: 1, col: 0, solved: "/" },
      { row: 3, col: 0, solved: "\\" }
    ],
    blockers: [{ row: 2, col: 2 }, { row: 2, col: 4 }, { row: 0, col: 3 }]
  }
];

let levelIndex = 0;
let moves = 0;
let mirrors = [];
let beamCells = new Set();
let receiverLit = false;
let levelComplete = false;

function keyFor(row, col) {
  return `${row},${col}`;
}

function getLevel() {
  return LEVELS[levelIndex];
}

function resetLevel() {
  const level = getLevel();
  moves = 0;
  levelComplete = false;
  receiverLit = false;
  mirrors = level.mirrors.map((mirror) => ({
    ...mirror,
    orientation: mirror.solved === "/" ? "\\" : "/"
  }));
  levelLabel.textContent = `${levelIndex + 1} / ${LEVELS.length}`;
  movesLabel.textContent = "0";
  statusElement.textContent = `${level.name}: rotate mirrors to guide the beam.`;
  statusElement.classList.remove("success");
  nextButton.hidden = true;
  traceBeam();
  renderBoard();
}

function reflect(direction, orientation) {
  if (orientation === "/") return direction % 2 === 0 ? direction + 1 : direction - 1;
  return 3 - direction;
}

function traceBeam() {
  const level = getLevel();
  const mirrorByPosition = new Map(mirrors.map((mirror) => [keyFor(mirror.row, mirror.col), mirror]));
  const blockers = new Set(level.blockers.map(({ row, col }) => keyFor(row, col)));
  const visited = new Set();
  const cells = new Set();
  let row = level.emitter.row;
  let col = level.emitter.col;
  let direction = level.emitter.direction;
  let reachedReceiver = false;

  for (let step = 0; step < SIZE * SIZE * 4; step++) {
    const state = `${row},${col},${direction}`;
    if (visited.has(state)) break;
    visited.add(state);

    const position = keyFor(row, col);
    cells.add(position);
    if (row === level.receiver.row && col === level.receiver.col) {
      reachedReceiver = true;
      break;
    }
    if (blockers.has(position)) break;

    const mirror = mirrorByPosition.get(position);
    if (mirror) direction = reflect(direction, mirror.orientation);

    row += DIRECTIONS[direction].row;
    col += DIRECTIONS[direction].col;
    if (row < 0 || row >= SIZE || col < 0 || col >= SIZE) break;
  }

  beamCells = cells;
  receiverLit = reachedReceiver;
}

function rotateMirror(index) {
  if (levelComplete) return;

  mirrors[index].orientation = mirrors[index].orientation === "/" ? "\\" : "/";
  moves++;
  movesLabel.textContent = moves;
  traceBeam();
  renderBoard();

  if (receiverLit) {
    levelComplete = true;
    statusElement.textContent = levelIndex === LEVELS.length - 1
      ? `Labyrinth solved in ${moves} rotations. The prism is stable!`
      : `${getLevel().name} complete in ${moves} rotations.`;
    statusElement.classList.add("success");
    nextButton.hidden = levelIndex === LEVELS.length - 1;
    if (levelIndex === LEVELS.length - 1) nextButton.textContent = "All labyrinths solved!";
    else nextButton.textContent = "Next labyrinth →";
  } else {
    statusElement.textContent = "The beam is moving. Try another mirror to change its route.";
  }
}

function createCell(row, col, level) {
  const cell = document.createElement("div");
  const position = keyFor(row, col);
  cell.className = "cell";
  cell.setAttribute("role", "gridcell");

  if (beamCells.has(position)) cell.classList.add("beam");

  if (row === level.emitter.row && col === level.emitter.col) {
    cell.classList.add("emitter");
    cell.setAttribute("aria-label", "Laser emitter");
    cell.innerHTML = '<span class="endpoint-icon" aria-hidden="true">✦</span>';
    return cell;
  }

  if (row === level.receiver.row && col === level.receiver.col) {
    cell.classList.add("receiver");
    if (receiverLit) cell.classList.add("lit");
    cell.setAttribute("aria-label", receiverLit ? "Receiver lit" : "Laser receiver");
    cell.innerHTML = '<span class="endpoint-icon" aria-hidden="true">◎</span>';
    return cell;
  }

  const mirrorIndex = mirrors.findIndex((mirror) => mirror.row === row && mirror.col === col);
  if (mirrorIndex !== -1) {
    const mirror = mirrors[mirrorIndex];
    const button = document.createElement("button");
    button.type = "button";
    button.className = "cell mirror";
    if (beamCells.has(position)) button.classList.add("beam");
    button.textContent = mirror.orientation;
    button.setAttribute("role", "gridcell");
    button.setAttribute("aria-label", `Mirror at row ${row + 1}, column ${col + 1}, angled ${mirror.orientation === "/" ? "slash" : "backslash"}. Rotate mirror.`);
    button.disabled = levelComplete;
    button.addEventListener("click", () => rotateMirror(mirrorIndex));
    return button;
  }

  if (level.blockers.some((blocker) => blocker.row === row && blocker.col === col)) {
    cell.classList.add("blocker");
    cell.setAttribute("aria-label", "Blocked tile");
    cell.innerHTML = '<span class="blocker-icon" aria-hidden="true">✕</span>';
    return cell;
  }

  cell.setAttribute("aria-label", "Empty tile");
  return cell;
}

function renderBoard() {
  const level = getLevel();
  const fragment = document.createDocumentFragment();
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      fragment.appendChild(createCell(row, col, level));
    }
  }
  boardElement.replaceChildren(fragment);
}

resetButton.addEventListener("click", resetLevel);
nextButton.addEventListener("click", () => {
  if (!levelComplete || levelIndex >= LEVELS.length - 1) return;
  levelIndex++;
  resetLevel();
});

resetLevel();
