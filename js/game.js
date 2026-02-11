// ===================== CANVAS =====================
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ===================== GAME STATE =====================
let gameRunning = false;
let gamePaused = false;
let gameTime = 0;
let kills = 0;
let screenShake = 0;
let damageFlash = 0;
let highScore = parseInt(localStorage.getItem('bomberVampireHighScore') || '0');

// ===================== GAME OVER =====================
function gameOver() {
    gameRunning = false;
    document.getElementById('gameover-overlay').classList.add('active');
    const totalSeconds = Math.floor(gameTime / 60);
    const mins = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const secs = (totalSeconds % 60).toString().padStart(2, '0');
    document.getElementById('go-time').textContent = `⏱️ Survived: ${mins}:${secs}`;
    document.getElementById('go-kills').textContent = `💀 Kills: ${kills}`;
    document.getElementById('go-level').textContent = `⭐ Level: ${player.level}`;

    const score = totalSeconds * 10 + kills * 5 + player.level * 20;
    const isNew = score > highScore;
    if (isNew) {
        highScore = score;
        localStorage.setItem('bomberVampireHighScore', highScore.toString());
    }
    document.getElementById('go-highscore').textContent = `🏆 High Score: ${highScore}${isNew ? ' NEW!' : ''}`;
}

// ===================== UPDATE =====================
function update() {
    if (!gameRunning || gamePaused) return;

    // Hit stop: freeze frames
    if (hitStopFrames > 0) {
        hitStopFrames--;
        return;
    }

    gameTime++;

    updatePlayer();
    updateBombs();
    updateExplosions();
    updateEnemies();
    updateGems();
    updateParticles();
    updateDamageNumbers();
    updateWaves();
    updateKillStreak();

    // Storm perk
    if (player.stormLevel && player.stormLevel > 0 && gameTime % 300 === 0) {
        for (let s = 0; s < player.stormLevel; s++) {
            if (enemies.length > 0) {
                const target = enemies[Math.floor(Math.random() * enemies.length)];
                target.hp -= 3;
                target.flash = 15;
                spawnDamageNumber(target.x, target.y - TILE * 0.5, '⚡3', '#88eeff');
                spawnParticles(target.x, target.y, '#88eeff', 8, 5);
                screenShake = 4;
                triggerScreenFlash('rgba(100, 200, 255, 0.15)', 80);
                if (target.hp <= 0) {
                    kills++; addKillStreak();
                    handleGemDrop(target.x, target.y, ENEMY_TYPES[target.type].xp);
                    spawnParticles(target.x, target.y, ENEMY_TYPES[target.type].color, 8, 4);
                    target.hp = -999;
                }
            }
        }
    }

    // Screen shake decay
    if (screenShake > 0) screenShake *= 0.85;
}

// ===================== HUD =====================
function updateHUD() {
    document.getElementById('hp-bar').style.width = `${(player.hp / player.maxHp) * 100}%`;
    document.getElementById('xp-bar').style.width = `${(player.xp / player.xpNeeded) * 100}%`;
    document.getElementById('level-display').textContent = `LV ${player.level}`;
    document.getElementById('kills').textContent = kills;

    const totalSeconds = Math.floor(gameTime / 60);
    const mins = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const secs = (totalSeconds % 60).toString().padStart(2, '0');
    document.getElementById('timer').textContent = `${mins}:${secs}`;

    const activeBombs = bombs.length;
    document.getElementById('bomb-count').textContent = `💣 ${player.bombMax - activeBombs}/${player.bombMax}`;

    const cdPct = player.bombCooldown > 0 ? (1 - player.bombCooldown / player.bombCooldownMax) * 100 : 100;
    document.getElementById('bomb-cooldown-bar').style.width = `${cdPct}%`;
}

// ===================== PAUSE SYSTEM =====================
function pauseGame() {
    if (!gameRunning || gamePaused) return;
    gamePaused = true;
    selectedPauseOption = 0;
    document.getElementById('pause-overlay').classList.add('active');
    updatePauseSelection();
}

function resumeGame() {
    gamePaused = false;
    document.getElementById('pause-overlay').classList.remove('active');
}

function returnToCharSelect() {
    gameRunning = false;
    gamePaused = false;
    document.getElementById('pause-overlay').classList.remove('active');
    document.getElementById('start-overlay').classList.remove('hidden');
    selectedChar = 0;
    updateCharSelection();
}

// ===================== GAME LOOP =====================
function gameLoop() {
    // Handle Space hold for menu confirmations
    handleSpaceHold();

    update();
    render();
    requestAnimationFrame(gameLoop);
}

// ===================== START GAME =====================
function startGame() {
    document.getElementById('start-overlay').classList.add('hidden');
    document.getElementById('gameover-overlay').classList.remove('active');
    document.getElementById('levelup-overlay').classList.remove('active');

    initPlayer();
    bombs = [];
    explosions = [];
    enemies = [];
    gems = [];
    particles = [];
    damageNumbers = [];
    chestDrops = [];
    xpBank = 0;
    gameTime = 0;
    kills = 0;
    killStreak = 0;
    killStreakTimer = 0;
    spawnTimer = 0;
    spawnRate = 90;
    screenShake = 0;
    damageFlash = 0;
    hitStopFrames = 0;
    eliteTimer = 0;
    gamePaused = false;
    gameRunning = true;
}

// ===================== INIT CHARACTER SELECT =====================
function initCharSelect() {
    const container = document.getElementById('char-select');
    container.innerHTML = '';
    CHARACTERS.forEach((char, idx) => {
        const card = document.createElement('div');
        card.className = 'char-card' + (idx === 0 ? ' selected' : '');
        card.innerHTML = `
            <div class="char-icon">${char.icon}</div>
            <div class="char-name">${char.name}</div>
            <div class="char-desc">${char.desc}</div>
            <div class="char-stats">${char.stats}</div>
        `;
        card.addEventListener('click', () => {
            selectedChar = idx;
            updateCharSelection();
        });
        card.addEventListener('dblclick', () => {
            selectedChar = idx;
            updateCharSelection();
            startGame();
        });
        container.appendChild(card);
    });
}

// Show high score on start screen
if (highScore > 0) {
    document.getElementById('start-highscore').textContent = `🏆 High Score: ${highScore}`;
}

initCharSelect();
gameLoop();
