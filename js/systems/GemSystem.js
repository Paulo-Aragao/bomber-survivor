// ===================== GEM SYSTEM =====================
class GemSystem {
    constructor(scene) {
        this.scene = scene;
        this.gems = [];
        this.chestDrops = [];
        this.xpBank = 0;
        this.gemGraphics = null;
    }

    create() {
        this.gemGraphics = this.scene.add.graphics().setDepth(100);
    }

    handleGemDrop(x, y, value) {
        const p = this.scene.playerSystem.stats;
        const gemCfg = CONFIG ? CONFIG.balance.gems : {};
        if (this.gems.length >= GEM_CAP) {
            this.xpBank += Math.floor(value * p.xpMultiplier);
            if (Math.random() < (gemCfg.megaGemChance || 0.1)) {
                this.spawnMegaGem(x, y);
            }
            return;
        }
        this.spawnGem(x, y, value);
    }

    spawnGem(x, y, value) {
        const gemCfg = CONFIG ? CONFIG.balance.gems : {};
        const gemVelocity = gemCfg.gemVelocity || 4;
        this.gems.push({
            x, y, value,
            lifetime: gemCfg.lifetime || 1800,
            magnet: false,
            vx: (Math.random() - 0.5) * gemVelocity,
            vy: (Math.random() - 0.5) * gemVelocity,
            mega: false,
            size: gemCfg.normalGemSize || 6,
        });
    }

    spawnMegaGem(x, y) {
        const gemCfg = CONFIG ? CONFIG.balance.gems : {};
        const megaVelocity = gemCfg.megaGemVelocity || 2;
        this.gems.push({
            x, y, value: 0,
            lifetime: gemCfg.lifetime || 1800,
            magnet: false,
            vx: (Math.random() - 0.5) * megaVelocity,
            vy: (Math.random() - 0.5) * megaVelocity,
            mega: true,
            size: gemCfg.megaGemSize || 12,
        });
    }

    spawnChestDrop(x, y) {
        const gemCfg = CONFIG ? CONFIG.balance.gems : {};
        this.chestDrops.push({
            x, y,
            lifetime: gemCfg.chestLifetime || 600,
            bob: 0,
        });
    }

    update(gameTime) {
        const p = this.scene.playerSystem.stats;
        const juice = this.scene.juiceSystem;
        const audio = this.scene.audioSystem;
        const gemCfg = CONFIG ? CONFIG.balance.gems : {};
        const magnetSpeed = gemCfg.magnetSpeed || 6;
        const collectRange = gemCfg.collectRange || 0.6;
        const gemFriction = gemCfg.gemFriction || 0.92;
        const chestCollectRange = gemCfg.chestCollectRange || 0.8;
        const bal = CONFIG ? CONFIG.balance.player : {};
        const xpScaleMultiplier = bal.xpScaleMultiplier || 1.4;
        const xpScaleFlat = bal.xpScaleFlat || 2;

        for (let i = this.gems.length - 1; i >= 0; i--) {
            const g = this.gems[i];
            g.lifetime--;

            g.vx *= gemFriction;
            g.vy *= gemFriction;
            g.x += g.vx;
            g.y += g.vy;

            const dist = Math.hypot(p.x - g.x, p.y - g.y);

            // Magnet
            if (dist < TILE * p.magnetRange) {
                const angle = Math.atan2(p.y - g.y, p.x - g.x);
                g.x += Math.cos(angle) * magnetSpeed;
                g.y += Math.sin(angle) * magnetSpeed;
            }

            // Collect
            if (dist < TILE * collectRange) {
                let xpGain = Math.floor(g.value * p.xpMultiplier);

                // Drain XP bank
                if (this.xpBank > 0) {
                    xpGain += this.xpBank;
                    this.xpBank = 0;
                    if (juice) {
                        juice.spawnParticles(g.x, g.y, 0xffcc00, 8, 4);
                        juice.spawnDamageNumber(p.x, p.y - TILE, '\ud83d\udc8e XP BANKED!', '#ffcc00');
                    }
                }

                p.xp += xpGain;
                if (juice) juice.spawnParticles(g.x, g.y, g.mega ? 0xffcc00 : 0x44aaff, g.mega ? 8 : 4, 3);
                this.gems.splice(i, 1);

                if (audio) audio.playXPCollectSound();

                // Level up check
                while (p.xp >= p.xpNeeded) {
                    p.xp -= p.xpNeeded;
                    p.level++;
                    p.xpNeeded = Math.floor(p.xpNeeded * xpScaleMultiplier) + xpScaleFlat;
                    if (p.invincibleOnLevelUp > 0) {
                        p.invincible = Math.max(p.invincible, p.invincibleOnLevelUp);
                        if (juice) juice.spawnParticles(p.x, p.y, 0xffff00, 10, 5);
                    }

                    if (audio) audio.playLevelUpSound();
                    this.scene.registry.events.emit('levelUp', false);
                    break;
                }

                this.scene.registry.set('player', p);
                continue;
            }

            if (g.lifetime <= 0) this.gems.splice(i, 1);
        }

        // Update chest drops
        for (let i = this.chestDrops.length - 1; i >= 0; i--) {
            const c = this.chestDrops[i];
            c.lifetime--;
            c.bob += 0.08;

            const dist = Math.hypot(p.x - c.x, p.y - c.y);
            if (dist < TILE * chestCollectRange) {
                this.chestDrops.splice(i, 1);
                this.scene.registry.events.emit('levelUp', true);
                if (juice) juice.triggerScreenFlash('rgba(255, 200, 0, 0.3)', 150);
                continue;
            }

            if (c.lifetime <= 0) this.chestDrops.splice(i, 1);
        }
    }

