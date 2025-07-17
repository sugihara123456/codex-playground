const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const player = {
  x: canvas.width / 2 - 20,
  y: canvas.height - 60,
  width: 40,
  height: 40,
  speed: 5
};

let bullets = [];
let enemies = [];
let keys = {};
let score = 0;
let gameOver = false;

function updateScore() {
  document.getElementById('score').textContent = `Score: ${score}` + (gameOver ? ' GAME OVER' : '');
}

document.addEventListener('keydown', (e) => {
  keys[e.code] = true;
});

document.addEventListener('keyup', (e) => {
  keys[e.code] = false;
});

function spawnEnemy() {
  const size = 40;
  const x = Math.random() * (canvas.width - size);
  const speed = 2 + Math.random() * 2;
  enemies.push({ x, y: -size, width: size, height: size, speed });
}

function shoot() {
  bullets.push({
    x: player.x + player.width / 2 - 5,
    y: player.y,
    width: 10,
    height: 20,
    speed: 7
  });
}

function isColliding(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

let lastEnemySpawn = 0;
function update() {
  if (gameOver) return;

  if (keys['ArrowLeft'] || keys['KeyA']) {
    player.x -= player.speed;
  }
  if (keys['ArrowRight'] || keys['KeyD']) {
    player.x += player.speed;
  }
  player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));

  if (keys['Space'] && !keys['SpacePressed']) {
    shoot();
    keys['SpacePressed'] = true;
  }
  if (!keys['Space']) {
    keys['SpacePressed'] = false;
  }

  bullets.forEach(b => b.y -= b.speed);
  bullets = bullets.filter(b => b.y + b.height > 0);

  if (performance.now() - lastEnemySpawn > 1000) {
    spawnEnemy();
    lastEnemySpawn = performance.now();
  }
  enemies.forEach(e => e.y += e.speed);
  enemies = enemies.filter(e => e.y < canvas.height + e.height);

  bullets.forEach((b, bi) => {
    enemies.forEach((e, ei) => {
      if (isColliding(b, e)) {
        bullets.splice(bi, 1);
        enemies.splice(ei, 1);
        score += 10;
        updateScore();
      }
    });
  });

  enemies.forEach(e => {
    if (isColliding(e, player)) {
      gameOver = true;
      updateScore();
    }
  });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#0ff';
  ctx.fillRect(player.x, player.y, player.width, player.height);

  ctx.fillStyle = '#ff0';
  bullets.forEach(b => ctx.fillRect(b.x, b.y, b.width, b.height));

  ctx.fillStyle = '#f00';
  enemies.forEach(e => ctx.fillRect(e.x, e.y, e.width, e.height));
}

function loop() {
  update();
  draw();
  if (!gameOver) {
    requestAnimationFrame(loop);
  }
}

updateScore();
loop();
