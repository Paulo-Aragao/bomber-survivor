// ===================== ENEMIES =====================
let enemies = [];

const ENEMY_TYPES = {
    slime: { color: '#44cc44', hp: 1, speed: 0.8, size: 0.6, xp: 1, moveDelay: 30, spriteId: 1, variants: 5 },
    bat: { color: '#aa44dd', hp: 1, speed: 1.5, size: 0.5, xp: 1, moveDelay: 15, spriteId: 6, variants: 5 },
    skeleton: { color: '#ccccaa', hp: 2, speed: 1, size: 0.65, xp: 2, moveDelay: 22, spriteId: 11, variants: 5 },
    ghost: { color: '#6688ff', hp: 3, speed: 1.2, size: 0.7, xp: 3, moveDelay: 18, spriteId: 16, variants: 5 },
    demon: { color: '#ff3333', hp: 5, speed: 0.6, size: 0.85, xp: 5, moveDelay: 28, spriteId: 21, variants: 8 },
};

function getMaxEnemies() {
    const minutes = gameTime / 3600;
    return MAX_ENEMIES_BASE + Math.floor(minutes * ENEMY_CAP_PER_MIN);
}

function getHPMultiplier() {
    const minutes = gameTime / 3600;
    if (enemies.length >= getMaxEnemies() * 0.9) {
        return 1 + minutes * 0.3; // Scale HP when near cap
    }
    return 1 + Math.max(0, minutes - 10) * 0.15;
}

function spawnEnemy() {
    if (enemies.length >= getMaxEnemies()) return;

    let available = ['slime'];
    if (gameTime > 30 * 60) available.push('bat');
    if (gameTime > 60 * 60) available.push('skeleton');
    if (gameTime > 120 * 60) available.push('ghost');
    if (gameTime > 180 * 60) available.push('demon');

    const typeName = available[Math.floor(Math.random() * available.length)];
    const type = ENEMY_TYPES[typeName];

    // Spawn at edge of screen
    const camX = player.x - canvas.width / 2;
    const camY = player.y - canvas.height / 2;
    let sx, sy;
    const side = Math.floor(Math.random() * 4);
    const margin = TILE * 3;

    switch (side) {
        case 0: sx = camX + Math.random() * canvas.width; sy = camY - margin; break;
        case 1: sx = camX + Math.random() * canvas.width; sy = camY + canvas.height + margin; break;
        case 2: sx = camX - margin; sy = camY + Math.random() * canvas.height; break;
        case 3: sx = camX + canvas.width + margin; sy = camY + Math.random() * canvas.height; break;
    }

    const cgx = Math.max(0, Math.min(MAP_W - 1, Math.floor(sx / TILE)));
    const cgy = Math.max(0, Math.min(MAP_H - 1, Math.floor(sy / TILE)));

    const hpMult = getHPMultiplier();
    const finalHp = Math.ceil(type.hp * hpMult);

    // Random sprite variant
    const variant = Math.floor(Math.random() * type.variants);
    const spriteId = type.spriteId + variant;

    enemies.push({
        gx: cgx, gy: cgy,
        x: cgx * TILE + TILE / 2,
        y: cgy * TILE + TILE / 2,
        targetX: cgx * TILE + TILE / 2,
        targetY: cgy * TILE + TILE / 2,
        type: typeName,
        spriteId: spriteId,
        hp: finalHp,
        maxHp: finalHp,
        moveTimer: Math.floor(Math.random() * type.moveDelay),
        moveDelay: type.moveDelay,
        moving: false,
        flash: 0,
        size: type.size,
        isElite: false,
        frozen: 0,
        burning: 0,
        burnDmg: 0,
    });
}

// ===================== ELITE ENEMIES =====================
let eliteTimer = 0;
const ELITE_SPAWN_INTERVAL = 5400; // ~90 seconds

function spawnElite() {
    let available = ['skeleton'];
    const minutes = gameTime / 3600;
    if (minutes > 2) available.push('ghost');
    if (minutes > 4) available.push('demon');

    const typeName = available[Math.floor(Math.random() * available.length)];
    const type = ENEMY_TYPES[typeName];

    const camX = player.x - canvas.width / 2;
    const camY = player.y - canvas.height / 2;
    const side = Math.floor(Math.random() * 4);
    const margin = TILE * 4;
    let sx, sy;

    switch (side) {
        case 0: sx = camX + Math.random() * canvas.width; sy = camY - margin; break;
        case 1: sx = camX + Math.random() * canvas.width; sy = camY + canvas.height + margin; break;
        case 2: sx = camX - margin; sy = camY + Math.random() * canvas.height; break;
        case 3: sx = camX + canvas.width + margin; sy = camY + Math.random() * canvas.height; break;
    }

    const cgx = Math.max(0, Math.min(MAP_W - 1, Math.floor(sx / TILE)));
    const cgy = Math.max(0, Math.min(MAP_H - 1, Math.floor(sy / TILE)));

    const eliteHp = type.hp * 3 + Math.floor(minutes * 2);

    // Random sprite variant for elite
    const variant = Math.floor(Math.random() * type.variants);
    const spriteId = type.spriteId + variant;

    enemies.push({
        gx: cgx, gy: cgy,
        x: cgx * TILE + TILE / 2,
        y: cgy * TILE + TILE / 2,
        targetX: cgx * TILE + TILE / 2,
        targetY: cgy * TILE + TILE / 2,
        type: typeName,
        spriteId: spriteId,
        hp: eliteHp,
        maxHp: eliteHp,
        moveTimer: 0,
        moveDelay: Math.floor(type.moveDelay * 0.8),
        moving: false,
        flash: 0,
        size: type.size * 1.5,
        isElite: true,
        frozen: 0,
        burning: 0,
        burnDmg: 0,
        eliteGlow: 0,
    });

    // Announce
    screenShake = 6;
    spawnDamageNumber(cgx * TILE + TILE / 2, cgy * TILE, '👑 ELITE!', '#ffcc00');
}