    render(gameTime) {
        this.gemGraphics.clear();

        const camera = this.scene.cameras.main;
        const camX = camera.scrollX;
        const camY = camera.scrollY;
        const camW = camera.width;
        const camH = camera.height;

        // Gems
        for (const g of this.gems) {
            if (g.x < camX - TILE || g.x > camX + camW + TILE ||
                g.y < camY - TILE || g.y > camY + camH + TILE) continue;

            const alpha = g.lifetime < 60 ? g.lifetime / 60 : 1;
            const bob = Math.sin(gameTime * 0.1 + g.x) * 3;

            const gx = g.x;
            const gy = g.y + bob;
            const gs = g.size;

            const color = g.mega ? 0xffcc00 : 0x44ccff;

            this.gemGraphics.fillStyle(color, alpha);
            this.gemGraphics.beginPath();
            this.gemGraphics.moveTo(gx, gy - gs);
            this.gemGraphics.lineTo(gx + gs, gy);
            this.gemGraphics.lineTo(gx, gy + gs);
            this.gemGraphics.lineTo(gx - gs, gy);
            this.gemGraphics.closePath();
            this.gemGraphics.fillPath();
        }

        // Chests
        for (const c of this.chestDrops) {
            if (c.x < camX - TILE || c.x > camX + camW + TILE ||
                c.y < camY - TILE || c.y > camY + camH + TILE) continue;

            const bob = Math.sin(c.bob) * 4;
            const glow = 0.5 + Math.sin(gameTime * 0.08) * 0.3;

            this.gemGraphics.fillStyle(0xffc800, glow);
            this.gemGraphics.fillRect(c.x - 12, c.y - 10 + bob, 24, 20);
            this.gemGraphics.fillStyle(0xaa6600, 1);
            this.gemGraphics.fillRect(c.x - 12, c.y - 10 + bob, 24, 4);
            this.gemGraphics.fillStyle(0xffee88, 1);
            this.gemGraphics.fillRect(c.x - 3, c.y - 4 + bob, 6, 6);
        }
    }

    destroy() {
        this.gems = [];
        this.chestDrops = [];
        this.xpBank = 0;
        if (this.gemGraphics) this.gemGraphics.destroy();
    }
}
