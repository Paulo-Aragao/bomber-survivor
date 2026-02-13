// ===================== BOMB SYSTEM =====================
class BombSystem {
    constructor(scene) {
        this.scene = scene;
        this.bombs = [];
        this.explosions = [];
        this.bombGraphics = null;
        this.explosionGraphics = null;
        this.previewGraphics = null;
        this.inputDelay = 0;
    }

    create() {
        this.previewGraphics = this.scene.add.graphics().setDepth(50);
        this.bombGraphics = this.scene.add.graphics().setDepth(400);
        this.explosionGraphics = this.scene.add.graphics().setDepth(300);
    }

    placeBomb() {
        const p = this.scene.playerSystem.stats;
        // Input delay
        if (this.inputDelay > 0) return;
        // Ammo check only
        if (this.bombs.filter(b => !b.exploded).length >= p.bombMax) return;

        const gx = Math.floor(p.x / TILE);
        const gy = Math.floor(p.y / TILE);

        const existing = this.bombs.find(b => b.gx === gx && b.gy === gy && !b.exploded);
        if (existing) return;

        this.bombs.push({
            gx, gy,
            timer: p.bombTimer,
            maxTimer: p.bombTimer,
            range: p.bombRange,
            shape: p.bombShape,
            gravity: p.gravityBombs || false,
            exploded: false,
            pulseAnim: 0,
            element: p.element || null
        });



        if (this.scene.audioSystem) {
            this.scene.audioSystem.playBombPlaceSound(p.element);
        }

        // Set input delay (20 frames = ~330ms)
        this.inputDelay = 20;
    }