function updateEnemies() {
    // Elite spawn timer
    eliteTimer++;
    if (eliteTimer >= ELITE_SPAWN_INTERVAL && gameTime > 180 * 60) {
        eliteTimer = 0;
        spawnElite();
    }

    for (const en of enemies) {
        const type = ENEMY_TYPES[en.type];
        if (en.flash > 0) en.flash--;
        if (en.isElite) en.eliteGlow = (en.eliteGlow || 0) + 0.05;

        // Freeze
        if (en.frozen && en.frozen > 0) { en.frozen--; continue; }

        // Burn DOT
        if (en.burning && en.burning > 0) {
            en.burning--;
            if (en.burning % 60 === 0 && en.burnDmg) {
                en.hp -= en.burnDmg;
                en.flash = 4;
                spawnDamageNumber(en.x, en.y - TILE * 0.3, '🔥' + en.burnDmg, '#ff6600');
            }
        }

        // Execute
        if (player.execute && en.hp > 0 && en.hp <= en.maxHp * 0.2) {
            en.hp = 0; kills++;
            addKillStreak();
            handleGemDrop(en.x, en.y, ENEMY_TYPES[en.type].xp);
            spawnParticles(en.x, en.y, '#ff00ff', 6, 4);
            spawnDamageNumber(en.x, en.y - TILE * 0.3, 'EXECUTE!', '#ff00ff');
            en.hp = -999;
            continue;
        }

        // Fear aura
        let currentMoveDelay = en.moveDelay;
        if (player.fearAura) {
            const d = Math.hypot(player.x - en.x, player.y - en.y);
            if (d < TILE * (3 + player.fearAura)) {
                currentMoveDelay = Math.floor(en.moveDelay * (1.5 + player.fearAura * 0.5));
            }
        }

        // Grid movement
        en.moveTimer++;
        if (!en.moving && en.moveTimer >= currentMoveDelay) {
            en.moveTimer = 0;
            const pgx = Math.floor(player.x / TILE);
            const pgy = Math.floor(player.y / TILE);
            const diffX = pgx - en.gx;
            const diffY = pgy - en.gy;

            let ngx = en.gx, ngy = en.gy;
            if (Math.abs(diffX) > Math.abs(diffY) || (Math.abs(diffX) === Math.abs(diffY) && Math.random() > 0.5)) {
                ngx += Math.sign(diffX);
            } else {
                ngy += Math.sign(diffY);
            }
            ngx = Math.max(0, Math.min(MAP_W - 1, ngx));
            ngy = Math.max(0, Math.min(MAP_H - 1, ngy));
            en.gx = ngx; en.gy = ngy;
            en.targetX = ngx * TILE + TILE / 2;
            en.targetY = ngy * TILE + TILE / 2;
            en.moving = true;
        }

        // Lerp position
        if (en.moving) {
            const lerpSpeed = 0.15;
            en.x += (en.targetX - en.x) * lerpSpeed;
            en.y += (en.targetY - en.y) * lerpSpeed;
            if (Math.abs(en.x - en.targetX) < 1 && Math.abs(en.y - en.targetY) < 1) {
                en.x = en.targetX; en.y = en.targetY; en.moving = false;
            }
        }

        // Contact damage
        if (player.invincible <= 0) {
            const dist = Math.hypot(player.x - en.x, player.y - en.y);
            if (dist < TILE * 0.5) {
                if (player.shield > 0) {
                    player.shield--;
                    player.invincible = 40;
                    spawnDamageNumber(player.x, player.y - TILE * 0.5, 'BLOCKED!', '#44aaff');
                    spawnParticles(player.x, player.y, '#44aaff', 6, 3);
                } else {
                    const dmg = Math.max(1, 1 - player.armor);
                    player.hp -= dmg;
                    player.invincible = 60;
                    damageFlash = 15;
                    screenShake = 5;
                    spawnDamageNumber(player.x, player.y - TILE * 0.5, '-' + dmg, '#ff4444');
                    triggerScreenFlash('rgba(255, 0, 0, 0.2)', 100);
                    if (player.hp <= 0) { gameOver(); return; }
                }
                // Thorns
                if (player.thorns > 0) {
                    en.hp -= player.thorns;
                    en.flash = 8;
                    spawnDamageNumber(en.x, en.y - TILE * 0.3, '' + player.thorns, '#cc44ff');
                    if (en.hp <= 0) {
                        kills++; addKillStreak();
                        handleGemDrop(en.x, en.y, type.xp);
                        spawnParticles(en.x, en.y, type.color, 8, 4);
                        en.hp = -999;
                    }
                }
            }
        }
    }

    // Remove dead enemies
    for (let i = enemies.length - 1; i >= 0; i--) {
        if (enemies[i].hp <= -999) enemies.splice(i, 1);
    }
}
