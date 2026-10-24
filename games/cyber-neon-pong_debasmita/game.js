const canvas = document.getElementById("pongCanvas");
const ctx = canvas.getContext("2d");

const playerScoreElem = document.getElementById("player-score");
const aiScoreElem = document.getElementById("ai-score");

const paddleWidth = 12;
const paddleHeight = 70;
let playerY = canvas.height / 2 - paddleHeight / 2;
let aiY = canvas.height / 2 - paddleHeight / 2;

let playerScore = 0;
let aiScore = 0;

let ballX = canvas.width / 2;
let ballY = canvas.height / 2;
let ballRadius = 8;
let ballSpeedX = 4;
let ballSpeedY = 3;

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseY = e.clientY - rect.top;
  playerY = mouseY - paddleHeight / 2;
  if (playerY < 0) playerY = 0;
  if (playerY > canvas.height - paddleHeight) playerY = canvas.height - paddleHeight;
});

function resetBall() {
  ballX = canvas.width / 2;
  ballY = canvas.height / 2;
  ballSpeedX = -ballSpeedX;
  ballSpeedY = (Math.random() - 0.5) * 6;
}

function update() {
  ballX += ballSpeedX;
  ballY += ballSpeedY;

  // Ball bounce ceiling & floor
  if (ballY - ballRadius < 0 || ballY + ballRadius > canvas.height) {
    ballSpeedY = -ballSpeedY;
  }

  // Simple AI tracking
  const aiCenter = aiY + paddleHeight / 2;
  if (aiCenter < ballY - 10) {
    aiY += 3.5;
  } else if (aiCenter > ballY + 10) {
    aiY -= 3.5;
  }
  if (aiY < 0) aiY = 0;
  if (aiY > canvas.height - paddleHeight) aiY = canvas.height - paddleHeight;

  // Player paddle collision
  if (ballX - ballRadius < 25 && ballY > playerY && ballY < playerY + paddleHeight) {
    ballSpeedX = -ballSpeedX * 1.05;
    ballX = 25 + ballRadius;
  }

  // AI paddle collision
  if (ballX + ballRadius > canvas.width - 25 && ballY > aiY && ballY < aiY + paddleHeight) {
    ballSpeedX = -ballSpeedX * 1.05;
    ballX = canvas.width - 25 - ballRadius;
  }

  // Scoring
  if (ballX < 0) {
    aiScore++;
    aiScoreElem.textContent = aiScore;
    resetBall();
  } else if (ballX > canvas.width) {
    playerScore++;
    playerScoreElem.textContent = playerScore;
    resetBall();
  }
}

function draw() {
  ctx.fillStyle = "#0d1322";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Center net line
  ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();
  ctx.setLineDash([]);

  // Player paddle
  ctx.fillStyle = "#38bdf8";
  ctx.shadowColor = "#38bdf8";
  ctx.shadowBlur = 10;
  ctx.fillRect(15, playerY, paddleWidth, paddleHeight);

  // AI paddle
  ctx.fillStyle = "#f43f5e";
  ctx.shadowColor = "#f43f5e";
  ctx.shadowBlur = 10;
  ctx.fillRect(canvas.width - 15 - paddleWidth, aiY, paddleWidth, paddleHeight);

  // Ball
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "#ffffff";
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
