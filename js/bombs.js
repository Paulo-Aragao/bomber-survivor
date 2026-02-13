// ===================== BOMBS =====================
let bombs = [];
let explosions = [];

function placeBomb() {
    // Ammo check only
    if (bombs.filter(b => !b.exploded).length >= player.bombMax) return;

    const gx = Math.floor(player.x / TILE);
    const gy = Math.floor(player.y / TILE);

    const existing = bombs.find(b => b.gx === gx && b.gy === gy && !b.exploded);
    if (existing) return;

    bombs.push({
        gx, gy,
        timer: player.bombTimer,
        maxTimer: player.bombTimer,
        range: player.bombRange,
        shape: player.bombShape,
        gravity: player.gravityBombs || false,
        exploded: false,
        pulseAnim: 0,
        element: player.element || null // Elemento do personagem
    });

    // Play elemental bomb place sound
    playBombPlaceSound(player.element);
}

function getExplosionTiles(cx, cy, range, shape) {
    const tiles = [{ gx: cx, gy: cy }];
    const addTile = (x, y) => {
        if (x >= 0 && x < MAP_W && y >= 0 && y < MAP_H) {
            if (!tiles.some(t => t.gx === x && t.gy === y)) {
                tiles.push({ gx: x, gy: y });
            }
        }
    };

    if (shape === 'cross') {
        const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];
        for (const [dx, dy] of dirs) for (let i = 1; i <= range; i++) addTile(cx + dx * i, cy + dy * i);
    } else if (shape === 'circle') {
        for (let dy = -range; dy <= range; dy++)
            for (let dx = -range; dx <= range; dx++) {
                if (dx === 0 && dy === 0) continue;
                if (Math.sqrt(dx * dx + dy * dy) <= range + 0.5) addTile(cx + dx, cy + dy);
            }
    } else if (shape === 'xshape') {
        const dirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
        for (const [dx, dy] of dirs) for (let i = 1; i <= range; i++) addTile(cx + dx * i, cy + dy * i);
    } else if (shape === 'line') {
        for (let i = -range; i <= range; i++) { if (i === 0) continue; addTile(cx + i, cy); addTile(cx, cy + i); }
    } else if (shape === 'star') {
        const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0], [-1, -1], [-1, 1], [1, -1], [1, 1]];
        for (const [dx, dy] of dirs) for (let i = 1; i <= range; i++) addTile(cx + dx * i, cy + dy * i);
    } else if (shape === 'full') {
        for (let dy = -range; dy <= range; dy++)
            for (let dx = -range; dx <= range; dx++) {
                if (dx === 0 && dy === 0) continue;
                addTile(cx + dx, cy + dy);
            }
    }
    return tiles;
}

function explodeBomb(bomb) {
    const tiles = getExplosionTiles(bomb.gx, bomb.gy, bomb.range, bomb.shape);
    for (const t of tiles) {
        explosions.push({
            gx: t.gx, gy: t.gy,
            timer: 30,
            isCenter: (t.gx === bomb.gx && t.gy === bomb.gy),
            element: bomb.element || null // Pass element to explosion
        });
    }
    screenShake = 14;

    // Juice: white flash + hit stop on explosion
    triggerWhiteFlash();
    triggerHitStop(3); // ~50ms

    // Play elemental explosion sound
    playExplosionSound(bomb.element);
}

function updateBombs() {
    for (let i = bombs.length - 1; i >= 0; i--) {
        const b = bombs[i];
        b.timer--;
        b.pulseAnim += 0.15;

        // Gravity bombs: pull enemies toward bomb before exploding
        if (b.gravity && b.timer < b.maxTimer * 0.4) {
            const bx = b.gx * TILE + TILE / 2;
            const by = b.gy * TILE + TILE / 2;
            const pullRange = TILE * (b.range + 1);
            for (const en of enemies) {
                const dist = Math.hypot(en.x - bx, en.y - by);
                if (dist < pullRange && dist > TILE * 0.5) {
                    const angle = Math.atan2(by - en.y, bx - en.x);
                    const pullForce = 1.5;
                    en.x += Math.cos(angle) * pullForce;
                    en.y += Math.sin(angle) * pullForce;
                    en.targetX = en.x;
                    en.targetY = en.y;
                    en.gx = Math.floor(en.x / TILE);
                    en.gy = Math.floor(en.y / TILE);
                }
            }
        }

        // Wind spin: rotate explosion shape
        if (b.windSpin) {
            b.spinAngle += 0.03;
        }

        if (b.timer <= 0) {
            explodeBomb(b);
            bombs.splice(i, 1);

            // Chain explosion
            if (player.chainExplosion) {
                for (let k = bombs.length - 1; k >= 0; k--) {
                    const ob = bombs[k];
                    const chainDist = Math.abs(ob.gx - b.gx) + Math.abs(ob.gy - b.gy);
                    if (chainDist <= b.range) ob.timer = 1;
                }
            }
        }
    }
}

