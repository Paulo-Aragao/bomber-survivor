// ===================== ENEMY SYSTEM =====================
class EnemySystem {
    constructor(scene) {
        this.scene = scene;
        this.enemies = [];
        this.eliteTimer = 0;
        this.enemyGraphics = null;
    }

    create() {
        this.enemyGraphics = this.scene.add.graphics().setDepth(200);
    }

    getMaxEnemies(gameTime) {
        const minutes = gameTime / 3600;
        return MAX_ENEMIES_BASE + Math.floor(minutes * ENEMY_CAP_PER_MIN);
    }

    getHPMultiplier(gameTime) {
        const minutes = gameTime / 3600;
        const w = CONFIG ? CONFIG.balance.waves : null;
        const nearCapThreshold = w ? w.nearCapThreshold : 0.9;
        const hpScaleNearCap = w ? w.hpScaleNearCap : 0.3;
        const hpScalePostMinute = w ? w.hpScalePostMinute : 10;
        const hpScaleRate = w ? w.hpScaleRate : 0.15;

        if (this.enemies.length >= this.getMaxEnemies(gameTime) * nearCapThreshold) {
            return 1 + minutes * hpScaleNearCap;
        }
        return 1 + Math.max(0, minutes - hpScalePostMinute) * hpScaleRate;
    }

    getAvailableEnemies(gameTime) {
        if (CONFIG && CONFIG.enemies.unlockSchedule) {
            const timeSeconds = gameTime / 60;
            return CONFIG.enemies.unlockSchedule
                .filter(entry => timeSeconds >= entry.timeSeconds)
                .map(entry => entry.type);
        }
        // Fallback
        let available = ['slime'];
        if (gameTime > 30 * 60) available.push('bat');
        if (gameTime > 60 * 60) available.push('skeleton');
        if (gameTime > 120 * 60) available.push('ghost');
        if (gameTime > 180 * 60) available.push('demon');
        return available;
    }

    getAvailableElites(gameTime) {
        const minutes = gameTime / 3600;
        if (CONFIG && CONFIG.enemies.eliteUnlockSchedule) {
            return CONFIG.enemies.eliteUnlockSchedule
                .filter(entry => minutes >= entry.minutes)
                .map(entry => entry.type);
        }
        // Fallback
        let available = ['skeleton'];
        if (minutes > 2) available.push('ghost');
        if (minutes > 4) available.push('demon');
        return available;
    }

