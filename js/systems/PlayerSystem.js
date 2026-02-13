// ===================== PLAYER SYSTEM =====================
class PlayerSystem {
    constructor(scene) {
        this.scene = scene;
        this.sprite = null;
        this.stats = {};
        this.cursors = null;
        this.wasd = null;
        this.animTimer = 0;
    }

    create(charIndex) {
        const char = CHARACTERS[charIndex];

        this.initStats();
        this.stats.charId = char.id;
        this.stats.charColor = char.color;
        this.stats.spriteSheet = char.spriteSheet;
        this.stats.element = char.element;
        if (char.apply) char.apply(this.stats);

        // Create player sprite
        this.sprite = this.scene.physics.add.sprite(WORLD_W / 2, WORLD_H / 2, char.spriteSheet, 10 * 13);
        this.sprite.setDepth(500);
        this.sprite.setCollideWorldBounds(true);
        this.sprite.body.setSize(TILE * 0.5, TILE * 0.5);
        this.sprite.body.setOffset(
            (64 - TILE * 0.5) / 2,
            (64 - TILE * 0.5) / 2 + 10
        );

        // Create animations for this character
        this.createAnimations(char.spriteSheet);

        // Input
        this.cursors = this.scene.input.keyboard.createCursorKeys();
        this.wasd = this.scene.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            space: Phaser.Input.Keyboard.KeyCodes.SPACE,
        });

        // Store in registry
        this.scene.registry.set('player', this.stats);

        return this.sprite;
    }

    createAnimations(sheetKey) {
        const anims = this.scene.anims;
        const directions = { up: 8, left: 9, down: 10, right: 11 };

        for (const [dir, row] of Object.entries(directions)) {
            const key = `${sheetKey}_walk_${dir}`;
            if (anims.exists(key)) continue;

            const frames = [];
            for (let i = 0; i < 9; i++) {
                frames.push({ key: sheetKey, frame: row * 13 + i });
            }

            anims.create({
                key: key,
                frames: frames,
                frameRate: 10,
                repeat: -1
            });
        }

        // Idle frames
        for (const [dir, row] of Object.entries(directions)) {
            const key = `${sheetKey}_idle_${dir}`;
            if (anims.exists(key)) continue;
            anims.create({
                key: key,
                frames: [{ key: sheetKey, frame: row * 13 }],
                frameRate: 1,
                repeat: 0
            });
        }
    }

    initStats() {
        const bal = CONFIG ? CONFIG.balance.player : {};
        this.stats = {
            x: WORLD_W / 2,
            y: WORLD_H / 2,
            speed: bal.speed || 3.2,
            hp: bal.hp || 5,
            maxHp: bal.maxHp || 5,
            bombMax: bal.bombMax || 1,
            bombRange: bal.bombRange || 2,
            bombCooldown: 0,
            bombCooldownMax: bal.bombCooldownMax || 90,
            bombTimer: bal.bombTimer || 120,
            bombShape: bal.bombShape || 'cross',
            invincible: 0,
            level: 1,
            xp: 0,
            xpNeeded: bal.xpBase || 5,
            magnetRange: bal.magnetRange || 3,
            armor: 0,
            xpMultiplier: bal.xpMultiplier || 1,
            thorns: 0,
            regen: 0,
            regenTimer: 0,
            shield: 0,
            piercing: 0,
            luckyDrop: 0,
            burnDamage: 0,
            freezeChance: 0,
            critChance: 0,
            bombOnKill: false,
            chainExplosion: false,
            invincibleOnLevelUp: 0,
            gravityBombs: false,
            windSpin: false,
            facing: 'down',
            charId: 'bomber',
            charColor: '#4488ff',
            element: null,
            hpRegen: 0,
            lightAura: false,
            flashBlind: 0,
            vampirism: 0,
            shadowTeleport: false,
            nightSpeed: false,
            fearAura: 0,
            stormLevel: 0,
            execute: false,
            extraChoice: 0,
        };
    }

    update() {
        if (!this.sprite || !this.sprite.active) return;

        const p = this.stats;
        let dx = 0, dy = 0;

        if (this.cursors.up.isDown || this.wasd.up.isDown) { dy = -1; p.facing = 'up'; }
        if (this.cursors.down.isDown || this.wasd.down.isDown) { dy = 1; p.facing = 'down'; }
        if (this.cursors.left.isDown || this.wasd.left.isDown) { dx = -1; p.facing = 'left'; }
        if (this.cursors.right.isDown || this.wasd.right.isDown) { dx = 1; p.facing = 'right'; }

        if (dx !== 0 && dy !== 0) { dx *= 0.707; dy *= 0.707; }

        const speed = p.speed * TILE;
        this.sprite.setVelocity(dx * speed, dy * speed);

        // Animation
        const sheetKey = p.spriteSheet || p.charId;
        if (dx !== 0 || dy !== 0) {
            const animKey = `${sheetKey}_walk_${p.facing}`;
            if (this.sprite.anims.currentAnim?.key !== animKey) {
                this.sprite.play(animKey, true);
            }
        } else {
            const idleKey = `${sheetKey}_idle_${p.facing}`;
            if (!this.sprite.anims.currentAnim || this.sprite.anims.currentAnim.key !== idleKey) {
                this.sprite.play(idleKey, true);
            }
        }

        // Update stats positions
        p.x = this.sprite.x;
        p.y = this.sprite.y;

        // Cooldowns
        if (p.bombCooldown > 0) p.bombCooldown--;
        if (p.invincible > 0) p.invincible--;

        // Invincibility blink
        if (p.invincible > 0) {
            this.sprite.setAlpha(Math.floor(p.invincible / 4) % 2 === 0 ? 0.3 : 1);
        } else {
            this.sprite.setAlpha(1);
        }

        // Regeneration
        const regenTick = CONFIG ? CONFIG.balance.regen.tickFrames : 600;
        if (p.regen > 0) {
            p.regenTimer++;
            if (p.regenTimer >= regenTick) {
                p.regenTimer = 0;
                const healAmt = p.regen;
                p.hp = Math.min(p.maxHp, p.hp + healAmt);
                if (this.scene.juiceSystem) {
                    this.scene.juiceSystem.spawnDamageNumber(p.x, p.y - TILE * 0.5, '+' + healAmt, '#44ff44');
                    this.scene.juiceSystem.spawnParticles(p.x, p.y, 0x44ff44, 5, 2);
                }
            }
        }

        // Lyna passive HP regen
        if (p.hpRegen > 0) {
            p.hp = Math.min(p.maxHp, p.hp + p.hpRegen);
        }

        // Update registry
        this.scene.registry.set('player', p);
    }

    takeDamage(amount) {
        const p = this.stats;
        const combat = CONFIG ? CONFIG.balance.combat : {};
        if (p.invincible > 0) return false;

        if (p.shield > 0) {
            p.shield--;
            p.invincible = combat.shieldInvincibility || 40;
            if (this.scene.juiceSystem) {
                this.scene.juiceSystem.spawnDamageNumber(p.x, p.y - TILE * 0.5, 'BLOCKED!', '#44aaff');
                this.scene.juiceSystem.spawnParticles(p.x, p.y, 0x44aaff, 6, 3);
            }
            return false;
        }

        const dmg = Math.max(1, amount - p.armor);
        p.hp -= dmg;
        p.invincible = combat.hitInvincibility || 60;

        if (this.scene.juiceSystem) {
            this.scene.juiceSystem.damageFlash = (CONFIG ? CONFIG.balance.juice.damageFlashFrames : 15);
            this.scene.juiceSystem.screenShake = 5;
            this.scene.juiceSystem.spawnDamageNumber(p.x, p.y - TILE * 0.5, '-' + dmg, '#ff4444');
            this.scene.juiceSystem.triggerScreenFlash('rgba(255, 0, 0, 0.2)', 100);
        }
        if (this.scene.audioSystem) {
            this.scene.audioSystem.playHitSound();
        }

        if (p.hp <= 0) {
            this.scene.registry.events.emit('gameOver');
            return true;
        }
        return false;
    }

    destroy() {
        if (this.sprite) {
            this.sprite.destroy();
            this.sprite = null;
        }
    }
}