function updateExplosions() {
    for (let i = explosions.length - 1; i >= 0; i--) {
        const e = explosions[i];
        e.timer--;

        if (e.timer > 20) {
            // Damage enemies
            for (let j = enemies.length - 1; j >= 0; j--) {
                const en = enemies[j];
                const enGx = Math.floor(en.x / TILE);
                const enGy = Math.floor(en.y / TILE);
                if (enGx === e.gx && enGy === e.gy) {
                    let dmg = 1 + player.piercing;
                    const isCrit = player.critChance > 0 && Math.random() < player.critChance;
                    if (isCrit) { dmg *= 2; triggerCritFlash(); }
                    en.hp -= dmg;
                    en.flash = 8;

                    if (player.freezeChance > 0 && Math.random() < player.freezeChance) en.frozen = 120;
                    if (player.burnDamage > 0) { en.burning = 180; en.burnDmg = player.burnDamage; }

                    spawnDamageNumber(en.x, en.y - TILE * 0.3, (isCrit ? 'CRIT ' : '') + dmg, isCrit ? '#ff44ff' : '#ffaa00');

                    if (en.hp <= 0) {
                        handleEnemyKill(en, j);
                    }
                }
            }

            // Damage player
            if (player.invincible <= 0) {
                const pgx = Math.floor(player.x / TILE);
                const pgy = Math.floor(player.y / TILE);
                if (pgx === e.gx && pgy === e.gy) {
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
                        screenShake = 10;
                        spawnDamageNumber(player.x, player.y - TILE * 0.5, 'OUCH!', '#ff4444');

                        // Play hit sound
                        playHitSound();

                        if (player.hp <= 0) { gameOver(); return; }
                    }
                }
            }
        }

        if (e.timer <= 0) explosions.splice(i, 1);
    }
}

function handleEnemyKill(en, index) {
    kills++;
    addKillStreak();
    const type = ENEMY_TYPES[en.type];

    // Dharc: Vampirism - Chance to heal on kill
    if (player.vampirism > 0) {
        // player.vampirism is now a chance (e.g., 0.1 for 10%)
        if (Math.random() < player.vampirism && player.hp < player.maxHp) {
            const healAmt = 1;
            player.hp = Math.min(player.maxHp, player.hp + healAmt);
            spawnDamageNumber(player.x, player.y - TILE * 0.5, `+${healAmt} HP`, '#8B008B');
            spawnParticles(player.x, player.y, '#8B008B', 8, 4);
        }
    }

    // Drop XP (or bank it)
    if (en.isElite) {
        // Elite drops chest (triggers 2-perk choice)
        spawnChestDrop(en.x, en.y);
        spawnParticles(en.x, en.y, '#ffcc00', 15, 6);
        triggerHitStop(5);
        triggerScreenFlash('rgba(255, 200, 0, 0.25)', 120);
    } else {
        handleGemDrop(en.x, en.y, type.xp);
    }

    // Lucky drops
    for (let ld = 0; ld < player.luckyDrop; ld++) {
        if (Math.random() < 0.5) handleGemDrop(en.x + (Math.random() - 0.5) * TILE, en.y + (Math.random() - 0.5) * TILE, 1);
    }

    // Bomb on kill
    if (player.bombOnKill) {
        const enGx = Math.floor(en.x / TILE);
        const enGy = Math.floor(en.y / TILE);
        const miniTiles = getExplosionTiles(enGx, enGy, 1, 'cross');
        for (const mt of miniTiles) explosions.push({ gx: mt.gx, gy: mt.gy, timer: 20, isCenter: false });
    }

    // Death particles with squash pop
    spawnParticles(en.x, en.y, type.color, 10, 5);
    // Pop effect: big particle at death location
    particles.push({
        x: en.x, y: en.y,
        vx: 0, vy: 0,
        life: 12, maxLife: 12,
        color: '#ffffff',
        size: TILE * en.size * 0.4,
    });

    enemies.splice(index, 1);
}

// Chest drop tracking
let chestDrops = [];

function spawnChestDrop(x, y) {
    chestDrops.push({
        x, y,
        lifetime: 600, // 10s
        bob: 0,
    });
}
