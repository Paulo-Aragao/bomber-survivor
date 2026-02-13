// ===================== GAME SCENE =====================
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Game' });
    }

    init(data) {
        this.selectedChar = (data && data.selectedChar != null) ? data.selectedChar : 0;
    }

    create() {
        // World bounds
        this.physics.world.setBounds(0, 0, WORLD_W, WORLD_H);

        // Draw ground
        this.createGround();

        // Map border (Dark Green)
        const border = this.add.graphics().setDepth(10);
        border.lineStyle(4, 0x113311, 0.5);
        border.strokeRect(0, 0, WORLD_W, WORLD_H);

        // Initialize systems
        this.audioSystem = new AudioSystem();
        this.juiceSystem = new JuiceSystem(this);
        this.elementalSystem = new ElementalSystem(this);
        this.playerSystem = new PlayerSystem(this);
        this.bombSystem = new BombSystem(this);
        this.enemySystem = new EnemySystem(this);
        this.gemSystem = new GemSystem(this);
        this.waveSystem = new WaveSystem(this);
        this.upgradeSystem = new UpgradeSystem(this);

        // Create systems
        this.bombSystem.create();
        this.enemySystem.create();
        this.gemSystem.create();

        // Create player
        const playerSprite = this.playerSystem.create(this.selectedChar);

        // Camera
        this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H);
        this.cameras.main.startFollow(playerSprite, true, 0.1, 0.1);

        // Particle graphics
        this.particleGraphics = this.add.graphics().setDepth(800);

        // Damage flash overlay (screen-space)
        this.damageOverlay = this.add.graphics().setDepth(2000).setScrollFactor(0);

        // Game state
        this.gameTime = 0;
        this.gamePaused = false;
        this.gameRunning = true;
        this.registry.set('kills', 0);
        this.registry.set('gameTime', 0);
        this.registry.set('player', this.playerSystem.stats);

        // Start HUD scene in parallel
        if (!this.scene.isActive('HUD')) {
            this.scene.launch('HUD');
        }

        // Set character portrait
        const char = CHARACTERS[this.selectedChar];
        const portraitEl = document.getElementById('char-portrait');
        if (portraitEl && char.portrait) {
            portraitEl.style.backgroundImage = `url('img/${char.portrait}')`;
        }

        // Show HUD
        // Show HUD
        document.getElementById('hud').style.display = 'flex';

        // Events
        this.registry.events.on('levelUp', this.onLevelUp, this);
        this.registry.events.on('gameOver', this.onGameOver, this);
        this.registry.events.on('resumeFromLevelUp', this.onResumeFromLevelUp, this);

        // Input for bomb and pause
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

        // Level up input
        this.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        this.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        this.upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        this.downKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
        this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);

        // Pause state
        this.selectedPauseOption = 0;
        this.spaceHoldStart = 0;

        // Prevent space from scrolling
        this.input.keyboard.addCapture(['SPACE', 'UP', 'DOWN', 'LEFT', 'RIGHT']);
    }

    createGround() {
        const groundGraphics = this.add.graphics().setDepth(0);

        // We render only visible tiles in render, but create a base layer
        // For performance, we'll draw ground in the update/render cycle
        this.groundGraphics = groundGraphics;
    }

    renderGround() {
        this.groundGraphics.clear();

        const camera = this.cameras.main;
        const camX = camera.scrollX;
        const camY = camera.scrollY;
        const camW = camera.width;
        const camH = camera.height;

        const startTileX = Math.max(0, Math.floor(camX / TILE));
        const startTileY = Math.max(0, Math.floor(camY / TILE));
        const endTileX = Math.min(MAP_W, Math.ceil((camX + camW) / TILE) + 1);
        const endTileY = Math.min(MAP_H, Math.ceil((camY + camH) / TILE) + 1);

        for (let ty = startTileY; ty < endTileY; ty++) {
            for (let tx = startTileX; tx < endTileX; tx++) {
                const x = tx * TILE;
                const y = ty * TILE;
                const isDark = (tx + ty) % 2 === 0;
                // Grass colors (Dark Green / Slightly Lighter Green)
                this.groundGraphics.fillStyle(isDark ? 0x1e3a1e : 0x244224, 1);
                this.groundGraphics.fillRect(x, y, TILE, TILE);
                this.groundGraphics.lineStyle(1, 0x336633, 0.1);
                this.groundGraphics.strokeRect(x, y, TILE, TILE);

                // Random detail
                if ((tx * 7 + ty * 13) % 37 === 0) {
                    this.groundGraphics.fillStyle(0x44aa44, 0.15); // Grass tufts
                    this.groundGraphics.fillRect(x + TILE * 0.3, y + TILE * 0.3, TILE * 0.15, TILE * 0.15);
                }
            }
        }
    }

    onLevelUp(isChest) {
        this.gamePaused = true;
        this.playerSystem.stopMovement();
        this.upgradeSystem.showLevelUp(isChest);
    }

    onResumeFromLevelUp() {
        this.gamePaused = false;
        this.spaceHoldStart = 0;
    }

    onGameOver() {
        this.gameRunning = false;
        this.gameRunning = false;
        this.gamePaused = true;
        this.playerSystem.stopMovement();

        if (this.audioSystem) this.audioSystem.playGameOverSound();

        const totalSeconds = Math.floor(this.gameTime / 60);
        const mins = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const secs = (totalSeconds % 60).toString().padStart(2, '0');
        const kills = this.registry.get('kills') || 0;
        const p = this.playerSystem.stats;

        document.getElementById('go-time').textContent = `⏱️ Survived: ${mins}:${secs}`;
        document.getElementById('go-kills').textContent = `💀 Kills: ${kills}`;
        document.getElementById('go-level').textContent = `⭐ Level: ${p.level}`;

        const score = totalSeconds * 10 + kills * 5 + p.level * 20;
        let highScore = parseInt(localStorage.getItem('bomberVampireHighScore') || '0');
        const isNew = score > highScore;
        if (isNew) {
            highScore = score;
            localStorage.setItem('bomberVampireHighScore', highScore.toString());
        }
        document.getElementById('go-highscore').textContent = `🏆 High Score: ${highScore}${isNew ? ' NEW!' : ''}`;

        document.getElementById('gameover-overlay').classList.add('active');
    }

    handlePauseInput() {
        if (Phaser.Input.Keyboard.JustDown(this.upKey) || Phaser.Input.Keyboard.JustDown(this.wKey)) {
            this.selectedPauseOption = 0;
            this.updatePauseSelection();
            this.audioSystem.playUINavigate();
        }
        if (Phaser.Input.Keyboard.JustDown(this.downKey) || Phaser.Input.Keyboard.JustDown(this.sKey)) {
            this.selectedPauseOption = 1;
            this.updatePauseSelection();
            this.audioSystem.playUINavigate();
        }
        if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
            this.audioSystem.playUIConfirm();
            this.confirmPauseOption();
        }

        // Space hold for pause
        if (this.spaceKey.isDown) {
            this.spaceHoldStart++;
            if (this.spaceHoldStart >= SPACE_HOLD_DURATION) {
                this.spaceHoldStart = 0;
                this.audioSystem.playUIConfirm();
                this.confirmPauseOption();
            }
        } else {
            this.spaceHoldStart = 0;
        }
    }

    handleLevelUpInput() {
        if (Phaser.Input.Keyboard.JustDown(this.leftKey) || Phaser.Input.Keyboard.JustDown(this.aKey)) {
            this.upgradeSystem.navigateLeft();
        }
        if (Phaser.Input.Keyboard.JustDown(this.rightKey) || Phaser.Input.Keyboard.JustDown(this.dKey)) {
            this.upgradeSystem.navigateRight();
        }
        if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
            this.upgradeSystem.confirmUpgrade();
        }

        // Space hold for upgrade
        if (this.spaceKey.isDown) {
            this.spaceHoldStart++;
            this.upgradeSystem.spaceHoldStart = this.spaceHoldStart;
            this.upgradeSystem.updateProgressBar();

            if (this.spaceHoldStart >= SPACE_HOLD_DURATION) {
                this.spaceHoldStart = 0;
                this.upgradeSystem.spaceHoldStart = 0;
                this.upgradeSystem.confirmUpgrade();
            }
        } else {
            this.spaceHoldStart = 0;
            this.upgradeSystem.spaceHoldStart = 0;
            this.upgradeSystem.resetProgressBar();
        }
    }

    handleGameOverInput() {
        if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
            this.audioSystem.playUIConfirm();
            this.restartGame();
        }

        if (this.spaceKey.isDown) {
            this.spaceHoldStart++;
            if (this.spaceHoldStart >= SPACE_HOLD_DURATION) {
                this.spaceHoldStart = 0;
                this.audioSystem.playUIConfirm();
                this.restartGame();
            }
        } else {
            this.spaceHoldStart = 0;
        }
    }

    updatePauseSelection() {
        const options = document.querySelectorAll('.pause-option');
        options.forEach((option, i) => {
            option.classList.toggle('selected', i === this.selectedPauseOption);
        });
    }

    confirmPauseOption() {
        if (this.selectedPauseOption === 0) {
            this.resumeGame();
        } else {
            this.returnToCharSelect();
        }
    }

    pauseGame() {
        if (this.gamePaused) return;
        this.gamePaused = true;
        this.playerSystem.stopMovement();
        this.selectedPauseOption = 0;
        document.getElementById('pause-overlay').classList.add('active');
        this.updatePauseSelection();
        this.audioSystem.playUIConfirm();
    }

    resumeGame() {
        this.gamePaused = false;
        document.getElementById('pause-overlay').classList.remove('active');
    }

    returnToCharSelect() {
        this.cleanup();
        document.getElementById('pause-overlay').classList.remove('active');
        document.getElementById('hud').style.display = 'none';
        this.scene.stop('HUD');
        this.scene.start('Menu');
    }

    restartGame() {
        this.cleanup();
        document.getElementById('gameover-overlay').classList.remove('active');
        document.getElementById('hud').style.display = 'none';
        this.scene.stop('HUD');
        this.scene.start('Menu');
    }

    cleanup() {
        this.registry.events.off('levelUp', this.onLevelUp, this);
        this.registry.events.off('gameOver', this.onGameOver, this);
        this.registry.events.off('resumeFromLevelUp', this.onResumeFromLevelUp, this);

        // Hide overlays
        document.getElementById('levelup-overlay').classList.remove('active');
        document.getElementById('pause-overlay').classList.remove('active');

        if (this.juiceSystem) this.juiceSystem.destroyDamageNumbers();
        if (this.playerSystem) this.playerSystem.destroy();
        if (this.bombSystem) this.bombSystem.destroy();
        if (this.enemySystem) this.enemySystem.destroy();
        if (this.gemSystem) this.gemSystem.destroy();

        this.gameRunning = false;
        this.gameRunning = false;
        this.gamePaused = false;
    }

    update() {
        if (!this.gameRunning) {
            this.handleGameOverInput();
            return;
        }

        // ESC to pause
        if (Phaser.Input.Keyboard.JustDown(this.escKey) && !this.gamePaused) {
            this.pauseGame();
            return;
        }

        // Pause menu
        const pauseVisible = document.getElementById('pause-overlay').classList.contains('active');
        if (pauseVisible) {
            this.handlePauseInput();
            return;
        }

        // Level up overlay
        const levelUpVisible = document.getElementById('levelup-overlay').classList.contains('active');
        if (levelUpVisible && this.gamePaused) {
            this.handleLevelUpInput();
            return;
        }

        if (this.gamePaused) return;

        // Hit stop
        if (this.juiceSystem.hitStopFrames > 0) {
            this.juiceSystem.hitStopFrames--;
            return;
        }

        this.gameTime++;
        this.registry.set('gameTime', this.gameTime);

        // Update systems
        this.playerSystem.update();
        this.bombSystem.update(this.gameTime);
        this.enemySystem.update(this.gameTime);
        this.gemSystem.update(this.gameTime);
        this.waveSystem.update(this.gameTime);
        this.juiceSystem.update();

        // Bomb placement
        if (this.spaceKey.isDown && !this.gamePaused) {
            this.bombSystem.placeBomb();
        }

        // Storm perk
        const p = this.playerSystem.stats;
        if (p.stormLevel && p.stormLevel > 0 && this.gameTime % 300 === 0) {
            const enemies = this.enemySystem.enemies;
            for (let s = 0; s < p.stormLevel; s++) {
                if (enemies.length > 0) {
                    const target = enemies[Math.floor(Math.random() * enemies.length)];
                    target.hp -= 3;
                    target.flash = 15;
                    this.juiceSystem.spawnDamageNumber(target.x, target.y - TILE * 0.5, '⚡3', '#88eeff');
                    this.juiceSystem.spawnParticles(target.x, target.y, 0x88eeff, 8, 5);
                    this.juiceSystem.screenShake = 4;
                    this.juiceSystem.triggerScreenFlash('rgba(100, 200, 255, 0.15)', 80);
                    if (target.hp <= 0) {
                        const kills = (this.registry.get('kills') || 0) + 1;
                        this.registry.set('kills', kills);
                        this.juiceSystem.addKillStreak();
                        this.gemSystem.handleGemDrop(target.x, target.y, ENEMY_TYPES[target.type].xp);
                        this.juiceSystem.spawnParticles(target.x, target.y,
                            Phaser.Display.Color.HexStringToColor(ENEMY_TYPES[target.type].color).color, 8, 4);
                        if (target.sprite) target.sprite.destroy();
                        target.hp = -999;
                    }
                }
            }
        }

        // Camera shake
        if (this.juiceSystem.screenShake > 0.5) {
            const shakeX = (Math.random() - 0.5) * this.juiceSystem.screenShake * 2;
            const shakeY = (Math.random() - 0.5) * this.juiceSystem.screenShake * 2;
            this.cameras.main.setFollowOffset(shakeX, shakeY);
        } else {
            this.cameras.main.setFollowOffset(0, 0);
        }

        // Render
        this.renderGround();
        this.bombSystem.render(this.gameTime);
        this.enemySystem.render(this.gameTime);
        this.gemSystem.render(this.gameTime);

        // Particles
        this.particleGraphics.clear();
        this.juiceSystem.render(this.particleGraphics, this.cameras.main);
        this.juiceSystem.renderDamageNumbers(this, this.cameras.main);

        // Damage flash overlay
        this.damageOverlay.clear();
        if (this.juiceSystem.damageFlash > 0) {
            this.damageOverlay.fillStyle(0xff0000, this.juiceSystem.damageFlash / 30);
            this.damageOverlay.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
        }

        // Update registry for HUD
        this.registry.set('player', this.playerSystem.stats);
        this.registry.set('activeBombs', this.bombSystem.bombs.length);
    }
}
