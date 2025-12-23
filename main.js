// Pac-Man Game in HTML Canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');

const tileSize = 16;
const mapRows = 31;
const mapCols = 28;

// 0: empty, 1: wall, 2: dot
const map = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,1,1,1,1,1,1,1,2,2,1,1,2,2,1,1,1,1,1,1,1,1,1,2,1],
  [1,2,1,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,1,2,1],
  [1,2,1,2,1,1,1,2,1,1,1,1,1,1,1,1,1,1,1,2,1,1,1,2,1,2,1,2,1],
  [1,2,2,2,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,2,2,2,2,1],
  [1,1,1,2,1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,1,2,1,1,1,1],
  [1,2,2,2,2,2,1,2,2,2,2,1,1,1,1,1,2,2,2,2,1,2,2,2,2,2,2,1],
  [1,2,1,1,1,2,1,2,1,1,2,2,2,0,0,2,2,1,2,1,2,1,1,1,2,1,2,1],
  [1,2,2,2,1,2,2,2,1,1,2,1,1,1,1,1,2,1,1,2,2,2,1,2,2,2,2,1],
  [1,1,1,2,1,2,1,2,1,2,2,2,2,2,2,2,2,2,2,1,2,1,2,1,2,1,1,1],
  [1,2,2,2,1,2,1,2,1,1,1,1,1,1,1,1,1,1,1,1,2,1,2,1,2,2,2,1],
  [1,2,1,1,1,2,1,2,2,2,2,2,2,2,2,2,2,2,2,2,1,2,1,1,1,2,1,1],
  [1,2,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

let score = 0;
// Place Pac-Man at a walkable tile (not inside a wall)
let pacman = { x: 1, y: 1, dx: 0, dy: 0, nextDx: 0, nextDy: 0 };
let ghost = { x: 13, y: 11, dx: 1, dy: 0 };

function drawMap() {
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      if (map[y][x] === 1) {
        ctx.fillStyle = '#1976d2';
        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
      } else if (map[y][x] === 2) {
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(x * tileSize + tileSize/2, y * tileSize + tileSize/2, 2, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  }
}

function drawPacman() {
  ctx.fillStyle = 'yellow';
  ctx.beginPath();
  ctx.arc(pacman.x * tileSize + tileSize/2, pacman.y * tileSize + tileSize/2, tileSize/2-1, 0.25 * Math.PI, 1.75 * Math.PI);
  ctx.lineTo(pacman.x * tileSize + tileSize/2, pacman.y * tileSize + tileSize/2);
  ctx.fill();
}

function drawGhost() {
  ctx.save();
  ctx.fillStyle = 'red';
  ctx.beginPath();
  ctx.arc(ghost.x * tileSize + tileSize/2, ghost.y * tileSize + tileSize/2, tileSize/2-1, 0, 2 * Math.PI);
  ctx.fill();
  // Eyes
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(ghost.x * tileSize + tileSize/2 - 3, ghost.y * tileSize + tileSize/2 - 2, 2, 0, 2 * Math.PI);
  ctx.arc(ghost.x * tileSize + tileSize/2 + 3, ghost.y * tileSize + tileSize/2 - 2, 2, 0, 2 * Math.PI);
  ctx.fill();
  ctx.restore();
}

function movePacman() {
  // Check for wall in next direction
  if (canMove(pacman.x + pacman.nextDx, pacman.y + pacman.nextDy)) {
    pacman.dx = pacman.nextDx;
    pacman.dy = pacman.nextDy;
  }
  // Move Pac-Man if possible
  let newX = pacman.x + pacman.dx;
  let newY = pacman.y + pacman.dy;
  // Wrap around horizontally
  if (newX < 0) newX = map[0].length - 1;
  if (newX >= map[0].length) newX = 0;
  // Wrap around vertically
  if (newY < 0) newY = map.length - 1;
  if (newY >= map.length) newY = 0;
  if (canMove(newX, newY)) {
    pacman.x = newX;
    pacman.y = newY;
  }
  // Eat dot
  if (map[pacman.y][pacman.x] === 2) {
    map[pacman.y][pacman.x] = 0;
    score += 10;
    scoreEl.textContent = 'Score: ' + score;
  }
}

function moveGhost() {
  // Simple AI: move in current direction, turn if hit wall
  if (!canMove(ghost.x + ghost.dx, ghost.y + ghost.dy)) {
    // Try a random new direction
    const dirs = [
      {dx:1,dy:0},{dx:-1,dy:0},{dx:0,dy:1},{dx:0,dy:-1}
    ];
    const valid = dirs.filter(d => canMove(ghost.x + d.dx, ghost.y + d.dy));
    if (valid.length > 0) {
      const pick = valid[Math.floor(Math.random()*valid.length)];
      ghost.dx = pick.dx;
      ghost.dy = pick.dy;
    }
  }
  if (canMove(ghost.x + ghost.dx, ghost.y + ghost.dy)) {
    ghost.x += ghost.dx;
    ghost.y += ghost.dy;
  }
}

function canMove(x, y) {
  return map[y] && map[y][x] !== undefined && map[y][x] !== 1;
}

function checkGameOver() {
  if (pacman.x === ghost.x && pacman.y === ghost.y) {
    alert('Game Over! Final Score: ' + score);
    document.location.reload();
  }
}

let lastUpdate = 0;
const GAME_SPEED = 120; // ms per update (lower is faster)

function gameLoop(timestamp) {
  if (!lastUpdate || timestamp - lastUpdate > GAME_SPEED) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMap();
    drawPacman();
    drawGhost();
    movePacman();
    moveGhost();
    checkGameOver();
    lastUpdate = timestamp;
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMap();
    drawPacman();
    drawGhost();
  }
  requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowUp')    { pacman.nextDx = 0; pacman.nextDy = -1; }
  if (e.key === 'ArrowDown')  { pacman.nextDx = 0; pacman.nextDy = 1; }
  if (e.key === 'ArrowLeft')  { pacman.nextDx = -1; pacman.nextDy = 0; }
  if (e.key === 'ArrowRight') { pacman.nextDx = 1; pacman.nextDy = 0; }
});

requestAnimationFrame(gameLoop);
