// ===================== MENU SCENE =====================
class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Menu' });
        this.selectedChar = 0;
        this.spaceHoldStart = 0;
    }

    create() {
        // Show start overlay
        const overlay = document.getElementById('start-overlay');
        overlay.classList.remove('hidden');

        // Hide other overlays
        document.getElementById('gameover-overlay').classList.remove('active');
        document.getElementById('levelup-overlay').classList.remove('active');
        document.getElementById('pause-overlay').classList.remove('active');

        // Show high score
        const highScore = parseInt(localStorage.getItem('bomberVampireHighScore') || '0');
        if (highScore > 0) {
            document.getElementById('start-highscore').textContent = `🏆 High Score: ${highScore}`;
        }

        // Init audio system for menu sounds
        this.audioSystem = new AudioSystem();

        // Build character select cards
        this.initCharSelect();

        // Keyboard input
        this.input.keyboard.on('keydown', this.handleKeyDown, this);

        // Space hold detection
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.spaceHoldStart = 0;
    }

    initCharSelect() {
        const container = document.getElementById('char-select');
        container.innerHTML = '';

        CHARACTERS.forEach((char, idx) => {
            const card = document.createElement('div');
            card.className = 'char-card' + (idx === 0 ? ' selected' : '');

            const portrait = document.createElement('div');
            portrait.className = 'char-portrait';
            portrait.style.backgroundImage = `url('img/${char.portrait}')`;

            const info = document.createElement('div');
            info.className = 'char-info';
            info.innerHTML = `
                <div class="char-name">${char.name}</div>
                <div class="char-subtitle">${char.subtitle}</div>
                <div class="char-desc">${char.desc}</div>
                <div class="char-stats">${char.stats}</div>
            `;

            card.appendChild(portrait);
            card.appendChild(info);
            card.addEventListener('click', () => {
                this.audioSystem.playUIClick();
                this.selectedChar = idx;
                this.updateCharSelection();
            });
            card.addEventListener('dblclick', () => {
                this.selectedChar = idx;
                this.updateCharSelection();
                this.audioSystem.playUIConfirm();
                this.startGame();
            });
            container.appendChild(card);
        });
    }

    updateCharSelection() {
        const cards = document.querySelectorAll('.char-card');
        cards.forEach((card, i) => {
            card.classList.toggle('selected', i === this.selectedChar);
        });
    }

    handleKeyDown(event) {
        if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.LEFT ||
            event.keyCode === Phaser.Input.Keyboard.KeyCodes.A) {
            this.selectedChar = (this.selectedChar - 1 + CHARACTERS.length) % CHARACTERS.length;
            this.updateCharSelection();
            this.audioSystem.playUINavigate();
        } else if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.RIGHT ||
                   event.keyCode === Phaser.Input.Keyboard.KeyCodes.D) {
            this.selectedChar = (this.selectedChar + 1) % CHARACTERS.length;
            this.updateCharSelection();
            this.audioSystem.playUINavigate();
        } else if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.ENTER) {
            this.audioSystem.playUIConfirm();
            this.startGame();
        }
    }

    update() {
        // Space hold detection
        if (this.spaceKey.isDown) {
            this.spaceHoldStart++;
            if (this.spaceHoldStart >= SPACE_HOLD_DURATION) {
                this.spaceHoldStart = 0;
                this.audioSystem.playUIConfirm();
                this.startGame();
            }
        } else {
            this.spaceHoldStart = 0;
        }
    }

    startGame() {
        // Hide start overlay
        document.getElementById('start-overlay').classList.add('hidden');

        // Clean up input
        this.input.keyboard.off('keydown', this.handleKeyDown, this);

        // Start game scene
        this.scene.start('Game', { selectedChar: this.selectedChar });
    }
}