    getExplosionTiles(cx, cy, range, shape) {
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

    explodeBomb(bomb) {
        const combat = CONFIG ? CONFIG.balance.combat : {};
        const explosionTimer = combat.explosionTimer || 30;

        const tiles = this.getExplosionTiles(bomb.gx, bomb.gy, bomb.range, bomb.shape);
        for (const t of tiles) {
            this.explosions.push({
                gx: t.gx, gy: t.gy,
                timer: explosionTimer,
                isCenter: (t.gx === bomb.gx && t.gy === bomb.gy),
                element: bomb.element || null
            });
        }

        const juice = this.scene.juiceSystem;
        const juiceCfg = CONFIG ? CONFIG.balance.juice : {};
        if (juice) {
            juice.screenShake = juiceCfg.explosionShake || 14;
            juice.triggerWhiteFlash();
            juice.triggerHitStop(juiceCfg.hitStopExplosion || 3);
        }

        if (this.scene.audioSystem) {
            this.scene.audioSystem.playExplosionSound(bomb.element);
        }
    }

    updateBombs(gameTime) {
        const enemies = this.scene.enemySystem ? this.scene.enemySystem.enemies : [];
        const gravityPullForce = CONFIG ? CONFIG.balance.combat.gravityPullForce : 1.5;

        // Decrease input delay
        if (this.inputDelay > 0) this.inputDelay--;

        for (let i = this.bombs.length - 1; i >= 0; i--) {
            const b = this.bombs[i];
            b.timer--;
            b.pulseAnim += 0.15;

            // Gravity bombs
            if (b.gravity && b.timer < b.maxTimer * 0.4) {
                const bx = b.gx * TILE + TILE / 2;
                const by = b.gy * TILE + TILE / 2;
                const pullRange = TILE * (b.range + 1);
                for (const en of enemies) {
                    const dist = Math.hypot(en.x - bx, en.y - by);
                    if (dist < pullRange && dist > TILE * 0.5) {
                        const angle = Math.atan2(by - en.y, bx - en.x);
                        en.x += Math.cos(angle) * gravityPullForce;
                        en.y += Math.sin(angle) * gravityPullForce;
                        en.targetX = en.x;
                        en.targetY = en.y;
                        en.gx = Math.floor(en.x / TILE);
                        en.gy = Math.floor(en.y / TILE);
                    }
                }
            }

            if (b.timer <= 0) {
                this.explodeBomb(b);
                const oldBomb = this.bombs.splice(i, 1)[0];

                // Chain explosion
                const p = this.scene.playerSystem.stats;
                if (p.chainExplosion) {
                    for (let k = this.bombs.length - 1; k >= 0; k--) {
                        const ob = this.bombs[k];
                        const chainDist = Math.abs(ob.gx - oldBomb.gx) + Math.abs(ob.gy - oldBomb.gy);
                        if (chainDist <= oldBomb.range) ob.timer = 1;
                    }
                }
            }
        }
    }

    updateExplosions(gameTime) {
        const p = this.scene.playerSystem.stats;
        const enemySystem = this.scene.enemySystem;
        const juice = this.scene.juiceSystem;
        const elemental = this.scene.elementalSystem;
        const combat = CONFIG ? CONFIG.balance.combat : {};
        const baseDamage = combat.baseDamage || 1;
        const critMultiplier = combat.critMultiplier || 2;
        const freezeDuration = combat.freezeDuration || 120;
        const burnDuration = combat.burnDuration || 180;
        const explosionTimer = combat.explosionTimer || 30;

        for (let i = this.explosions.length - 1; i >= 0; i--) {
            const e = this.explosions[i];
            e.timer--;

            if (e.timer > explosionTimer - 10 && enemySystem) {
                const enemies = enemySystem.enemies;
                for (let j = enemies.length - 1; j >= 0; j--) {
                    const en = enemies[j];
                    const enGx = Math.floor(en.x / TILE);
                    const enGy = Math.floor(en.y / TILE);
                    if (enGx === e.gx && enGy === e.gy) {
                        let dmg = baseDamage + p.piercing;
                        const isCrit = p.critChance > 0 && Math.random() < p.critChance;
                        if (isCrit) {
                            dmg *= critMultiplier;
                            if (juice) juice.triggerCritFlash();
                        }
                        en.hp -= dmg;
                        en.flash = 8;

                        if (p.freezeChance > 0 && Math.random() < p.freezeChance) en.frozen = freezeDuration;
                        if (p.burnDamage > 0) { en.burning = burnDuration; en.burnDmg = p.burnDamage; }

                        if (juice) {
                            juice.spawnDamageNumber(en.x, en.y - TILE * 0.3,
                                (isCrit ? 'CRIT ' : '') + dmg,
                                isCrit ? '#ff44ff' : '#ffaa00');
                        }

                        if (en.hp <= 0) {
                            enemySystem.handleEnemyKill(en, j);
                        }
                    }
                }

                // Damage player
                if (p.invincible <= 0) {
                    const pgx = Math.floor(p.x / TILE);
                    const pgy = Math.floor(p.y / TILE);
                    if (pgx === e.gx && pgy === e.gy) {
                        const dead = this.scene.playerSystem.takeDamage(1);
                        if (dead) return;
                    }
                }
            }

            // Spawn elemental particles on first frame
            if (e.timer === explosionTimer - 1 && e.element && elemental) {
                const cx = e.gx * TILE + TILE / 2;
                const cy = e.gy * TILE + TILE / 2;
                elemental.createElementalExplosion(e.element, cx, cy);
            }

            if (e.timer <= 0) this.explosions.splice(i, 1);
        }
    }

    update(gameTime) {
        this.updateBombs(gameTime);
        this.updateExplosions(gameTime);
    }

    render(gameTime) {
        this.previewGraphics.clear();
        this.bombGraphics.clear();
        this.explosionGraphics.clear();

        const camera = this.scene.cameras.main;
        const camX = camera.scrollX;
        const camY = camera.scrollY;
        const camW = camera.width;
        const camH = camera.height;
        const elemental = this.scene.elementalSystem;
        const explosionTimer = CONFIG ? CONFIG.balance.combat.explosionTimer : 30;

        // Bomb preview
        for (const b of this.bombs) {
            const urgency = 1 - (b.timer / b.maxTimer);
            const baseAlpha = 0.03 + urgency * 0.35;
            const pulse = Math.sin(gameTime * (0.06 + urgency * 0.3)) * 0.5 + 0.5;
            const alpha = baseAlpha + pulse * urgency * 0.15;

            const previewTiles = this.getExplosionTiles(b.gx, b.gy, b.range, b.shape);
            for (const t of previewTiles) {
                if (t.gx === b.gx && t.gy === b.gy) continue;
                const tx = t.gx * TILE;
                const ty = t.gy * TILE;
                const dist = Math.abs(t.gx - b.gx) + Math.abs(t.gy - b.gy);
                const distFade = 1 - (dist - 1) * 0.08;
                const tileAlpha = alpha * Math.max(0.3, distFade);
                const red = 255;
                const green = Math.floor(180 - urgency * 130);
                const blue = Math.floor(50 - urgency * 50);
                const color = Phaser.Display.Color.GetColor(red, green, blue);

                this.previewGraphics.fillStyle(color, tileAlpha);
                this.previewGraphics.fillRect(tx + 3, ty + 3, TILE - 6, TILE - 6);

                if (urgency > 0.3) {
                    this.previewGraphics.lineStyle(urgency > 0.7 ? 2 : 1,
                        Phaser.Display.Color.GetColor(red, Math.floor(green * 0.7), 0), tileAlpha * 1.5);
                    this.previewGraphics.strokeRect(tx + 3, ty + 3, TILE - 6, TILE - 6);
                }
            }

            // Gravity pull visual
            if (b.gravity && b.timer < b.maxTimer * 0.4) {
                const bx = b.gx * TILE + TILE / 2;
                const by = b.gy * TILE + TILE / 2;
                const pullAlpha = 0.1 + Math.sin(gameTime * 0.2) * 0.05;
                this.previewGraphics.lineStyle(2, 0xB464FF, pullAlpha);
                this.previewGraphics.strokeCircle(bx, by, TILE * (b.range + 1));
            }
        }

        // Bombs
        for (const b of this.bombs) {
            const x = b.gx * TILE + TILE / 2;
            const y = b.gy * TILE + TILE / 2;
            const pulse = 1 + Math.sin(b.pulseAnim) * 0.1;
            const isUrgent = (b.timer / b.maxTimer) < 0.25;

            const bombColorHex = elemental ? elemental.getElementColor(b.element) : '#2a2a2a';
            const glowColorHex = elemental ? elemental.getElementGlowColor(b.element) : '#ffcc00';
            const bombColor = Phaser.Display.Color.HexStringToColor(bombColorHex).color;
            const glowColor = Phaser.Display.Color.HexStringToColor(glowColorHex).color;

            // Shadow
            this.bombGraphics.fillStyle(0x000000, 0.4);
            this.bombGraphics.fillEllipse(x, y + TILE * 0.3, TILE * 0.5, TILE * 0.2);

            // Body
            const bombSize = TILE * 0.35 * pulse;
            this.bombGraphics.fillStyle(isUrgent ? glowColor : bombColor, 1);
            this.bombGraphics.fillCircle(x, y, bombSize);

            // Highlight
            this.bombGraphics.fillStyle(0xffffff, 0.2);
            this.bombGraphics.fillCircle(x - bombSize * 0.25, y - bombSize * 0.25, bombSize * 0.3);

            // Fuse spark
            const sparkX = x + Math.cos(b.pulseAnim * 2) * 3;
            const sparkY = y - bombSize - 2 + Math.sin(b.pulseAnim * 3) * 2;
            this.bombGraphics.fillStyle(glowColor, 1);
            this.bombGraphics.fillCircle(sparkX, sparkY, 3 + (isUrgent ? 2 : 0));

            // Timer ring
            const timerProgress = b.timer / b.maxTimer;
            this.bombGraphics.lineStyle(2, glowColor, 1);
            this.bombGraphics.beginPath();
            this.bombGraphics.arc(x, y, bombSize + 4,
                -Math.PI / 2,
                -Math.PI / 2 + Math.PI * 2 * timerProgress,
                false);
            this.bombGraphics.strokePath();
        }

        // Explosions
        for (const e of this.explosions) {
            const ex = e.gx * TILE;
            const ey = e.gy * TILE;
            if (ex < camX - TILE * 2 || ex > camX + camW + TILE * 2 ||
                ey < camY - TILE * 2 || ey > camY + camH + TILE * 2) continue;

            const progress = 1 - e.timer / explosionTimer;
            const alpha = e.timer / explosionTimer;

            const rgb = elemental ? elemental.getElementRGB(e.element) : { r: 255, g: 180, b: 50 };
            const cx = ex + TILE / 2;
            const cy = ey + TILE / 2;

            // Core glow
            this.explosionGraphics.fillStyle(0xffffff, alpha * 0.9);
            this.explosionGraphics.fillCircle(cx, cy, TILE * 0.2);

            // Mid ring
            const midColor = Phaser.Display.Color.GetColor(rgb.r, Math.min(255, Math.floor(rgb.g * 1.2)), rgb.b);
            this.explosionGraphics.fillStyle(midColor, alpha * 0.6);
            this.explosionGraphics.fillCircle(cx, cy, TILE * 0.45);

            // Outer ring
            const outerColor = Phaser.Display.Color.GetColor(rgb.r, rgb.g, rgb.b);
            this.explosionGraphics.fillStyle(outerColor, alpha * 0.3);
            this.explosionGraphics.fillCircle(cx, cy, TILE * 0.65);

            // Shockwave ring
            if (e.timer > explosionTimer - 10 && e.isCenter) {
                const ring = 1 + progress * 2;
                this.explosionGraphics.lineStyle(Math.max(1, 3 - progress * 2), outerColor, alpha * 0.5);
                this.explosionGraphics.strokeCircle(cx, cy, TILE * ring * 0.3);
            }
        }
    }

    destroy() {
        if (this.previewGraphics) this.previewGraphics.destroy();
        if (this.bombGraphics) this.bombGraphics.destroy();
        if (this.explosionGraphics) this.explosionGraphics.destroy();
        this.bombs = [];
        this.explosions = [];
    }
}
