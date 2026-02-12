// ===================== BOOT SCENE =====================
class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Boot' });
    }

    preload() {
        // Loading text
        const loadText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            'LOADING...',
            { fontFamily: '"Press Start 2P"', fontSize: '16px', color: '#ffcc00' }
        ).setOrigin(0.5);

        // Progress bar
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        const barW = 320;
        const barH = 20;
        const barX = this.cameras.main.width / 2 - barW / 2;
        const barY = this.cameras.main.height / 2 + 30;
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(barX, barY, barW, barH);

        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0xff8800, 1);
            progressBar.fillRect(barX + 2, barY + 2, (barW - 4) * value, barH - 4);
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadText.destroy();
        });

        // Load character sprite sheets (LPC format: 13 cols x 21 rows, 64x64)
        const characters = ['aussa', 'eria', 'hiita', 'wynn', 'lyna', 'dharc'];
        const charFolders = ['Aussa', 'Eria', 'Hiita', 'Wynn', 'Lyna', 'Dharc'];

        characters.forEach((name, i) => {
            this.load.spritesheet(name, `img/${charFolders[i]}/sprite_universal.png`, {
                frameWidth: 64,
                frameHeight: 64
            });
        });

        // Load portraits
        characters.forEach((name, i) => {
            this.load.image(`portrait_${name}`, `img/${charFolders[i]}/portrait.png`);
        });

        // Load enemy sprites (48 icons)
        for (let i = 1; i <= 48; i++) {
            this.load.image(`enemy_${i}`, `img/Enemys/Icon${i}.png`);
        }
    }

    create() {
        // Create walk animations for all characters
        const characters = ['aussa', 'eria', 'hiita', 'wynn', 'lyna', 'dharc'];
        const directions = { up: 8, left: 9, down: 10, right: 11 };

        characters.forEach(charName => {
            for (const [dir, row] of Object.entries(directions)) {
                // Walk animation
                const walkKey = `${charName}_walk_${dir}`;
                if (!this.anims.exists(walkKey)) {
                    const frames = [];
                    for (let i = 0; i < 9; i++) {
                        frames.push({ key: charName, frame: row * 13 + i });
                    }
                    this.anims.create({
                        key: walkKey,
                        frames: frames,
                        frameRate: 10,
                        repeat: -1
                    });
                }

                // Idle animation
                const idleKey = `${charName}_idle_${dir}`;
                if (!this.anims.exists(idleKey)) {
                    this.anims.create({
                        key: idleKey,
                        frames: [{ key: charName, frame: row * 13 }],
                        frameRate: 1,
                        repeat: 0
                    });
                }
            }
        });

        this.scene.start('Menu');
    }
}
