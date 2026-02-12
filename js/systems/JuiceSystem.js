// ===================== JUICE SYSTEM =====================
class JuiceSystem {
    constructor(scene) {
        this.scene = scene;
        this.hitStopFrames = 0;
        this.killStreak = 0;
        this.killStreakTimer = 0;
        this.screenShake = 0;
        this.damageFlash = 0;
        this.particles = [];
        this.damageNumbers = [];
    }

    triggerHitStop(frames) {
        this.hitStopFrames = Math.max(this.hitStopFrames, frames);
    }

    triggerWhiteFlash() {
        const flash = document.getElementById('white-flash');
        if (flash) {
            flash.classList.add('active');
            setTimeout(() => flash.classList.remove('active'), 50);
        }
    }

    triggerScreenFlash(color, duration) {
        const flash = document.getElementById('white-flash');
        if (flash) {
            flash.style.background = color;
            flash.classList.add('active');
            setTimeout(() => {
                flash.classList.remove('active');
                flash.style.background = '#fff';
            }, duration || 60);
        }
    }

    triggerCritFlash() {
        this.triggerScreenFlash('rgba(255, 100, 255, 0.15)', 80);
    }

    addKillStreak() {
        this.killStreak++;
        this.killStreakTimer = KILL_STREAK_WINDOW;

        if (this.killStreak >= 3) {
            const comboEl = document.getElementById('combo-display');
            let text = '';
            if (this.killStreak >= 20) text = `☠️ MASSACRE ×${this.killStreak}!`;
            else if (this.killStreak >= 10) text = `🔥 UNSTOPPABLE ×${this.killStreak}!`;
            else if (this.killStreak >= 5) text = `💥 RAMPAGE ×${this.killStreak}!`;
            else text = `⚡ COMBO ×${this.killStreak}!`;

            if (comboEl) {
                comboEl.textContent = text;
                comboEl.style.display = 'block';
            }

            const intensity = Math.min(this.killStreak / 20, 1);
            this.triggerScreenFlash(`rgba(255, 200, 0, ${0.1 + intensity * 0.15})`, 80);
        }
    }

    updateKillStreak() {
        if (this.killStreakTimer > 0) {
            this.killStreakTimer--;
            if (this.killStreakTimer <= 0) {
                this.killStreak = 0;
                const comboEl = document.getElementById('combo-display');
                if (comboEl) comboEl.style.display = 'none';
            }
        }
    }

    triggerLevelUpBurst(px, py) {
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const spd = 3 + Math.random() * 5;
            this.particles.push({
                x: px, y: py,
                vx: Math.cos(angle) * spd,
                vy: Math.sin(angle) * spd,
                life: 40 + Math.random() * 30,
                maxLife: 70,
                color: Math.random() > 0.5 ? 0xffcc00 : 0xff8800,
                size: 3 + Math.random() * 5,
            });
        }
        this.screenShake = 8;
        this.triggerScreenFlash('rgba(255, 200, 0, 0.3)', 150);
    }

    spawnParticles(x, y, color, count, speed) {
        for (let i = 0; i < count; i++) {
            if (this.particles.length >= MAX_PARTICLES) {
                this.particles.shift();
            }
            const angle = Math.random() * Math.PI * 2;
            const spd = Math.random() * speed;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * spd,
                vy: Math.sin(angle) * spd,
                life: 30 + Math.random() * 30,
                maxLife: 60,
                color,
                size: 2 + Math.random() * 4,
            });
        }
    }

    spawnDamageNumber(x, y, text, color) {
        this.damageNumbers.push({
            x, y, text, color: color || '#fff',
            life: 45,
            vy: -2,
            scale: 1.5,
        });
    }

    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.1;
            p.life--;
            if (p.life <= 0) this.particles.splice(i, 1);
        }
    }

    updateDamageNumbers() {
        for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
            const d = this.damageNumbers[i];
            d.y += d.vy;
            d.vy *= 0.97;
            d.life--;
            d.scale = Math.max(1, d.scale * 0.95);
            if (d.life <= 0) this.damageNumbers.splice(i, 1);
        }
    }

    updateShake() {
        if (this.screenShake > 0) this.screenShake *= 0.85;
        if (this.damageFlash > 0) this.damageFlash--;
    }

    update() {
        this.updateParticles();
        this.updateDamageNumbers();
        this.updateKillStreak();
        this.updateShake();
    }

    render(graphics, camera) {
        const camX = camera.scrollX;
        const camY = camera.scrollY;
        const camW = camera.width;
        const camH = camera.height;

        // Render particles
        for (const p of this.particles) {
            if (p.x < camX - 20 || p.x > camX + camW + 20 ||
                p.y < camY - 20 || p.y > camY + camH + 20) continue;
            const alpha = p.life / p.maxLife;
            const sz = p.size * (alpha > 0.5 ? 1 : alpha * 2);
            graphics.fillStyle(p.color, alpha);
            graphics.fillRect(p.x - sz / 2, p.y - sz / 2, sz, sz);
        }
    }

    renderDamageNumbers(scene, camera) {
        const camX = camera.scrollX;
        const camW = camera.width;

        for (const d of this.damageNumbers) {
            if (d.x < camX - 100 || d.x > camX + camW + 100) continue;
            const alpha = d.life / 45;
            const fontSize = Math.floor(14 * (d.scale || 1));

            if (!d.textObj) {
                d.textObj = scene.add.text(d.x, d.y, d.text, {
                    fontFamily: '"Press Start 2P"',
                    fontSize: fontSize + 'px',
                    color: d.color,
                    stroke: '#000',
                    strokeThickness: 2,
                }).setOrigin(0.5).setDepth(1000);
            }

            d.textObj.setPosition(d.x, d.y);
            d.textObj.setAlpha(alpha);
            d.textObj.setFontSize(fontSize);

            if (d.life <= 0 && d.textObj) {
                d.textObj.destroy();
                d.textObj = null;
            }
        }
    }

    destroyDamageNumbers() {
        for (const d of this.damageNumbers) {
            if (d.textObj) {
                d.textObj.destroy();
                d.textObj = null;
            }
        }
        this.damageNumbers = [];
    }
}