    spawnEnemy(gameTime) {
        if (this.enemies.length >= this.getMaxEnemies(gameTime)) return;

        const available = this.getAvailableEnemies(gameTime);
        if (available.length === 0) return;

        const typeName = available[Math.floor(Math.random() * available.length)];
        const type = ENEMY_TYPES[typeName];

        const camera = this.scene.cameras.main;
        const camX = camera.scrollX;
        const camY = camera.scrollY;
        const camW = camera.width;
        const camH = camera.height;

        let sx, sy;
        const side = Math.floor(Math.random() * 4);
        const margin = TILE * 3;

        switch (side) {
            case 0: sx = camX + Math.random() * camW; sy = camY - margin; break;
            case 1: sx = camX + Math.random() * camW; sy = camY + camH + margin; break;
            case 2: sx = camX - margin; sy = camY + Math.random() * camH; break;
            case 3: sx = camX + camW + margin; sy = camY + Math.random() * camH; break;
        }

        const cgx = Math.max(0, Math.min(MAP_W - 1, Math.floor(sx / TILE)));
        const cgy = Math.max(0, Math.min(MAP_H - 1, Math.floor(sy / TILE)));

        const hpMult = this.getHPMultiplier(gameTime);
        const finalHp = Math.ceil(type.hp * hpMult);

        const variant = Math.floor(Math.random() * type.variants);
        const spriteId = type.spriteId + variant;

        // Create sprite
        const spriteKey = 'enemy_' + spriteId;
        let sprite = null;
        if (this.scene.textures.exists(spriteKey)) {
            sprite = this.scene.add.image(cgx * TILE + TILE / 2, cgy * TILE + TILE / 2, spriteKey);
            sprite.setDisplaySize(TILE * type.size, TILE * type.size);
            sprite.setDepth(200);
        }

        this.enemies.push({
            gx: cgx, gy: cgy,
            x: cgx * TILE + TILE / 2,
            y: cgy * TILE + TILE / 2,
            targetX: cgx * TILE + TILE / 2,
            targetY: cgy * TILE + TILE / 2,
            type: typeName,
            spriteId: spriteId,
            sprite: sprite,
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

    spawnElite(gameTime) {
        const available = this.getAvailableElites(gameTime);
        if (available.length === 0) return;

        const typeName = available[Math.floor(Math.random() * available.length)];
        const type = ENEMY_TYPES[typeName];
        const minutes = gameTime / 3600;

        const elite = CONFIG ? CONFIG.balance.elite : {};
        const hpMult = elite.hpMultiplier || 3;
        const hpPerMin = elite.hpPerMinute || 2;
        const sizeMult = elite.sizeMultiplier || 1.5;
        const moveDelayMult = elite.moveDelayMultiplier || 0.8;

        const camera = this.scene.cameras.main;
        const camX = camera.scrollX;
        const camY = camera.scrollY;
        const camW = camera.width;
        const camH = camera.height;
        const side = Math.floor(Math.random() * 4);
        const margin = TILE * 4;
        let sx, sy;

        switch (side) {
            case 0: sx = camX + Math.random() * camW; sy = camY - margin; break;
            case 1: sx = camX + Math.random() * camW; sy = camY + camH + margin; break;
            case 2: sx = camX - margin; sy = camY + Math.random() * camH; break;
            case 3: sx = camX + camW + margin; sy = camY + Math.random() * camH; break;
        }

        const cgx = Math.max(0, Math.min(MAP_W - 1, Math.floor(sx / TILE)));
        const cgy = Math.max(0, Math.min(MAP_H - 1, Math.floor(sy / TILE)));
        const eliteHp = type.hp * hpMult + Math.floor(minutes * hpPerMin);

        const variant = Math.floor(Math.random() * type.variants);
        const spriteId = type.spriteId + variant;

        const spriteKey = 'enemy_' + spriteId;
        let sprite = null;
        if (this.scene.textures.exists(spriteKey)) {
            sprite = this.scene.add.image(cgx * TILE + TILE / 2, cgy * TILE + TILE / 2, spriteKey);
            sprite.setDisplaySize(TILE * type.size * sizeMult, TILE * type.size * sizeMult);
            sprite.setDepth(200);
        }

        this.enemies.push({
            gx: cgx, gy: cgy,
            x: cgx * TILE + TILE / 2,
            y: cgy * TILE + TILE / 2,
            targetX: cgx * TILE + TILE / 2,
            targetY: cgy * TILE + TILE / 2,
            type: typeName,
            spriteId: spriteId,
            sprite: sprite,
            hp: eliteHp,
            maxHp: eliteHp,
            moveTimer: 0,
            moveDelay: Math.floor(type.moveDelay * moveDelayMult),
            moving: false,
            flash: 0,
            size: type.size * sizeMult,
            isElite: true,
            frozen: 0,
            burning: 0,
            burnDmg: 0,
            eliteGlow: 0,
        });

        const juice = this.scene.juiceSystem;
        if (juice) {
            juice.screenShake = 6;
            juice.spawnDamageNumber(cgx * TILE + TILE / 2, cgy * TILE, '\ud83d\udc51 ELITE!', '#ffcc00');
        }
    }

    handleEnemyKill(en, index) {
        const scene = this.scene;
        const p = scene.playerSystem.stats;
        const juice = scene.juiceSystem;
        const type = ENEMY_TYPES[en.type];

        scene.registry.set('kills', (scene.registry.get('kills') || 0) + 1);
        if (juice) juice.addKillStreak();

        // Vampirism
        if (p.vampirism > 0) {
            const healAmt = Math.ceil(p.maxHp * p.vampirism);
            p.hp = Math.min(p.maxHp, p.hp + healAmt);
            if (juice) {
                juice.spawnDamageNumber(p.x, p.y - TILE * 0.5, `+${healAmt} HP`, '#8B008B');
                juice.spawnParticles(p.x, p.y, 0x8B008B, 8, 4);
            }
        }

        // Drop XP or chest
        const hitStopElite = CONFIG ? CONFIG.balance.juice.hitStopElite : 5;
        if (en.isElite) {
            if (scene.gemSystem) scene.gemSystem.spawnChestDrop(en.x, en.y);
            if (juice) {
                juice.spawnParticles(en.x, en.y, 0xffcc00, 15, 6);
                juice.triggerHitStop(hitStopElite);
                juice.triggerScreenFlash('rgba(255, 200, 0, 0.25)', 120);
            }
        } else {
            if (scene.gemSystem) scene.gemSystem.handleGemDrop(en.x, en.y, type.xp);
        }

        // Lucky drops
        for (let ld = 0; ld < p.luckyDrop; ld++) {
            if (Math.random() < 0.5 && scene.gemSystem) {
                scene.gemSystem.handleGemDrop(
                    en.x + (Math.random() - 0.5) * TILE,
                    en.y + (Math.random() - 0.5) * TILE, 1);
            }
        }

        // Bomb on kill
        if (p.bombOnKill && scene.bombSystem) {
            const enGx = Math.floor(en.x / TILE);
            const enGy = Math.floor(en.y / TILE);
            const miniTiles = scene.bombSystem.getExplosionTiles(enGx, enGy, 1, 'cross');
            for (const mt of miniTiles) {
                scene.bombSystem.explosions.push({ gx: mt.gx, gy: mt.gy, timer: 20, isCenter: false, element: null });
            }
        }

        // Death particles
        if (juice) {
            juice.spawnParticles(en.x, en.y, Phaser.Display.Color.HexStringToColor(type.color).color, 10, 5);
        }

        // Destroy sprite
        if (en.sprite) en.sprite.destroy();
        this.enemies.splice(index, 1);
    }

    update(gameTime) {
        const p = this.scene.playerSystem.stats;
        const juice = this.scene.juiceSystem;
        const combat = CONFIG ? CONFIG.balance.combat : {};
        const fear = CONFIG ? CONFIG.balance.fearAura : {};
        const lerpSpeed = CONFIG ? CONFIG.balance.enemyMovement.lerpSpeed : 0.15;
        const contactRange = combat.contactRange || 0.5;
        const executeThreshold = combat.executeThreshold || 0.2;
        const eliteMinSeconds = CONFIG ? CONFIG.balance.elite.minSeconds : 180;

        // Elite spawn timer
        this.eliteTimer++;
        if (this.eliteTimer >= ELITE_SPAWN_INTERVAL && gameTime > eliteMinSeconds * 60) {
            this.eliteTimer = 0;
            this.spawnElite(gameTime);
        }

        for (const en of this.enemies) {
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
                    if (juice) juice.spawnDamageNumber(en.x, en.y - TILE * 0.3, '\ud83d\udd25' + en.burnDmg, '#ff6600');
                }
            }

            // Execute
            if (p.execute && en.hp > 0 && en.hp <= en.maxHp * executeThreshold) {
                this.scene.registry.set('kills', (this.scene.registry.get('kills') || 0) + 1);
                if (juice) {
                    juice.addKillStreak();
                    juice.spawnParticles(en.x, en.y, 0xff00ff, 6, 4);
                    juice.spawnDamageNumber(en.x, en.y - TILE * 0.3, 'EXECUTE!', '#ff00ff');
                }
                if (this.scene.gemSystem) this.scene.gemSystem.handleGemDrop(en.x, en.y, type.xp);
                if (en.sprite) en.sprite.destroy();
                en.hp = -999;
                continue;
            }

            // Fear aura
            let currentMoveDelay = en.moveDelay;
            if (p.fearAura) {
                const fearBaseRange = fear.baseRange || 3;
                const fearBaseMult = fear.baseMultiplier || 1.5;
                const fearPerLevel = fear.perLevelMultiplier || 0.5;
                const d = Math.hypot(p.x - en.x, p.y - en.y);
                if (d < TILE * (fearBaseRange + p.fearAura)) {
                    currentMoveDelay = Math.floor(en.moveDelay * (fearBaseMult + p.fearAura * fearPerLevel));
                }
            }

            // Grid movement
            en.moveTimer++;
            if (!en.moving && en.moveTimer >= currentMoveDelay) {
                en.moveTimer = 0;
                const pgx = Math.floor(p.x / TILE);
                const pgy = Math.floor(p.y / TILE);
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
                en.x += (en.targetX - en.x) * lerpSpeed;
                en.y += (en.targetY - en.y) * lerpSpeed;
                if (Math.abs(en.x - en.targetX) < 1 && Math.abs(en.y - en.targetY) < 1) {
                    en.x = en.targetX; en.y = en.targetY; en.moving = false;
                }
            }

            // Update sprite position
            if (en.sprite) {
                en.sprite.setPosition(en.x, en.y);
                // Flash effect
                if (en.flash > 0) {
                    en.sprite.setTint(0xffffff);
                    en.sprite.setAlpha(0.7);
                } else if (en.frozen > 0) {
                    en.sprite.setTint(0x88ddff);
                } else {
                    en.sprite.clearTint();
                    en.sprite.setAlpha(1);
                }
            }

            // Contact damage
            if (p.invincible <= 0) {
                const dist = Math.hypot(p.x - en.x, p.y - en.y);
                if (dist < TILE * contactRange) {
                    const dead = this.scene.playerSystem.takeDamage(1);
                    if (dead) return;

                    // Thorns
                    if (p.thorns > 0) {
                        en.hp -= p.thorns;
                        en.flash = 8;
                        if (juice) juice.spawnDamageNumber(en.x, en.y - TILE * 0.3, '' + p.thorns, '#cc44ff');
                        if (en.hp <= 0) {
                            this.scene.registry.set('kills', (this.scene.registry.get('kills') || 0) + 1);
                            if (juice) juice.addKillStreak();
                            if (this.scene.gemSystem) this.scene.gemSystem.handleGemDrop(en.x, en.y, type.xp);
                            if (juice) juice.spawnParticles(en.x, en.y, Phaser.Display.Color.HexStringToColor(type.color).color, 8, 4);
                            en.hp = -999;
                        }
                    }
                }
            }
        }

        // Remove dead enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            if (this.enemies[i].hp <= -999) {
                if (this.enemies[i].sprite) this.enemies[i].sprite.destroy();
                this.enemies.splice(i, 1);
            }
        }
    }

    render(gameTime) {
        this.enemyGraphics.clear();

        const camera = this.scene.cameras.main;
        const camX = camera.scrollX;
        const camY = camera.scrollY;
        const camW = camera.width;
        const camH = camera.height;

        for (const en of this.enemies) {
            if (en.x < camX - TILE * 2 || en.x > camX + camW + TILE * 2 ||
                en.y < camY - TILE * 2 || en.y > camY + camH + TILE * 2) {
                if (en.sprite) en.sprite.setVisible(false);
                continue;
            }
            if (en.sprite) en.sprite.setVisible(true);

            const type = ENEMY_TYPES[en.type];
            const s = TILE * en.size * 0.5;

            // Elite glow aura
            if (en.isElite) {
                const glowSize = s * 1.2 + Math.sin(en.eliteGlow || 0) * 3;
                const glowAlpha = 0.4 + Math.sin(en.eliteGlow || 0) * 0.2;
                this.enemyGraphics.lineStyle(2, 0xffc800, glowAlpha);
                this.enemyGraphics.strokeCircle(en.x, en.y, glowSize);
            }

            // Shadow
            this.enemyGraphics.fillStyle(0x000000, 0.3);
            this.enemyGraphics.fillEllipse(en.x, en.y + s * 0.8, s * 1.2, s * 0.4);

            // Procedural fallback if no sprite
            if (!en.sprite || !en.sprite.active) {
                const color = en.flash > 0 ? 0xffffff : Phaser.Display.Color.HexStringToColor(type.color).color;
                this.drawProceduralEnemy(en, type, color, s, gameTime);
            }

            // HP bar for multi-hp enemies
            if (en.maxHp > 1) {
                const barW = TILE * en.size * 0.6;
                const barH = en.isElite ? 5 : 3;
                const bx = en.x - barW / 2;
                const by = en.y - TILE * en.size * 0.5 - 6;
                this.enemyGraphics.fillStyle(0x330000, 1);
                this.enemyGraphics.fillRect(bx, by, barW, barH);
                this.enemyGraphics.fillStyle(en.isElite ? 0xffcc00 : 0xff4444, 1);
                this.enemyGraphics.fillRect(bx, by, barW * Math.max(0, en.hp / en.maxHp), barH);
            }

            // Frozen indicator
            if (en.frozen && en.frozen > 0) {
                this.enemyGraphics.lineStyle(2, 0x88ddff, 1);
                this.enemyGraphics.strokeCircle(en.x, en.y, s * 0.7);
                this.enemyGraphics.fillStyle(0x64c8ff, 0.2);
                this.enemyGraphics.fillCircle(en.x, en.y, s * 0.7);
            }

            // Burning indicator
            if (en.burning && en.burning > 0) {
                const flickerG = 80 + Math.random() * 120;
                const flickerColor = Phaser.Display.Color.GetColor(255, flickerG, 0);
                this.enemyGraphics.fillStyle(flickerColor, 0.2 + Math.random() * 0.15);
                this.enemyGraphics.fillCircle(en.x, en.y, s * 0.8);
            }
        }
    }

    drawProceduralEnemy(en, type, color, s, gameTime) {
        const g = this.enemyGraphics;

        if (en.type === 'slime') {
            const squish = 1 + Math.sin(gameTime * 0.08 + en.x) * 0.1;
            g.fillStyle(color, 1);
            g.fillEllipse(en.x, en.y + s * 0.1, s * 2 * squish, s * 2 / squish);
            g.fillStyle(0xffffff, 1);
            g.fillRect(en.x - s * 0.3, en.y - s * 0.15, s * 0.2, s * 0.2);
            g.fillRect(en.x + s * 0.1, en.y - s * 0.15, s * 0.2, s * 0.2);
            g.fillStyle(0x111111, 1);
            g.fillRect(en.x - s * 0.25, en.y - s * 0.1, s * 0.1, s * 0.15);
            g.fillRect(en.x + s * 0.15, en.y - s * 0.1, s * 0.1, s * 0.15);
        } else if (en.type === 'bat') {
            g.fillStyle(color, 1);
            g.fillCircle(en.x, en.y, s * 0.4);
            // Wings
            g.fillTriangle(
                en.x, en.y,
                en.x - s * 1.2, en.y - s * 0.5,
                en.x - s * 0.5, en.y + s * 0.2
            );
            g.fillTriangle(
                en.x, en.y,
                en.x + s * 1.2, en.y - s * 0.5,
                en.x + s * 0.5, en.y + s * 0.2
            );
            g.fillStyle(0xffff00, 1);
            g.fillRect(en.x - s * 0.2, en.y - s * 0.15, 3, 3);
            g.fillRect(en.x + s * 0.05, en.y - s * 0.15, 3, 3);
        } else if (en.type === 'skeleton') {
            g.fillStyle(color, 1);
            g.fillCircle(en.x, en.y - s * 0.2, s * 0.4);
            g.fillRect(en.x - s * 0.15, en.y + s * 0.1, s * 0.3, s * 0.5);
            g.fillStyle(0x111111, 1);
            g.fillRect(en.x - s * 0.2, en.y - s * 0.3, s * 0.15, s * 0.15);
            g.fillRect(en.x + s * 0.05, en.y - s * 0.3, s * 0.15, s * 0.15);
        } else if (en.type === 'ghost') {
            const wave = Math.sin(gameTime * 0.05 + en.x) * 3;
            g.fillStyle(color, 0.7);
            g.fillCircle(en.x, en.y + wave - s * 0.2, s * 0.5);
            g.fillRect(en.x - s * 0.5, en.y + wave - s * 0.2, s, s * 0.6);
            g.fillStyle(0xffffff, 0.9);
            g.fillCircle(en.x - s * 0.15, en.y - s * 0.2 + wave, s * 0.1);
            g.fillCircle(en.x + s * 0.15, en.y - s * 0.2 + wave, s * 0.1);
        } else if (en.type === 'demon') {
            g.fillStyle(color, 1);
            g.fillCircle(en.x, en.y, s * 0.55);
            // Horns
            g.fillTriangle(
                en.x - s * 0.3, en.y - s * 0.4,
                en.x - s * 0.5, en.y - s * 0.9,
                en.x - s * 0.1, en.y - s * 0.5
            );
            g.fillTriangle(
                en.x + s * 0.3, en.y - s * 0.4,
                en.x + s * 0.5, en.y - s * 0.9,
                en.x + s * 0.1, en.y - s * 0.5
            );
            g.fillStyle(0xffff00, 1);
            g.fillRect(en.x - s * 0.25, en.y - s * 0.15, s * 0.15, s * 0.1);
            g.fillRect(en.x + s * 0.1, en.y - s * 0.15, s * 0.15, s * 0.1);
        }
    }

    destroy() {
        for (const en of this.enemies) {
            if (en.sprite) en.sprite.destroy();
        }
        this.enemies = [];
        if (this.enemyGraphics) this.enemyGraphics.destroy();
    }
}
